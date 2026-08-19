// api/send-reminders.js
// Uruchamiane raz dziennie przez Vercel Cron.
// Znajduje rezerwacje zaczynajace sie JUTRO i wysyla przypomnienia obu stronom.

import { createClient } from '@supabase/supabase-js';

// Minimalny slownik TYLKO dla przypomnien — potrzebny do maili,
// ktore musza byc w jezyku odbiorcy juz w chwili wysylki.
// (Powiadomienia w aplikacji tlumacza sie same z pola `params`.)
const T = {
  pl: {
    'booking_reminder_renter.title': 'Jutro zaczyna się Twoja rezerwacja',
    'booking_reminder_renter.body': 'Pamiętaj o dostarczeniu rośliny "{plant}" do {host} ({date}).',
    'booking_reminder_host.title': 'Jutro przyjmujesz rośliny',
    'booking_reminder_host.body': '{name} dostarczy Ci roślinę "{plant}"{qtySuffix} ({date}).',
    qtySuffix: ' (×{n} szt.)',
    someone: 'Ktoś',
  },
  en: {
    'booking_reminder_renter.title': 'Your booking starts tomorrow',
    'booking_reminder_renter.body': 'Remember to bring the plant "{plant}" to {host} ({date}).',
    'booking_reminder_host.title': 'You are taking in plants tomorrow',
    'booking_reminder_host.body': '{name} will bring you the plant "{plant}"{qtySuffix} ({date}).',
    qtySuffix: ' (×{n} pcs)',
    someone: 'Someone',
  },
  uk: {
    'booking_reminder_renter.title': 'Ваше бронювання починається завтра',
    'booking_reminder_renter.body': 'Не забудьте привезти рослину «{plant}» до {host} ({date}).',
    'booking_reminder_host.title': 'Завтра ви приймаєте рослини',
    'booking_reminder_host.body': '{name} привезе вам рослину «{plant}»{qtySuffix} ({date}).',
    qtySuffix: ' (×{n} шт.)',
    someone: 'Хтось',
  },
};

function render(lang, key, params = {}) {
  const dict = T[lang] || T.pl;
  let str = dict[key] ?? T.pl[key] ?? key;
  Object.keys(params).forEach((p) => {
    str = str.split('{' + p + '}').join(params[p]);
  });
  return str;
}

function buildText(lang, type, params) {
  const p = { ...params };
  if (!p.name) p.name = render(lang, 'someone');
  p.qtySuffix = p.qty && Number(p.qty) > 1 ? render(lang, 'qtySuffix', { n: p.qty }) : '';
  return {
    title: render(lang, type + '.title', p),
    body: render(lang, type + '.body', p),
  };
}

async function sendEmail(to, title, body) {
  if (!to || !process.env.RESEND_API_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Leafsit <noreply@leafsit.com>',
        to,
        subject: title,
        text: body,
      }),
    });
  } catch (e) {
    console.error('Blad wysylki maila przypomnienia:', e);
  }
}

export default async function handler(req, res) {
  // Zabezpieczenie: tylko Vercel Cron (albo ktos z sekretem) moze to uruchomic.
  const auth = req.headers.authorization;
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Brak konfiguracji Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).' });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Data "jutro" w formacie YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, renter_user_id, renter_name, renter_email, plant_name, quantity, start_date, host_id, hosts(user_id, name, email)')
      .eq('status', 'accepted')
      .eq('start_date', tomorrowStr)
      .or('reminder_sent.is.null,reminder_sent.eq.false');

    if (error) {
      console.error('Blad pobierania rezerwacji:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({ ok: true, date: tomorrowStr, sent: 0, message: 'Brak rezerwacji na jutro.' });
    }

    // Jednym zapytaniem pobieramy jezyki i preferencje mailowe wszystkich zainteresowanych.
    const userIds = [];
    bookings.forEach((b) => {
      if (b.renter_user_id) userIds.push(b.renter_user_id);
      if (b.hosts?.user_id) userIds.push(b.hosts.user_id);
    });
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, language, email_notifications')
      .in('id', [...new Set(userIds)]);

    const profileMap = {};
    (profiles || []).forEach((p) => { profileMap[p.id] = p; });

    const notificationsToInsert = [];
    const emailJobs = [];
    const doneBookingIds = [];

    for (const b of bookings) {
      const dateLabel = b.start_date;

      // --- przypomnienie dla wynajmujacego ---
      if (b.renter_user_id) {
        const prof = profileMap[b.renter_user_id];
        const lang = prof?.language && T[prof.language] ? prof.language : 'pl';
        const params = { plant: b.plant_name, host: b.hosts?.name || '', date: dateLabel, qty: b.quantity };
        const txt = buildText(lang, 'booking_reminder_renter', params);
        notificationsToInsert.push({
          user_id: b.renter_user_id,
          type: 'booking_reminder_renter',
          params,
          title: txt.title,
          body: txt.body,
          related_booking_id: b.id,
        });
        if (b.renter_email && prof?.email_notifications !== false) {
          emailJobs.push({ to: b.renter_email, title: txt.title, body: txt.body });
        }
      }

      // --- przypomnienie dla hosta ---
      if (b.hosts?.user_id) {
        const prof = profileMap[b.hosts.user_id];
        const lang = prof?.language && T[prof.language] ? prof.language : 'pl';
        const params = { name: b.renter_name || '', plant: b.plant_name, date: dateLabel, qty: b.quantity };
        const txt = buildText(lang, 'booking_reminder_host', params);
        notificationsToInsert.push({
          user_id: b.hosts.user_id,
          type: 'booking_reminder_host',
          params,
          title: txt.title,
          body: txt.body,
          related_booking_id: b.id,
        });
        if (b.hosts.email && prof?.email_notifications !== false) {
          emailJobs.push({ to: b.hosts.email, title: txt.title, body: txt.body });
        }
      }

      doneBookingIds.push(b.id);
    }

    if (notificationsToInsert.length > 0) {
      const { error: insErr } = await supabase.from('notifications').insert(notificationsToInsert);
      if (insErr) {
        console.error('Blad zapisu powiadomien:', insErr);
        return res.status(500).json({ error: insErr.message });
      }
    }

    // Oznaczamy jako wyslane dopiero PO udanym zapisie powiadomien,
    // zeby przy bledzie sprobowac ponownie nastepnego dnia.
    if (doneBookingIds.length > 0) {
      await supabase.from('bookings').update({ reminder_sent: true }).in('id', doneBookingIds);
    }

    // Maile wysylamy na koncu — ich ewentualny blad nie cofa powiadomien w apce.
    await Promise.all(emailJobs.map((j) => sendEmail(j.to, j.title, j.body)));

    return res.status(200).json({
      ok: true,
      date: tomorrowStr,
      bookings: bookings.length,
      notifications: notificationsToInsert.length,
      emails: emailJobs.length,
    });
  } catch (e) {
    console.error('Blad przypomnien:', e);
    return res.status(500).json({ error: 'Wystapil blad podczas wysylki przypomnien.' });
  }
}
