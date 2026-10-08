# Deployment

Menura needs a Node.js host for Next.js and a PostgreSQL database. The reference setup is
**Netlify + Neon** (both have free tiers); any Node host (Vercel, Render, Fly, a VPS) and any
Postgres 15+ work the same way.

## 1. Database (Neon)
1. Create a project at https://neon.tech (region close to your users, e.g. Frankfurt).
2. Copy the **pooled** connection string (host contains `-pooler`) with `sslmode=require`.

## 2. Environment variables
| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Pooled Postgres URL |
| `BETTER_AUTH_SECRET` | yes | 32+ random chars: `openssl rand -base64 32` |
| `APP_URL` | yes* | Public URL without trailing slash, e.g. `https://menuratnc.netlify.app`. QR codes encode `APP_URL/m/<slug>`, so set the final domain before printing QR codes. *On Netlify it defaults to the site URL. |
| `RESEND_API_KEY` | no | Enables password-reset emails. Without it the "Şifremi unuttum" link is hidden. |
| `EMAIL_FROM` | with Resend | Sender on a domain verified in Resend |
| `DATABASE_POOL_MAX` | no | Connections per server instance (default 5) |

## 3. Netlify
`netlify.toml` is included: the build runs `npm run db:migrate && npm run build`, so schema
migrations are applied on every deploy before the new code goes live.
1. Netlify → Site configuration → Environment variables: add the variables above.
2. Deploy the branch. The Next.js runtime is detected automatically.
3. Optional demo menu: run once from your machine
   `DATABASE_URL="<url>" npm run db:seed` → creates `/m/demo`.

## 4. After the first deploy
- Register an account, create a restaurant, publish it and open `/m/<slug>` on a phone.
- Check response headers (CSP, HSTS) with your browser's network tab.

## Operations
- **Migrations**: change `src/db/schema.ts` → `npm run db:generate` → commit `drizzle/`. Deploys apply them.
- **Backups**: Neon keeps point-in-time history (7 days on the free plan); upgrade for longer retention.
- **Images** live in the `media` table (WebP, ≤1600 px, typically 50–200 KB each). They are served
  with `Cache-Control: immutable`, so the CDN absorbs repeat traffic.
- **Rate limiting** of sign-in/sign-up/password reset is stored in the database (`rate_limit`).
