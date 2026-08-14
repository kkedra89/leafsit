// api/send-push.js
// Wysyla powiadomienie push na wszystkie zarejestrowane urzadzenia danego uzytkownika.
// Wywolywane "w tle" przez createNotification() w App.jsx - jego ewentualny
// blad NIE przerywa zapisu powiadomienia w aplikacji ani wysylki maila.

import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

function getFirebaseApp() {
  if (admin.apps.length > 0) return admin.apps[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('Brak zmiennej FIREBASE_SERVICE_ACCOUNT');
  const serviceAccount = JSON.parse(raw);

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, title, body } = req.body || {};
    if (!userId || !title) {
      return res.status(400).json({ error: 'Brak userId lub title' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Brak konfiguracji Supabase.' });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('id, token')
      .eq('user_id', userId);

    if (error) {
      console.error('Blad pobierania tokenow push:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!tokens || tokens.length === 0) {
      // Normalna sytuacja - uzytkownik moze nie miec zainstalowanej apki mobilnej.
      return res.status(200).json({ ok: true, sent: 0, message: 'Brak zarejestrowanych urzadzen.' });
    }

    getFirebaseApp();

    let sent = 0;
    const deadTokenIds = [];

    await Promise.all(
      tokens.map(async (t) => {
        try {
          await admin.messaging().send({
            token: t.token,
            notification: { title, body: body || '' },
          });
          sent += 1;
        } catch (e) {
          // Token wygasl / apka odinstalowana - oznaczamy do usuniecia, nie traktujemy jako blad calej operacji.
          if (
            e?.code === 'messaging/registration-token-not-registered' ||
            e?.code === 'messaging/invalid-registration-token'
          ) {
            deadTokenIds.push(t.id);
          } else {
            console.error('Blad wysylki push:', e?.message || e);
          }
        }
      })
    );

    if (deadTokenIds.length > 0) {
      await supabase.from('push_tokens').delete().in('id', deadTokenIds);
    }

    return res.status(200).json({ ok: true, sent, removed: deadTokenIds.length });
  } catch (e) {
    console.error('Blad send-push:', e);
    return res.status(500).json({ error: 'Wystapil blad podczas wysylki push.' });
  }
}
