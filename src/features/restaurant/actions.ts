"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { isUniqueViolation } from "@/db/errors";
import { restaurant } from "@/db/schema";
import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { isOwnedMedia, releaseMedia } from "@/features/media/server";
import { getRestaurantForUser, requireRestaurant, requireUser } from "@/server/session";
import {
  createRestaurantSchema,
  setPublishedSchema,
  updateAppearanceSchema,
  updateRestaurantProfileSchema,
  updateSlugSchema,
} from "./schema";

const SLUG_TAKEN = "Bu adres kullanımda.";
const SLUG_TAKEN_FIELD = { slug: ["Bu adres kullanımda, başka bir adres deneyin."] };

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
  if (taken) return fail(SLUG_TAKEN, SLUG_TAKEN_FIELD);

  try {
    await db.insert(restaurant).values({ ownerId: user.id, name: parsed.data.name, slug: parsed.data.slug });
  } catch (error) {
    // Lost a race against another sign-up for the same slug or a double submit.
    if (isUniqueViolation(error)) return fail(SLUG_TAKEN, SLUG_TAKEN_FIELD);
    throw error;
  }
  revalidatePath("/dashboard", "layout");
  return ok({ slug: parsed.data.slug });
}

/**
 * Saves the restaurant profile (identity, contact, Wi-Fi, images). Text fields are replaced as a whole
 * (empty clears them); an undefined logo/cover id leaves the image unchanged, null removes it.
 */
export async function updateRestaurantProfile(input: unknown): Promise<ActionResult> {
  const { user, restaurant: current } = await requireRestaurant();

  const parsed = updateRestaurantProfileSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  // Media ids come from the client: only accept ones that belong to this restaurant.
  for (const key of ["logoMediaId", "coverMediaId"] as const) {
    const next = data[key];
    if (next && next !== current[key] && !(await isOwnedMedia(current.id, next))) {
      return fail("Görsel bulunamadı. Lütfen yeniden yükleyin.", { [key]: ["Görsel bulunamadı."] });
    }
  }

  const nextLogo = data.logoMediaId === undefined ? current.logoMediaId : data.logoMediaId;
  const nextCover = data.coverMediaId === undefined ? current.coverMediaId : data.coverMediaId;

  await db
    .update(restaurant)
    .set({
      name: data.name,
      description: data.description ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      instagram: data.instagram ?? null,
      website: data.website ?? null,
      wifiName: data.wifiName ?? null,
      wifiPassword: data.wifiPassword ?? null,
      logoMediaId: nextLogo,
      coverMediaId: nextCover,
    })
    .where(and(eq(restaurant.id, current.id), eq(restaurant.ownerId, user.id)));

  if (current.logoMediaId && current.logoMediaId !== nextLogo) await releaseMedia(current.id, current.logoMediaId);
  if (current.coverMediaId && current.coverMediaId !== nextCover) await releaseMedia(current.id, current.coverMediaId);

  revalidatePath("/dashboard", "layout");
  revalidatePath(`/m/${current.slug}`);
  return ok();
}

/** Saves theme color, currency and the menu content preferences. */
export async function updateAppearance(input: unknown): Promise<ActionResult> {
  const { user, restaurant: current } = await requireRestaurant();

  const parsed = updateAppearanceSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  await db
    .update(restaurant)
    .set(parsed.data)
    .where(and(eq(restaurant.id, current.id), eq(restaurant.ownerId, user.id)));

  revalidatePath("/dashboard", "layout");
  revalidatePath(`/m/${current.slug}`);
  return ok();
}

/** Changes the public menu address. Printed QR codes that use the old address stop working. */
export async function updateSlug(input: unknown): Promise<ActionResult<{ slug: string }>> {
  const { user, restaurant: current } = await requireRestaurant();

  const parsed = updateSlugSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { slug } = parsed.data;
  if (slug === current.slug) return ok({ slug });

  const [taken] = await db.select({ id: restaurant.id }).from(restaurant).where(eq(restaurant.slug, slug)).limit(1);
  if (taken) return fail(SLUG_TAKEN, SLUG_TAKEN_FIELD);

  try {
    await db
      .update(restaurant)
      .set({ slug })
      .where(and(eq(restaurant.id, current.id), eq(restaurant.ownerId, user.id)));
  } catch (error) {
    // Lost a race against another restaurant claiming the same slug.
    if (isUniqueViolation(error)) return fail(SLUG_TAKEN, SLUG_TAKEN_FIELD);
    throw error;
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath(`/m/${current.slug}`);
  revalidatePath(`/m/${slug}`);
  return ok({ slug });
}

/** Publishes or unpublishes the menu. Unpublished menus answer "Menü bulunamadı" to guests. */
export async function setPublished(input: unknown): Promise<ActionResult<{ isPublished: boolean }>> {
  const { user, restaurant: current } = await requireRestaurant();

  const parsed = setPublishedSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  await db
    .update(restaurant)
    .set({ isPublished: parsed.data.isPublished })
    .where(and(eq(restaurant.id, current.id), eq(restaurant.ownerId, user.id)));

  revalidatePath("/dashboard", "layout");
  revalidatePath(`/m/${current.slug}`);
  return ok({ isPublished: parsed.data.isPublished });
}
