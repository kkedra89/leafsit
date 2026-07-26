import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { accountId } = req.body;

    const account = await stripe.accounts.retrieve(accountId);

    return res.status(200).json({
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Błąd sprawdzania statusu konta: ' + err.message });
  }
}