# CardNest

CardNest is a trading-card marketplace foundation built with Next.js and Neon Postgres.

## GitHub / Vercel deployment

1. Upload the **contents of this project folder** to the root of your GitHub `Card-Nest` repository.
2. In Vercel, import the GitHub repository.
3. Framework preset: **Next.js**
4. Root Directory: `./`
5. Add `DATABASE_URL` in Vercel Environment Variables using the connection string from the Neon **production** branch.
6. Deploy.

The app intentionally still runs in demo mode when `DATABASE_URL` is absent, so the first Vercel deployment can succeed before the production database is connected.

## Neon

Target project: `muddy-waterfall-70532466`
Target branch: `production`

Run `db/schema.sql` against the production database before enabling real marketplace transactions.

## Important launch boundary

The included marketplace, rewards, AI review, orders, disputes, and legal pages are a production-oriented foundation, not a substitute for final legal review or a live payment processor. Payment/payout operations must remain fail-closed until verified credentials, webhooks, reconciliation, identity controls, and seller onboarding are configured.
