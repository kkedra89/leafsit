import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Brak identyfikatora płatności do zwrotu.' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reverse_transfer: true,
      refund_application_fee: true,
    });

    return res.status(200).json({ refunded: true, refundId: refund.id });
  } catch (err) {
    return res.status(500).json({ error: 'Błąd zwrotu płatności: ' + err.message });
  }
}