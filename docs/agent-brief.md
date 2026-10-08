# Brief for implementation subagents

You are implementing one task in the Menura repo (`C:\Users\Kutbay\Desktop\menura`; in Bash use
`/c/Users/Kutbay/Desktop/menura`). Other agents work in the same tree at the same time on other
folders.

## Before writing code
1. Read `AGENTS.md` (hard rules) and `docs/architecture.md`.
2. Read the files your task builds on: `src/db/schema.ts`, `src/lib/*`, `src/server/session.ts`,
   `src/lib/action-result.ts`, the UI kit in `src/components/ui/` and `src/components/app-shell/`.
3. Reference implementation of the feature pattern: `src/features/restaurant/` (schema, action,
   test) and `src/features/media/`. Copy its style.
4. For Next.js APIs, check `node_modules/next/dist/docs/` (installed version is 16.4).

## Boundaries
- Only create/edit files inside the paths your task lists. If you need a change elsewhere
  (schema, UI kit, package.json, another feature), do not make it: describe it in your report.
  Small additive new files in `src/components/ui/` are allowed if a primitive is missing.
- Never run `bd`, `git commit`, `next build`, `next dev` or `npm install`.
- Do not create docs or README files unless asked.

## Quality
- Server actions: `requireRestaurant()` first, zod parse, tenant-scoped queries, `ActionResult`,
  `revalidatePath` of the dashboard route and `/m/${restaurant.slug}`.
- Client forms: show field errors from `fieldErrors`, disable while pending (`useTransition`),
  toast success/failure with `sonner`, keep focus management sensible.
- Write Vitest integration tests for every server action you add (see
  `src/features/restaurant/actions.test.ts`; helpers in `test/helpers.ts`). Cover tenant isolation:
  tenant B must not be able to read/update/delete tenant A's rows.
- Empty, loading (`loading.tsx` or skeletons) and error states for every page.
- Mobile first; check that layouts work at 360px width.

## Verify, then report
Run from the repo root and fix everything in your files:
`npx tsc --noEmit` · `npx eslint <your paths>` · `npx vitest run <your test files>`
Report (concise): files created/changed, decisions and deviations, requests for changes outside
your scope, and the exact verification results. Errors in files you did not touch: list them, don't fix.
