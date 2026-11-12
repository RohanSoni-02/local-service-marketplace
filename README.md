# Thikana

A mobile-first marketplace for local trades: request a home visit and compare offers from nearby shops, rent tools by the day, borrow things from neighbours against a refundable bond, hold a part at a hardware counter, and pool service requests with your housing society.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions) · React 19 · TypeScript (strict)
- **Tailwind CSS v4** with a small token-based design system (`app/globals.css`, `components/ui`)
- **SQLite via libSQL + Drizzle ORM** — a local file in development, [Turso](https://turso.tech) (free tier) in production
- Phone + password auth with scrypt hashes and server-side sessions (no third-party auth service)
- Leaflet + OpenStreetMap tiles for the map view

## Run it

```bash
pnpm install
pnpm dev
```

`pnpm dev` applies migrations and seeds the launch catalogue into `./data/thikana.db` on first run, then starts the app at http://localhost:3000. Create an account from the sign-in screen.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Migrate/seed if needed, then start the dev server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` / `pnpm typecheck` | ESLint and `tsc --noEmit` |
| `pnpm db:setup` | Apply migrations and seed an empty database |
| `pnpm db:generate` | Generate a migration after editing `lib/db/schema.ts` |

## Deploy (free tier)

1. Create a Turso database and copy its URL and auth token.
2. Set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` and `NEXT_PUBLIC_APP_URL` in your host (see `.env.example`).
3. Run `pnpm db:setup` once with those variables set to migrate and seed.
4. Deploy to Vercel (or any Node host) with `pnpm build`.

A local SQLite file will not work on serverless hosts — the filesystem is read-only — so the Turso variables are required there.

## What is simulated

There is no merchant-side app yet, so nothing would answer a customer's request. `lib/server/simulator.ts` stands in for shops: it decides what they quote, whether they accept a counter-offer, how a job progresses, and sends chat replies and society quotes. Outcomes are written to the database like real ones. Set `SIMULATE_SHOPS=false` once real shops are responding.

Seeded neighbour listings belong to placeholder accounts that cannot sign in, so the simulator also plays the owner's side of those loans (approve, hand over, return the bond). Loans between two real accounts are never simulated.

## Neighbour lending and the bond

Anyone can list an item with a daily price, a refundable bond and an approximate pickup pin (rounded to about 100 m). A borrower requests it, the owner approves, and at pickup the owner types the borrower's 4-digit code to record that the item and bond changed hands. On return the owner either releases the bond in full or keeps part of it with a written reason the borrower can see. The app records the bond; the money itself moves between the two people in cash or UPI. There is no escrow and no dispute mediation yet.

Listing photos are resized in the browser to a small JPEG and stored in the database, so no file-storage service is needed.

## Before a public launch

- Verify phone numbers with an SMS OTP (accounts are currently unverified).
- Build the merchant app, then turn the simulator off.
- Replace the seed catalogue (`lib/db/seed-data.ts`) — shop names, phone numbers and stock are placeholders.
- Add terms of service and a privacy policy.
- Payments and bonds are settled directly between people; add a gateway with escrow if the bond should be held in-app, and a dispute process for contested deductions.
- Add moderation and reporting for neighbour listings.
