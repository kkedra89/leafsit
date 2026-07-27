import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { to, title, body } = req.body;

    if (!to || !title) {
      return res.status(400).json({ error: 'Brak adresu email lub tytułu.' });
    }

    const { error } = await resend.emails.send({
      from: 'Leafsit <onboarding@resend.dev>',
      to: [to],
      subject: title,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #232017;">
          <h2 style="color: #3A5A40;">${title}</h2>
          <p>${body || ''}</p>
          <p style="margin-top: 24px; font-size: 12px; color: #A9A08B;">Leafsit — powiadomienie z aplikacji</p>
        </div>
      `,
    });

    if (error) {
      return res.status(500).json({ error: 'Błąd wysyłki maila: ' + error.message });
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    return res.status(500).json({ error: 'Błąd wysyłki maila: ' + err.message });
  }
}