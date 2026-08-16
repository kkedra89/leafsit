// api/weekly-digest.js
// Uruchamiane raz w tygodniu przez Vercel Cron.
// Wysyla kazdemu uzytkownikowi (ktory nie wylaczyl powiadomien email) krotkie
// podsumowanie jego aktywnosci z ostatnich 7 dni w Leafsit.

import { createClient } from '@supabase/supabase-js';

const T = {
  pl: {
    subject: 'Twoje podsumowanie tygodnia w Leafsit 🌿',
    greeting: (name) => `Cześć${name ? ' ' + name : ''}!`,
    requests: (n) => `📩 ${n} ${n === 1 ? 'nowa prośba' : 'nowe prośby'} o rezerwację`,
    responses: (n) => `✅ ${n} ${n === 1 ? 'odpowiedź' : 'odpowiedzi'} na Twoje prośby`,
    reviews: (n) => `⭐ ${n} ${n === 1 ? 'nowa opinia' : 'nowe opinie'}`,
    noActivity: 'W tym tygodniu nie było żadnej nowej aktywności na Twoim koncie — ale w Twojej okolicy wciąż czekają rośliny szukające dobrego opiekuna!',
    cta: 'Sprawdź szczegóły w aplikacji: https://leafsit-ten.vercel.app',
  },
  en: {
    subject: 'Your week at Leafsit 🌿',
    greeting: (name) => `Hi${name ? ' ' + name : ''}!`,
    requests: (n) => `📩 ${n} new booking ${n === 1 ? 'request' : 'requests'}`,
    responses: (n) => `✅ ${n} ${n === 1 ? 'response' : 'responses'} to your requests`,
    reviews: (n) => `⭐ ${n} new ${n === 1 ? 'review' : 'reviews'}`,
    noActivity: "There wasn't any new activity on your account this week — but there are still plants nearby looking for a good sitter!",
    cta: 'Check the details in the app: https://leafsit-ten.vercel.app',
  },
  uk: {
    subject: 'Ваш тиждень у Leafsit 🌿',
    greeting: (name) => `Привіт${name ? ', ' + name : ''}!`,
    requests: (n) => `📩 ${n} ${n === 1 ? 'новий запит' : 'нових запити'} на бронювання`,
    responses: (n) => `✅ ${n} ${n === 1 ? 'відповідь' : 'відповіді'} на ваші запити`,
    reviews: (n) => `⭐ ${n} ${n === 1 ? 'новий відгук' : 'нових відгуки'}`,
    noActivity: 'Цього тижня на вашому акаунті не було нової активності — але поруч усе ще є рослини, що шукають доброго доглядача!',
    cta: 'Перевірте деталі в застосунку: https://leafsit-ten.vercel.app',
  },
};

function buildEmailBody(lang, name, counts) {
  const dict = T[lang] || T.pl;
  const lines = [];
  if (counts.requests > 0) lines.push(dict.requests(counts.requests));
  if (counts.responses > 0) lines.push(dict.responses(counts.responses));
  if (counts.reviews > 0) lines.push(dict.reviews(counts.reviews));

  const body = lines.length > 0
    ? `${dict.greeting(name)}\n\nOto co działo się w ostatnim tygodniu:\n\n${lines.join('\n')}\n\n${dict.cta}`
    : `${dict.greeting(name)}\n\n${dict.noActivity}\n\n${dict.cta}`;

  return { subject: dict.subject, body };
}

async function sendEmail(to, subject, body) {
  if (!to || !process.env.RESEND_API_KEY) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Leafsit <onboarding@resend.dev>',
        to,
        subject,
        text: body,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('Blad wysylki maila podsumowania:', e);
    return false;
  }
}

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Brak konfiguracji Supabase.' });
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Pobieramy wszystkich uzytkownikow (email + jezyk + preferencje) jednym wywolaniem.
    const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authErr) {
      return res.status(500).json({ error: authErr.message });
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, language, email_notifications');
    const profileById = {};
    (profiles || []).forEach((p) => { profileById[p.id] = p; });

    const { data: hosts } = await supabase.from('hosts').select('id, user_id, name');
    const hostByUserId = {};
    const hostById = {};
    (hosts || []).forEach((h) => { hostByUserId[h.user_id] = h; hostById[h.id] = h; });

    let sent = 0;
    let skipped = 0;

    for (const user of authUsers.users) {
      const profile = profileById[user.id];
      if (profile?.email_notifications === false) { skipped++; continue; }
      if (!user.email) { skipped++; continue; }

      const lang = profile?.language && T[profile.language] ? profile.language : 'pl';
      const myHost = hostByUserId[user.id];

      let requestsCount = 0;
      if (myHost) {
        const { count } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('host_id', myHost.id)
          .gte('created_at', weekAgo);
        requestsCount = count || 0;
      }

      const { count: responsesCount } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('renter_user_id', user.id)
        .not('responded_at', 'is', null)
        .gte('responded_at', weekAgo);

      let reviewsCount = 0;
      if (myHost) {
        const { count } = await supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .eq('host_id', myHost.id)
          .gte('created_at', weekAgo);
        reviewsCount = count || 0;
      }

      const counts = { requests: requestsCount, responses: responsesCount || 0, reviews: reviewsCount };
      const displayName = user.user_metadata?.full_name || '';
      const { subject, body } = buildEmailBody(lang, displayName, counts);
      const ok = await sendEmail(user.email, subject, body);
      if (ok) sent++;
    }

    return res.status(200).json({ ok: true, sent, skipped, total: authUsers.users.length });
  } catch (e) {
    console.error('Blad weekly-digest:', e);
    return res.status(500).json({ error: 'Wystapil blad podczas wysylki podsumowania tygodniowego.' });
  }
}
