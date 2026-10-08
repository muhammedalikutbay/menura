import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

export const LOCAL_PGLITE_DIR = ".data/pglite";

/**
 * Creates a Drizzle client. Both drivers speak the same Postgres dialect, so the
 * PGlite client is exposed with the postgres-js type to keep call sites uniform.
 * Pass "memory://" to get a throwaway in-memory database (tests).
 */
export function createDatabase(url: string | undefined): Database {
  if (url && /^postgres(ql)?:\/\//.test(url)) {
    const client = postgres(url, { max: Number(process.env.DATABASE_POOL_MAX ?? 5), prepare: false });
    return drizzlePostgres(client, { schema, casing: "snake_case" });
  }
  if (process.env.NODE_ENV === "production" && !url) {
    // `next build` evaluates route modules without a database; nothing is queried then.
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      throw new Error("DATABASE_URL must be set in production.");
    }
    url = "memory://";
  }
  const dataDir = url === "memory://" ? undefined : (url ?? LOCAL_PGLITE_DIR);
  if (dataDir) mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  return drizzlePglite(client, { schema, casing: "snake_case" }) as unknown as Database;
}
