import { vi } from "vitest";
import { db } from "@/db";
import { restaurant, user, type Restaurant } from "@/db/schema";

type SessionUser = { id: string; name: string; email: string };

/** The tenant that requireRestaurant() returns in the current test. */
export const currentTenant: { user: SessionUser | null; restaurant: Restaurant | null } = {
  user: null,
  restaurant: null,
};

/**
 * Call at the top of a test file (before importing actions) to make
 * requireUser()/requireRestaurant() resolve to `currentTenant`:
 *
 *   vi.mock("@/server/session", () => sessionMock());
 */
export function sessionMock() {
  return {
    getSession: vi.fn(async () => (currentTenant.user ? { user: currentTenant.user } : null)),
    requireUser: vi.fn(async () => {
      if (!currentTenant.user) throw new Error("NEXT_REDIRECT:/login");
      return currentTenant.user;
    }),
    requireRestaurant: vi.fn(async () => {
      if (!currentTenant.user) throw new Error("NEXT_REDIRECT:/login");
      if (!currentTenant.restaurant) throw new Error("NEXT_REDIRECT:/onboarding");
      return { user: currentTenant.user, restaurant: currentTenant.restaurant };
    }),
    getRestaurantForUser: vi.fn(async () => currentTenant.restaurant),
  };
}

let counter = 0;

/** Inserts a user without a restaurant (a freshly signed-up account). */
export async function createUser() {
  counter += 1;
  const userId = crypto.randomUUID();
  const [createdUser] = await db
    .insert(user)
    .values({ id: userId, name: `Owner ${counter}`, email: `owner${counter}-${userId}@test.local` })
    .returning();
  return createdUser!;
}

/** Inserts a user + restaurant and returns them. */
export async function createTenant(overrides: Partial<typeof restaurant.$inferInsert> = {}) {
  const createdUser = await createUser();
  const [createdRestaurant] = await db
    .insert(restaurant)
    .values({
      ownerId: createdUser.id,
      slug: `test-${counter}-${createdUser.id.slice(0, 8)}`,
      name: `Restaurant ${counter}`,
      ...overrides,
    })
    .returning();
  return { user: createdUser, restaurant: createdRestaurant! };
}

/** Makes the given tenant the signed-in one. */
export function signInAs(tenant: { user: SessionUser; restaurant: Restaurant | null }) {
  currentTenant.user = tenant.user;
  currentTenant.restaurant = tenant.restaurant;
}
