# Menura v2 — Architecture

## 1. Audit of v1 (internship build)

| Area | Problem | Impact |
|---|---|---|
| Data | All data in the owner's `localStorage` | A guest scanning the QR sees an empty menu: the product does not work |
| Tenancy | Single global menu, no accounts | Not usable by more than one restaurant |
| Auth | None; anyone can edit | Not deployable |
| Public menu | Admin topbar rendered on the guest menu | Guests see admin navigation |
| Public menu | Active category pill white on white | Selected category is invisible |
| Dashboard | "QR Scans 2.465" hard-coded | Fake metric |
| Seeding | `DataInitializer` re-seeds and reloads the page when data is empty | Deleting everything brings demo data back |
| Money | Prices as floats, rendered as `110₺` without locale formatting | Rounding and display errors |
| Language | Mixed English/Turkish UI ("Overview", "Search flavors") | Inconsistent product |
| Code | Duplicated components (`app/_components/qr` and `app/qr/_components`), page-level `"use client"` everywhere, no validation, no tests | Hard to maintain |
| Images | Hot-linked Unsplash URLs or base64 in storage | Breaks, bloats storage |

Conclusion: v1 is a UI prototype. v2 keeps the Apple-like visual language and rebuilds the product.

## 2. Decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript strict | Already in use; server components + server actions remove the need for a separate API |
| Database | PostgreSQL via Drizzle ORM | Portable (Neon, Supabase, RDS, self-hosted); typed queries; SQL migrations |
| Local DB | PGlite (embedded Postgres, WASM) when `DATABASE_URL` is unset | Zero-setup dev and tests, same SQL dialect as production; no Docker needed |
| Auth | Better Auth (email + password), Drizzle adapter, DB-backed rate limit | Maintained, self-hosted, no vendor lock-in |
| Tenancy | One restaurant per user (v1 scope); every row carries `restaurantId`; every query is scoped by the session's restaurant | Simple and safe; can grow to memberships later |
| Images | Uploaded through a server action, decoded and re-encoded with `sharp` (WebP, max 1600 px), stored in a `media` table, served by `/media/[id]` with immutable caching | No extra storage vendor; re-encoding strips EXIF and rejects non-images |
| Money | Integer minor units (kuruş) + ISO currency on the restaurant; `Intl.NumberFormat("tr-TR")` | No float errors |
| Public menu | `/m/[slug]`, server rendered, one scrolling page with sticky category nav and scroll-spy | Fast on phones, shareable, SEO-friendly |
| Analytics | Daily view counter (`menu_view_daily`) incremented by a beacon, deduplicated per browser session | Honest metric replacing the fake one |
| Validation | Zod schemas shared by forms and server actions | One source of truth |
| UI language | Turkish UI; all code identifiers and comments in English | Target market; project rule |
| Hosting | Netlify (current) or any Node host; Postgres from Neon | Existing deployment |

## 3. Out of scope for this release (roadmap)

- Multiple users per restaurant (staff roles), multiple branches per account
- Multilingual menus (per-item translations)
- Online ordering / payments
- Custom domains
