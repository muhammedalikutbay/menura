"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { isUniqueViolation } from "@/db/errors";
import { restaurant } from "@/db/schema";
import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { getRestaurantForUser, requireUser } from "@/server/session";
import { createRestaurantSchema } from "./schema";

export async function createRestaurant(input: unknown): Promise<ActionResult<{ slug: string }>> {
  const user = await requireUser();
  if (await getRestaurantForUser(user.id)) return fail("Bu hesaba bağlı bir restoran zaten var.");

  const parsed = createRestaurantSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  const [taken] = await db
    .select({ id: restaurant.id })
    .from(restaurant)
    .where(eq(restaurant.slug, parsed.data.slug))
    .limit(1);
  if (taken) return fail("Bu adres kullanımda.", { slug: ["Bu adres kullanımda, başka bir adres deneyin."] });

  try {
    await db.insert(restaurant).values({ ownerId: user.id, name: parsed.data.name, slug: parsed.data.slug });
  } catch (error) {
    // Lost a race against another sign-up for the same slug or a double submit.
    if (isUniqueViolation(error)) return fail("Bu adres kullanımda.", { slug: ["Bu adres kullanımda, başka bir adres deneyin."] });
    throw error;
  }
  revalidatePath("/dashboard", "layout");
  return ok({ slug: parsed.data.slug });
}
