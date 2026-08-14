import Stripe from 'stripe';

async function handleVerifyPremium(stripe, req, res) {
  const { sessionId } = req.body;
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    return res.status(200).json({ paid: true });
  }
  return res.status(200).json({ paid: false });
}

async function handleVerifyBooking(stripe, req, res) {
  const { sessionId } = req.body;
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    return res.status(200).json({
      paid: true,
      amountTotal: session.amount_total / 100,
      paymentIntentId: session.payment_intent,
    });
  }
  return res.status(200).json({ paid: false });
}

async function handleRefund(stripe, req, res) {
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
}

// Konsoliduje: verify-payment.js (Premium) + verify-booking-payment.js + refund-booking.js.
// Wywolanie: POST z polem "action": "verify-premium" | "verify-booking" | "refund".
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { action } = req.body;

    if (action === 'verify-premium') return await handleVerifyPremium(stripe, req, res);
    if (action === 'verify-booking') return await handleVerifyBooking(stripe, req, res);
    if (action === 'refund') return await handleRefund(stripe, req, res);
    return res.status(400).json({ error: 'Nieznana akcja: ' + action });
  } catch (err) {
    const isRefund = req.body?.action === 'refund';
    return res.status(500).json({
      error: (isRefund ? 'Błąd zwrotu płatności: ' : 'Błąd sprawdzania płatności: ') + err.message,
    });
  }
}
