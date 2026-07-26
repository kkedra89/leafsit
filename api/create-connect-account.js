import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { hostId, existingAccountId, email, origin } = req.body;

    let accountId = existingAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/?connect_refresh=1`,
      return_url: `${origin}/?connect_return=1`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url, accountId });
  } catch (err) {
    return res.status(500).json({ error: 'Błąd tworzenia konta Stripe: ' + err.message });
  }
}