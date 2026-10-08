import "server-only";
import { createDatabase, type Database } from "./client";

const globalForDb = globalThis as unknown as { menuraDb?: Database };

/**
 * Shared database instance. Uses Postgres when DATABASE_URL is set and an embedded
 * PGlite database under .data/pglite otherwise (local development only).
 */
export const db: Database = globalForDb.menuraDb ?? createDatabase(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") globalForDb.menuraDb = db;
