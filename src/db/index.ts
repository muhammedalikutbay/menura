import "server-only";
import { createDatabase, type Database } from "./client";

const globalForDb = globalThis as unknown as { menuraDb?: Database };

/**
 * Shared database instance. Uses Postgres when DATABASE_URL is set and an embedded
 * PGlite database under .data/pglite otherwise (local development only).
 *
 * Cached on globalThis in every environment: a production build evaluates this module
 * once per server bundle chunk, and separate instances would mean several connection
 * pools (Postgres) or several diverging copies of the same data directory (PGlite).
 */
export const db: Database = (globalForDb.menuraDb ??= createDatabase(process.env.DATABASE_URL));
