# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

- `pnpm dev` — migrate/seed the local database if needed, then start the dev server at http://localhost:3000
- `pnpm build` / `pnpm start` — production build and server
- `pnpm lint` — ESLint (flat config, `eslint-config-next`)
- `pnpm typecheck` — `tsc --noEmit`; type errors also fail the build
- `pnpm db:generate` — generate a Drizzle migration after changing `lib/db/schema.ts`
- `pnpm db:setup` — apply migrations and seed an empty database

## Structure

- `app/` — App Router routes
  - `(tabs)/` — screens with the bottom nav: home, `bookings`, `rentals`, `society`, `chat`, `profile`
  - `(auth)/` — `login`, `signup`
  - `category/[id]`, `shop/[id]`, `shop/[id]/book`, `shop/[id]/rent/[toolId]`
  - `booking/[id]`, `rental/[id]`, `reservation/[id]`, `chat/[id]`, `search`, `help`
- `components/` — feature components; `components/ui/` — primitives (Button, Field, Sheet, Segmented, TopBar, misc)
- `lib/db/` — Drizzle schema, client, seed data · `drizzle/` — generated SQL migrations (commit these)
- `lib/server/` — server-only reads and domain logic (`import "server-only"`)
- `lib/actions/` — Server Actions (`"use server"`), validated with zod
- `lib/catalog.ts` — static categories, issue types, service area · `lib/format.ts` — INR, dates (IST), distance

## Architecture notes

- **Data**: SQLite through libSQL. `TURSO_DATABASE_URL` unset → local file `./data/thikana.db`. Pages read via `lib/server/*` in Server Components; mutations go through `lib/actions/*`.
- **Auth**: phone + password. `getUser()` / `requireUser(returnTo)` in `lib/server/auth.ts`. Every action re-checks the session and scopes queries by `userId`.
- **Shop simulator**: there is no merchant app, so `lib/server/simulator.ts` decides how shops respond (offers, counters, job progress, chat replies, society quotes). It is pure; `lib/server/bookings.ts`, `chat.ts` and `society.ts` apply outcomes lazily when data is read. `SIMULATE_SHOPS=false` disables it.
- **Live screens** poll with `<AutoRefresh />` (`router.refresh()` on an interval) rather than websockets.
- **Concurrency**: state changes use guarded updates (`WHERE status = …`) and unique keys so racing requests can't double-apply.
- **Time**: render timestamps with `lib/format.ts` (fixed to Asia/Kolkata) so server and client output match. Don't call `Date.now()` in a component body; take the time from the data layer.

## Design system

- Tokens live in `@theme` in `app/globals.css`: warm paper neutrals (`background`, `surface`, `sunken`, `line`), `ink` text scale, `brand` green for actions, `marigold` for ratings and gold-tier marks only, `danger`.
- Type: Bricolage Grotesque (`font-display`, headings) and Onest (body), self-hosted via `@fontsource-variable`.
- Motion: `ease-out-quint`, under 500ms, transform/opacity only. Use `pressable` for press feedback, `animate-rise` / `stagger` for entrances. Reduced motion is honoured globally.
- Layout is a single centred column (`max-w-[30rem]`); fixed bars use the `app-fixed` utility. Flow screens use `<TopBar>` + `<ActionBar>`; confirmations and short forms use `<Sheet>`.
- `buttonClass()` (in `components/ui/button-class.ts`) styles links as buttons and is safe to call from Server Components.

## Conventions

- Files kebab-case, components PascalCase, `@/` alias for imports.
- Default exports for route files, named exports elsewhere.
- Server Actions return `FormState` (forms, via `useActionState`) or `ActionResult` (buttons, via `useAction`).
