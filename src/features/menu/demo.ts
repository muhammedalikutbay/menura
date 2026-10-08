import "server-only";
import { and, eq } from "drizzle-orm";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/db";
import { restaurant } from "@/db/schema";

export const DEMO_SLUG = "demo";

/** True when the seeded demo menu exists and is published (it is optional in production). */
export const hasDemoMenu = cache(async (): Promise<boolean> => {
  // Read at request time: the demo is seeded after deploy, and builds have no database.
  await connection();
  const [row] = await db
    .select({ id: restaurant.id })
    .from(restaurant)
    .where(and(eq(restaurant.slug, DEMO_SLUG), eq(restaurant.isPublished, true)))
    .limit(1);
  return Boolean(row);
});
