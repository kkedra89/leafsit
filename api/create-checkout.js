import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { plantName, sunlight, origin } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'pln',
          product_data: {
            name: `Przewodnik Premium: ${plantName}`,
          },
          unit_amount: 900,
        },
        quantity: 1,
      }],
      success_url: `${origin}/?premium_paid=1&plant=${encodeURIComponent(plantName)}&sunlight=${encodeURIComponent(sunlight)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?premium_cancelled=1`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: 'Błąd tworzenia płatności: ' + err.message });
  }
}