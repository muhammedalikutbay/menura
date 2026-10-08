# Menura — agent instructions

Menura is a multi-tenant QR menu SaaS: a restaurant owner signs up, builds a menu in
`/dashboard`, and guests open it at `/m/<slug>` by scanning a QR code.
Architecture and decisions: `docs/architecture.md`. Read it before structural changes.

## Stack (do not swap without a recorded decision)
- Next.js 16 App Router, React 19 (React Compiler on), TypeScript strict
- Tailwind CSS 4 (tokens in `src/app/globals.css`), `radix-ui` primitives, `lucide-react` icons, `sonner` toasts
- Design language: `docs/design/design-language.md` (authoritative; light only, `type-*` typography utilities, tokens only)
- PostgreSQL + Drizzle ORM. No `DATABASE_URL` → embedded PGlite at `.data/pglite` (dev) / `memory://` (tests)
- Better Auth (email + password), config in `src/server/auth.ts`
- Zod 4 for every input; Vitest for unit/integration; Playwright for e2e
- Next.js docs for the installed version live in `node_modules/next/dist/docs/` — check them
  instead of relying on memory (Next 16: `proxy.ts` replaces middleware, `params` are Promises).
  Cache Components are NOT enabled; pages read the DB per request. A server component that
  queries the DB on a page without other dynamic APIs must `await connection()` (next/server)
  first, otherwise `next build` tries to prerender it against an empty database.

## Commands
`npm run dev` (starts the PGlite socket server on :5433 and Next.js against it) · `npm run check` (lint + typecheck + test + build) · `npm run db:generate`
after schema changes · `npm run db:migrate` · `npm run db:seed` (demo restaurant, slug `demo`).
PGlite is single-process: never open `.data/pglite` from two processes (it corrupts). While
`npm run dev` runs, point scripts at the socket server:
`DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/postgres npm run db:seed`.

## Layout
```
src/app/            routes only (thin): (marketing), (auth), onboarding, dashboard, m/[slug], media/[id], api
src/features/<x>/   domain modules: schema.ts (zod), queries.ts (server-only reads),
                    actions.ts ("use server" mutations), components/ (feature UI)
src/components/ui/  design-system primitives (no domain knowledge)
src/components/     shared composites (app shell, empty states, ...)
src/db/             schema.ts, client, migrations runner
src/server/         server-only infrastructure: auth, session, env, email
src/lib/            pure helpers usable on both sides (money, text, cn, menu-attributes)
drizzle/            generated SQL migrations (commit them; never edit applied ones)
```

### Routes
```
/dashboard              Genel bakış (overview)
/dashboard/menu         Menü: categories and products on one page; editor sheet via
                        ?product=<id> or ?new=product&category=<id>
/dashboard/restaurant   Restoran: profile, contact, Wi-Fi
/dashboard/appearance   Görünüm: publish, menu address, theme color, currency, VAT note, live preview
/dashboard/qr           QR kod (+ /print)
/dashboard/account      Hesap (from the avatar menu)
/m/[slug]               Guest menu (MenuView mode="page")
```
Old `/dashboard/categories`, `/dashboard/products` (`/new`, `/:id`) and `/dashboard/settings` are
permanent redirects in `next.config.ts`. Do not recreate pages at those paths.

## Hard rules
1. **Code is English, UI is Turkish.** All identifiers, file names and comments in English;
   every user-visible string in Turkish (proper Turkish characters, sentence case).
2. **Tenant isolation.** Every dashboard page and server action starts with
   `const { restaurant } = await requireRestaurant()` (`src/server/session.ts`). Every query on a
   domain table filters by `restaurantId = restaurant.id`, including updates and deletes
   (`where(and(eq(t.id, id), eq(t.restaurantId, restaurant.id)))`). Never trust ids from the client.
   Foreign ids sent by the client (e.g. `categoryId`, `imageMediaId`) must be verified to belong
   to the same restaurant.
3. **Validate on the server.** Server actions parse input with the feature's zod schema and return
   `ActionResult` (`src/lib/action-result.ts`); they never throw for user errors. Forms may reuse
   the same schema client-side.
4. **Money** is integer minor units. Convert only with `src/lib/money.ts`.
5. **Server-only modules** (`queries.ts`, `src/server/*`, `src/db/index.ts`) start with
   `import "server-only"`. Client components never import them.
6. Prefer Server Components; add `"use client"` only to the interactive leaf.
7. After a mutation call `revalidatePath` for the affected dashboard route(s) and
   `revalidatePath(\`/m/${restaurant.slug}\`)`.
8. No fake data in the product UI. Demo content lives only in `scripts/seed.ts`.
9. Accessibility: semantic elements, labels on every input, visible focus, `aria-*` on custom
   controls, color contrast AA, touch targets ≥ 44px on the public menu.
10. Process-wide singletons (DB client, pools, caches) are stored on `globalThis` in every
    environment: production builds evaluate a module once per server chunk (see mnr-58i.9).
11. Do not add dependencies without a reason written in the task result. Do not edit
    `package.json`, `src/db/schema.ts` or `drizzle/` unless the task says so.
12. UI work follows `docs/design/*.md`. Reuse `MenuView` for any menu rendering (page or embedded)
    instead of duplicating guest menu markup.

## Task tracking
Beads (`bd`), see the `beads-workflow` skill. Only the main session writes to `bd`;
subagents report results back instead.
Everything in Beads (titles, descriptions, board comments) is exported to `.beads/issues.jsonl`
and committed to a public repo: never write secrets, connection strings or passwords there.
Netlify's secret scanning fails the deploy if a configured secret appears in the repo (mnr-58i.12).
