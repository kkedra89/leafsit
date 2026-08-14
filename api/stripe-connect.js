import Stripe from 'stripe';

async function handleCreate(stripe, req, res) {
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
}

async function handleStatus(stripe, req, res) {
  const { accountId } = req.body;
  const account = await stripe.accounts.retrieve(accountId);

  return res.status(200).json({
    chargesEnabled: account.charges_enabled,
    detailsSubmitted: account.details_submitted,
  });
}

// Konsoliduje: create-connect-account.js + check-connect-status.js.
// Wywolanie: POST z polem "action": "create" | "status".
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { action } = req.body;

    if (action === 'create') return await handleCreate(stripe, req, res);
    if (action === 'status') return await handleStatus(stripe, req, res);
    return res.status(400).json({ error: 'Nieznana akcja: ' + action });
  } catch (err) {
    const isStatus = req.body?.action === 'status';
    return res.status(500).json({
      error: (isStatus ? 'Błąd sprawdzania statusu konta: ' : 'Błąd tworzenia konta Stripe: ') + err.message,
    });
  }
}
