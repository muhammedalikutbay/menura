import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import type { Database } from "./client";

export const MIGRATIONS_FOLDER = "./drizzle";

export async function runMigrations(db: Database, url: string | undefined) {
  if (url && /^postgres(ql)?:\/\//.test(url)) {
    await migratePostgres(db, { migrationsFolder: MIGRATIONS_FOLDER });
  } else {
    // PGlite exposes the same migrator contract under a different driver type.
    await migratePglite(db as never, { migrationsFolder: MIGRATIONS_FOLDER });
  }
}
