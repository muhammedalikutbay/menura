"use server";

import { and, count, eq, inArray, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { category, product } from "@/db/schema";
import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { isOwnedMedia, releaseMedia } from "@/features/media/server";
import { requireRestaurant } from "@/server/session";
import { categorySchema, idSchema, MAX_CATEGORIES, orderedIdsSchema } from "./schema";

function revalidateMenu(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
  revalidatePath(`/m/${slug}`);
}

export async function createCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { restaurant } = await requireRestaurant();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  if (data.imageMediaId && !(await isOwnedMedia(restaurant.id, data.imageMediaId))) {
    return fail("Görsel bulunamadı.", { imageMediaId: ["Görsel bulunamadı, tekrar yükleyin."] });
  }

  const [stats] = await db
    .select({ total: count(), last: max(category.position) })
    .from(category)
    .where(eq(category.restaurantId, restaurant.id));
  if ((stats?.total ?? 0) >= MAX_CATEGORIES) {
    return fail(`En fazla ${MAX_CATEGORIES} kategori oluşturabilirsiniz.`);
  }

  const [created] = await db
    .insert(category)
    .values({
      restaurantId: restaurant.id,
      name: data.name,
      description: data.description,
      imageMediaId: data.imageMediaId,
      isActive: data.isActive,
      position: (stats?.last ?? -1) + 1,
    })
    .returning({ id: category.id });
  if (!created) return fail("Kategori kaydedilemedi.");

  revalidateMenu(restaurant.slug);
  return ok({ id: created.id });
}

export async function updateCategory(id: string, input: unknown): Promise<ActionResult> {
  const { restaurant } = await requireRestaurant();
  if (!idSchema.safeParse(id).success) return fail("Kategori bulunamadı.");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  const [existing] = await db
    .select({ id: category.id, imageMediaId: category.imageMediaId })
    .from(category)
    .where(and(eq(category.id, id), eq(category.restaurantId, restaurant.id)))
    .limit(1);
  if (!existing) return fail("Kategori bulunamadı.");

  if (data.imageMediaId && !(await isOwnedMedia(restaurant.id, data.imageMediaId))) {
    return fail("Görsel bulunamadı.", { imageMediaId: ["Görsel bulunamadı, tekrar yükleyin."] });
  }

  await db
    .update(category)
    .set({
      name: data.name,
      description: data.description,
      imageMediaId: data.imageMediaId,
      isActive: data.isActive,
    })
    .where(and(eq(category.id, id), eq(category.restaurantId, restaurant.id)));

  if (existing.imageMediaId && existing.imageMediaId !== data.imageMediaId) {
    await releaseMedia(restaurant.id, existing.imageMediaId);
  }
  revalidateMenu(restaurant.slug);
  return ok();
}

export async function setCategoryActive(id: string, isActive: boolean): Promise<ActionResult> {
  const { restaurant } = await requireRestaurant();
  if (!idSchema.safeParse(id).success || typeof isActive !== "boolean") return fail("Kategori bulunamadı.");

  const updated = await db
    .update(category)
    .set({ isActive })
    .where(and(eq(category.id, id), eq(category.restaurantId, restaurant.id)))
    .returning({ id: category.id });
  if (updated.length === 0) return fail("Kategori bulunamadı.");

  revalidateMenu(restaurant.slug);
  return ok();
}

/** Deletes a category together with its products and releases every image they used. */
export async function deleteCategory(id: string): Promise<ActionResult<{ deletedProducts: number }>> {
  const { restaurant } = await requireRestaurant();
  if (!idSchema.safeParse(id).success) return fail("Kategori bulunamadı.");

  const [existing] = await db
    .select({ id: category.id, imageMediaId: category.imageMediaId })
    .from(category)
    .where(and(eq(category.id, id), eq(category.restaurantId, restaurant.id)))
    .limit(1);
  if (!existing) return fail("Kategori bulunamadı.");

  const products = await db
    .select({ imageMediaId: product.imageMediaId })
    .from(product)
    .where(and(eq(product.categoryId, id), eq(product.restaurantId, restaurant.id)));

  const mediaIds = new Set<string>();
  if (existing.imageMediaId) mediaIds.add(existing.imageMediaId);
  for (const row of products) if (row.imageMediaId) mediaIds.add(row.imageMediaId);

  // Products are removed by the category_id foreign key (ON DELETE CASCADE).
  await db.delete(category).where(and(eq(category.id, id), eq(category.restaurantId, restaurant.id)));

  for (const mediaId of mediaIds) await releaseMedia(restaurant.id, mediaId);

  revalidateMenu(restaurant.slug);
  return ok({ deletedProducts: products.length });
}

/** Persists a new category order. `orderedIds` must be exactly the restaurant's category ids. */
export async function reorderCategories(orderedIds: unknown): Promise<ActionResult> {
  const { restaurant } = await requireRestaurant();
  const parsed = orderedIdsSchema.safeParse(orderedIds);
  if (!parsed.success) return fail("Geçersiz sıralama.");
  const ids = parsed.data;

  const rows = await db.select({ id: category.id }).from(category).where(eq(category.restaurantId, restaurant.id));
  const known = new Set(rows.map((row) => row.id));
  if (ids.length !== known.size || new Set(ids).size !== ids.length || !ids.every((id) => known.has(id))) {
    return fail("Sıralama geçersiz. Sayfayı yenileyip tekrar deneyin.");
  }

  if (ids.length > 0) {
    await db.transaction(async (tx) => {
      const cases = sql.join(
        ids.map((id, index) => sql`WHEN ${id} THEN ${index}::int`),
        sql` `,
      );
      await tx
        .update(category)
        .set({ position: sql`CASE ${category.id} ${cases} END` })
        .where(and(eq(category.restaurantId, restaurant.id), inArray(category.id, ids)));
    });
  }

  revalidateMenu(restaurant.slug);
  return ok();
}
