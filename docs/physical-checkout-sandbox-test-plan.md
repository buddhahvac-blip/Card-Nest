# Physical checkout sandbox validation (not production)
This feature remains gated behind PHYSICAL_CHECKOUT_TEST_ENABLED=true, PHYSICAL_CHECKOUT_TEST_DATABASE_APPROVED=true, Stripe sk_test_ key, test-mode configuration, owner authentication, and separate Stripe physical webhook signing secret.

## Prerequisites
- Use a disposable isolated Neon test branch/database, never the production database.
- Review and manually apply the proposed physical ledger migration in the test database only.
- Initialize physical_stock rows in the test database from approved quantities, without copying production orders or credentials.
- Configure Stripe test webhook endpoint /api/physical/webhook for checkout.session.completed, checkout.session.async_payment_succeeded and checkout.session.expired. Set STRIPE_PHYSICAL_WEBHOOK_SECRET from that endpoint.
- Confirm Stripe test-mode key and endpoint; do not enable live payment mode.

## Test matrix
1. Reserve one of five anniversary ETBs using the owner-only test checkout; expect available=4, reserved=1, sold=0.
2. Complete Stripe sandbox payment; signed webhook should set paid and available=4, reserved=0, sold=1.
3. Replay the same event and a new completed event for the same session; sold must remain 1.
4. Start another test checkout; expire the Stripe Checkout Session using the Stripe test API. Confirm expired/unpaid directly from Stripe; signed expired event releases reservation once.
5. Replay expiration; stock remains unchanged.
6. Browser cancel redirect alone must NOT release stock; the Stripe session may still be payable. Recovery occurs after verified session expiration.
7. Incorrect amount, currency, payment status, session ID, signature or mode must not change stock.
8. Refund/dispute workflow is NOT complete. Flag for manual review; do not automatically restock.
9. Verify no digital pack checkout or production stock was affected.

## Known blockers
- These are planned checks; no live Stripe sandbox transactions or DB integration runs have been executed.
- Checkout-session creation failure can strand a reservation; implement cleanup/reconciliation before rollout.
- Current stock initialization and expired-session reconciliation job are not implemented.
- Shipping, taxes, packaging/fees and profit-floor checks are not wired to checkout.
- Do not merge, deploy or enable checkout until the founder separately approves and test evidence is available.
