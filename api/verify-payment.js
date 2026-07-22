import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return res.status(200).json({ paid: true });
    }
    return res.status(200).json({ paid: false });
  } catch (err) {
    return res.status(500).json({ error: 'Błąd sprawdzania płatności: ' + err.message });
  }
}