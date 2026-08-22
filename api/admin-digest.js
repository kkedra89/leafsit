// api/admin-digest.js
// Codzienny "nadzorczy" raport TYLKO dla Ciebie (zalozyciela) - laczy stan
// techniczny (Sentry, Vercel, dostepnosc strony) i aktywnosc biznesowa
// (nowe rezerwacje, nowi hostowie, nowi uzytkownicy) w jednym mailu.
//
// WYMAGANE nowe zmienne srodowiskowe (oprocz juz istniejacych):
//   SENTRY_AUTH_TOKEN   - Sentry -> Settings -> Auth Tokens (uprawnienia: project:read, event:read)
//   VERCEL_API_TOKEN    - Vercel -> Account Settings -> Tokens -> Create Token
//   VERCEL_PROJECT_ID   - Vercel -> Project Settings -> General -> Project ID
//   ADMIN_EMAIL         - Twoj wlasny adres email, na ktory ma przychodzic ten raport

import { createClient } from '@supabase/supabase-js';

async function checkSentry() {
  const token = process.env.SENTRY_AUTH_TOKEN;
  if (!token) return { ok: false, note: 'Brak SENTRY_AUTH_TOKEN - pomijam.' };
  try {
    const res = await fetch(
      'https://sentry.io/api/0/projects/leafsit/javascript-react/issues/?query=is%3Aunresolved&statsPeriod=24h',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return { ok: false, note: `Sentry API blad: ${res.status}` };
    const issues = await res.json();
    return {
      ok: true,
      unresolvedCount: issues.length,
      titles: issues.slice(0, 5).map((i) => i.title),
    };
  } catch (e) {
    return { ok: false, note: 'Sentry API blad: ' + e.message };
  }
}

async function checkVercel() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return { ok: false, note: 'Brak VERCEL_API_TOKEN lub VERCEL_PROJECT_ID - pomijam.' };
  try {
    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1&target=production`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return { ok: false, note: `Vercel API blad: ${res.status}` };
    const data = await res.json();
    const latest = data.deployments?.[0];
    return {
      ok: true,
      state: latest?.readyState || 'unknown',
      created: latest?.createdAt ? new Date(latest.createdAt).toLocaleString('pl-PL') : null,
    };
  } catch (e) {
    return { ok: false, note: 'Vercel API blad: ' + e.message };
  }
}

async function checkUptime() {
  try {
    const start = Date.now();
    const res = await fetch('https://leafsit.com', { method: 'GET' });
    const ms = Date.now() - start;
    return { ok: res.ok, status: res.status, ms };
  } catch (e) {
    return { ok: false, note: 'Strona niedostepna: ' + e.message };
  }
}

async function getBusinessMetrics(supabase, since) {
  const [profilesRes, bookingsRes, acceptedRes, hostsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('created_at', since),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'accepted').gte('responded_at', since),
    supabase.from('hosts').select('id', { count: 'exact', head: true }).gte('created_at', since),
  ]);
  return {
    newUsers: profilesRes.count || 0,
    newBookings: bookingsRes.count || 0,
    acceptedBookings: acceptedRes.count || 0,
    newHosts: hostsRes.count || 0,
  };
}

function buildEmailBody({ sentry, vercel, uptime, metrics }) {
  const lines = [];

  lines.push('=== STAN TECHNICZNY ===');
  if (uptime.ok) {
    lines.push(`✅ Strona dziala (${uptime.status}, ${uptime.ms} ms)`);
  } else {
    lines.push(`🔴 UWAGA: strona moze nie dzialac! ${uptime.note || ''}`);
  }

  if (sentry.ok) {
    if (sentry.unresolvedCount > 0) {
      lines.push(`🟡 Sentry: ${sentry.unresolvedCount} nierozwiazanych bledow z ostatnich 24h`);
      sentry.titles.forEach((t) => lines.push(`   - ${t}`));
    } else {
      lines.push('✅ Sentry: brak nowych bledow z ostatnich 24h');
    }
  } else {
    lines.push(`ℹ️ Sentry: ${sentry.note}`);
  }

  if (vercel.ok) {
    const stateEmoji = vercel.state === 'READY' ? '✅' : vercel.state === 'ERROR' ? '🔴' : '🟡';
    lines.push(`${stateEmoji} Vercel: ostatnie wdrozenie produkcyjne - ${vercel.state} (${vercel.created || 'brak daty'})`);
  } else {
    lines.push(`ℹ️ Vercel: ${vercel.note}`);
  }

  lines.push('');
  lines.push('=== AKTYWNOSC BIZNESOWA (ostatnie 24h) ===');
  lines.push(`👤 Nowi uzytkownicy: ${metrics.newUsers}`);
  lines.push(`📩 Nowe prosby o rezerwacje: ${metrics.newBookings}`);
  lines.push(`✅ Zaakceptowane rezerwacje: ${metrics.acceptedBookings}`);
  lines.push(`🌿 Nowi hostowie: ${metrics.newHosts}`);

  return lines.join('\n');
}

async function sendEmail(to, body) {
  if (!to || !process.env.RESEND_API_KEY) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Leafsit <noreply@leafsit.com>',
        to,
        subject: `📊 Leafsit - raport dzienny (${new Date().toLocaleDateString('pl-PL')})`,
        text: body,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('Blad wysylki raportu:', e);
    return false;
  }
}

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return res.status(500).json({ error: 'Brak ADMIN_EMAIL w zmiennych srodowiskowych.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Brak konfiguracji Supabase.' });
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [sentry, vercel, uptime, metrics] = await Promise.all([
      checkSentry(),
      checkVercel(),
      checkUptime(),
      getBusinessMetrics(supabase, since),
    ]);

    const body = buildEmailBody({ sentry, vercel, uptime, metrics });
    const sent = await sendEmail(adminEmail, body);

    return res.status(200).json({ ok: true, sent, sentry, vercel, uptime, metrics });
  } catch (e) {
    console.error('Blad admin-digest:', e);
    return res.status(500).json({ error: 'Wystapil blad podczas generowania raportu.' });
  }
}
