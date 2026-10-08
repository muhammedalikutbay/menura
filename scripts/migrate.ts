import { createDatabase } from "../src/db/client";
import { runMigrations } from "../src/db/migrate";

const url = process.env.DATABASE_URL;
// On a hosting build (Netlify sets NETLIFY=true, most CIs set CI) a missing DATABASE_URL must
// fail the deploy; otherwise migrations would run against a throwaway local PGlite and the
// release would go live without a database.
if (!url && (process.env.NETLIFY || process.env.VERCEL || process.env.RENDER)) {
  console.error("DATABASE_URL is not set. Configure it in the hosting provider's environment variables (see docs/deployment.md).");
  process.exit(1);
}

const db = createDatabase(url);
await runMigrations(db, url);
console.info(`Migrations applied (${url ? "Postgres" : "PGlite .data/pglite"}).`);
process.exit(0);
