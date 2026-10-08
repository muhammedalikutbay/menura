import "server-only";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { restaurant, type Restaurant } from "@/db/schema";
import { auth } from "./auth";

/** Current Better Auth session, memoized per request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export const getRestaurantForUser = cache(async (userId: string): Promise<Restaurant | null> => {
  const [row] = await db.select().from(restaurant).where(eq(restaurant.ownerId, userId)).limit(1);
  return row ?? null;
});

/** Signed-in user or a redirect to the login page. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

/**
 * Signed-in user together with the restaurant they own. Every dashboard page and
 * every mutation goes through this; all domain queries must be scoped by `restaurant.id`.
 */
export async function requireRestaurant() {
  const user = await requireUser();
  const owned = await getRestaurantForUser(user.id);
  if (!owned) redirect("/onboarding");
  return { user, restaurant: owned };
}
