import Stripe from 'stripe';

function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

async function handlePremium(stripe, req, res) {
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
}

async function handleBooking(stripe, req, res) {
  const {
    bookingId, hostStripeAccountId, hostPricePerDay,
    startDate, endDate, hostName, plantName, quantity, origin,
  } = req.body;

  if (!hostStripeAccountId) {
    return res.status(400).json({ error: 'Host nie ma jeszcze podłączonego konta do wypłat.' });
  }

  const qty = Math.max(1, Number(quantity) || 1);
  const days = daysBetween(startDate, endDate);
  const amountTotal = days * Number(hostPricePerDay) * qty;
  const amountInGrosze = Math.round(amountTotal * 100);
  const commissionInGrosze = Math.round(amountInGrosze * 0.10);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'pln',
        product_data: {
          name: `Rezerwacja u ${hostName} — ${plantName}${qty > 1 ? ` ×${qty}` : ''} (${days} ${days === 1 ? 'dzień' : 'dni'})`,
        },
        unit_amount: amountInGrosze,
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: commissionInGrosze,
      transfer_data: {
        destination: hostStripeAccountId,
      },
    },
    success_url: `${origin}/?booking_paid=1&booking_id=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?booking_payment_cancelled=1`,
  });

  return res.status(200).json({ url: session.url, amountTotal, days });
}

// Konsoliduje: create-checkout.js (Premium) + create-booking-checkout.js (rezerwacja).
// Wywolanie: POST z polem "action": "premium" | "booking".
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { action } = req.body;

    if (action === 'premium') return await handlePremium(stripe, req, res);
    if (action === 'booking') return await handleBooking(stripe, req, res);
    return res.status(400).json({ error: 'Nieznana akcja: ' + action });
  } catch (err) {
    return res.status(500).json({ error: 'Błąd tworzenia płatności: ' + err.message });
  }
}
