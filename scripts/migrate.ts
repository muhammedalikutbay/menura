import { createDatabase } from "../src/db/client";
import { runMigrations } from "../src/db/migrate";

const url = process.env.DATABASE_URL;
const db = createDatabase(url);
await runMigrations(db, url);
console.info(`Migrations applied (${url ? "Postgres" : "PGlite .data/pglite"}).`);
process.exit(0);
