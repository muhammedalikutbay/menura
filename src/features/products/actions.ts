"use server";

import { and, asc, count, eq, inArray, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import type { Database } from "@/db/client";
import { category, product } from "@/db/schema";
import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { isOwnedMedia, releaseMedia } from "@/features/media/server";
import { requireRestaurant } from "@/server/session";
import { idListSchema, idSchema, MAX_PRODUCTS, PRODUCT_NAME_MAX, productSchema, type ProductData } from "./schema";

type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

const COPY_SUFFIX = " (kopya)";
const LIMIT_MESSAGE = `En fazla ${MAX_PRODUCTS} ürün ekleyebilirsiniz.`;

function revalidateMenu(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
  revalidatePath("/dashboard/products/[id]", "page");
  revalidatePath(`/m/${slug}`);
}

async function ownsCategory(restaurantId: string, categoryId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: category.id })
    .from(category)
    .where(and(eq(category.id, categoryId), eq(category.restaurantId, restaurantId)))
    .limit(1);
  return Boolean(row);
}

async function nextPosition(restaurantId: string, categoryId: string): Promise<number> {
  const [row] = await db
    .select({ last: max(product.position) })
    .from(product)
    .where(and(eq(product.categoryId, categoryId), eq(product.restaurantId, restaurantId)));
  return (row?.last ?? -1) + 1;
}

/** Rewrites `position` as 0..n-1 following `ids` (one statement). */
async function writePositions(tx: Pick<Tx, "update">, restaurantId: string, ids: string[]) {
  if (ids.length === 0) return;
  const cases = sql.join(
    ids.map((id, index) => sql`WHEN ${id} THEN ${index}::int`),
    sql` `,
  );
  await tx
    .update(product)
    .set({ position: sql`CASE ${product.id} ${cases} END` })
    .where(and(eq(product.restaurantId, restaurantId), inArray(product.id, ids)));
}

/** Checks the foreign ids of a parsed product; returns a failure result or null when all are valid. */
async function validateReferences(restaurantId: string, data: ProductData) {
  if (!(await ownsCategory(restaurantId, data.categoryId))) {
    return fail("Kategori bulunamadı.", { categoryId: ["Geçerli bir kategori seçin."] });
  }
  if (data.imageMediaId && !(await isOwnedMedia(restaurantId, data.imageMediaId))) {
    return fail("Görsel bulunamadı.", { imageMediaId: ["Görsel bulunamadı, tekrar yükleyin."] });
  }
  return null;
}

async function productCount(restaurantId: string): Promise<number> {
  const [row] = await db.select({ total: count() }).from(product).where(eq(product.restaurantId, restaurantId));
  return row?.total ?? 0;
}

function toRow(data: ProductData) {
  return {
    categoryId: data.categoryId,
    name: data.name,
    description: data.description,
    imageMediaId: data.imageMediaId,
    priceMinor: data.price,
    discountPriceMinor: data.discountPrice,
    isAvailable: data.isAvailable,
    isFeatured: data.isFeatured,
    prepTime: data.prepTime,
    calories: data.calories,
    allergens: data.allergens,
    tags: data.tags,
  };
}

export async function createProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { restaurant } = await requireRestaurant();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  const invalid = await validateReferences(restaurant.id, data);
  if (invalid) return invalid;
  if ((await productCount(restaurant.id)) >= MAX_PRODUCTS) return fail(LIMIT_MESSAGE);

  const [created] = await db
    .insert(product)
    .values({
      ...toRow(data),
      restaurantId: restaurant.id,
      position: await nextPosition(restaurant.id, data.categoryId),
    })
    .returning({ id: product.id });
  if (!created) return fail("Ürün kaydedilemedi.");

  revalidateMenu(restaurant.slug);
  return ok({ id: created.id });
}

export async function updateProduct(id: string, input: unknown): Promise<ActionResult> {
  const { restaurant } = await requireRestaurant();
  if (!idSchema.safeParse(id).success) return fail("Ürün bulunamadı.");
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  const [existing] = await db
    .select({ categoryId: product.categoryId, imageMediaId: product.imageMediaId })
    .from(product)
    .where(and(eq(product.id, id), eq(product.restaurantId, restaurant.id)))
    .limit(1);
  if (!existing) return fail("Ürün bulunamadı.");

  const invalid = await validateReferences(restaurant.id, data);
  if (invalid) return invalid;

  // A product that changes category goes to the end of the new one.
  const movedToCategory = existing.categoryId !== data.categoryId;
  await db
    .update(product)
    .set({
      ...toRow(data),
      ...(movedToCategory ? { position: await nextPosition(restaurant.id, data.categoryId) } : {}),
    })
    .where(and(eq(product.id, id), eq(product.restaurantId, restaurant.id)));

  if (existing.imageMediaId && existing.imageMediaId !== data.imageMediaId) {
    await releaseMedia(restaurant.id, existing.imageMediaId);
  }
  revalidateMenu(restaurant.slug);
  return ok();
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const result = await deleteProducts([id]);
  return result.ok ? ok() : result;
}

export async function deleteProducts(ids: unknown): Promise<ActionResult<{ deleted: number }>> {
  const { restaurant } = await requireRestaurant();
  const parsed = idListSchema.safeParse(ids);
  if (!parsed.success) return fail("Geçersiz seçim.");
  const unique = [...new Set(parsed.data)];

  const rows = await db
    .select({ id: product.id, imageMediaId: product.imageMediaId })
    .from(product)
    .where(and(inArray(product.id, unique), eq(product.restaurantId, restaurant.id)));
  if (rows.length === 0) return fail("Ürün bulunamadı.");

  await db.delete(product).where(
    and(
      inArray(
        product.id,
        rows.map((row) => row.id),
      ),
      eq(product.restaurantId, restaurant.id),
    ),
  );

  for (const mediaId of new Set(rows.flatMap((row) => (row.imageMediaId ? [row.imageMediaId] : [])))) {
    await releaseMedia(restaurant.id, mediaId);
  }
  revalidateMenu(restaurant.slug);
  return ok({ deleted: rows.length });
}

export async function setProductAvailability(id: string, isAvailable: boolean): Promise<ActionResult> {
  const result = await setProductsAvailability([id], isAvailable);
  return result.ok ? ok() : result;
}

export async function setProductsAvailability(ids: unknown, isAvailable: boolean): Promise<ActionResult<{ updated: number }>> {
  const { restaurant } = await requireRestaurant();
  const parsed = idListSchema.safeParse(ids);
  if (!parsed.success || typeof isAvailable !== "boolean") return fail("Geçersiz seçim.");

  const updated = await db
    .update(product)
    .set({ isAvailable })
    .where(and(inArray(product.id, [...new Set(parsed.data)]), eq(product.restaurantId, restaurant.id)))
    .returning({ id: product.id });
  if (updated.length === 0) return fail("Ürün bulunamadı.");

  revalidateMenu(restaurant.slug);
  return ok({ updated: updated.length });
}

/** Moves products to the end of another category, keeping their relative order. */
export async function moveProducts(ids: unknown, categoryId: string): Promise<ActionResult<{ moved: number }>> {
  const { restaurant } = await requireRestaurant();
  const parsed = idListSchema.safeParse(ids);
  if (!parsed.success || !idSchema.safeParse(categoryId).success) return fail("Geçersiz seçim.");
  if (!(await ownsCategory(restaurant.id, categoryId))) return fail("Kategori bulunamadı.");

  const moved = await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: product.id })
      .from(product)
      .innerJoin(category, eq(category.id, product.categoryId))
      .where(
        and(
          inArray(product.id, [...new Set(parsed.data)]),
          eq(product.restaurantId, restaurant.id),
          sql`${product.categoryId} <> ${categoryId}`,
        ),
      )
      .orderBy(asc(category.position), asc(category.id), asc(product.position), asc(product.createdAt), asc(product.id));
    if (rows.length === 0) return 0;

    await tx
      .update(product)
      .set({ categoryId })
      .where(
        and(
          eq(product.restaurantId, restaurant.id),
          inArray(
            product.id,
            rows.map((row) => row.id),
          ),
        ),
      );
    const target = await tx
      .select({ id: product.id })
      .from(product)
      .where(and(eq(product.categoryId, categoryId), eq(product.restaurantId, restaurant.id)))
      .orderBy(asc(product.position), asc(product.createdAt), asc(product.id));
    // Products that were already in the target keep their order; the moved ones follow in selection order.
    const movedIds = new Set(rows.map((row) => row.id));
    const ordered = [...target.filter((row) => !movedIds.has(row.id)), ...rows].map((row) => row.id);
    await writePositions(tx, restaurant.id, ordered);
    return rows.length;
  });

  revalidateMenu(restaurant.slug);
  return ok({ moved });
}

/** Creates "<name> (kopya)" right after the original in the same category. */
export async function duplicateProduct(id: string): Promise<ActionResult<{ id: string }>> {
  const { restaurant } = await requireRestaurant();
  if (!idSchema.safeParse(id).success) return fail("Ürün bulunamadı.");

  const [original] = await db
    .select()
    .from(product)
    .where(and(eq(product.id, id), eq(product.restaurantId, restaurant.id)))
    .limit(1);
  if (!original) return fail("Ürün bulunamadı.");
  if ((await productCount(restaurant.id)) >= MAX_PRODUCTS) return fail(LIMIT_MESSAGE);

  const name = `${original.name.slice(0, PRODUCT_NAME_MAX - COPY_SUFFIX.length).trimEnd()}${COPY_SUFFIX}`;

  const copyId = await db.transaction(async (tx) => {
    const [copy] = await tx
      .insert(product)
      .values({
        restaurantId: restaurant.id,
        categoryId: original.categoryId,
        name,
        description: original.description,
        imageMediaId: original.imageMediaId,
        priceMinor: original.priceMinor,
        discountPriceMinor: original.discountPriceMinor,
        isAvailable: original.isAvailable,
        isFeatured: original.isFeatured,
        prepTime: original.prepTime,
        calories: original.calories,
        allergens: original.allergens,
        tags: original.tags,
        position: original.position + 1,
      })
      .returning({ id: product.id });
    if (!copy) throw new Error("duplicateProduct: insert returned no row");

    const siblings = await tx
      .select({ id: product.id })
      .from(product)
      .where(and(eq(product.categoryId, original.categoryId), eq(product.restaurantId, restaurant.id)))
      .orderBy(asc(product.position), asc(product.createdAt), asc(product.id));
    const ordered = siblings.map((row) => row.id).filter((siblingId) => siblingId !== copy.id);
    ordered.splice(ordered.indexOf(original.id) + 1, 0, copy.id);
    await writePositions(tx, restaurant.id, ordered);
    return copy.id;
  });

  revalidateMenu(restaurant.slug);
  return ok({ id: copyId });
}

const reorderSchema = z.object({ categoryId: idSchema, orderedIds: z.array(idSchema).max(MAX_PRODUCTS) });

/** Persists the order of one category's products. `orderedIds` must be exactly that category's product ids. */
export async function reorderProducts(categoryId: string, orderedIds: unknown): Promise<ActionResult> {
  const { restaurant } = await requireRestaurant();
  const parsed = reorderSchema.safeParse({ categoryId, orderedIds });
  if (!parsed.success) return fail("Geçersiz sıralama.");
  const ids = parsed.data.orderedIds;

  if (!(await ownsCategory(restaurant.id, categoryId))) return fail("Kategori bulunamadı.");
  const rows = await db
    .select({ id: product.id })
    .from(product)
    .where(and(eq(product.categoryId, categoryId), eq(product.restaurantId, restaurant.id)));
  const known = new Set(rows.map((row) => row.id));
  if (ids.length !== known.size || new Set(ids).size !== ids.length || !ids.every((id) => known.has(id))) {
    return fail("Sıralama geçersiz. Sayfayı yenileyip tekrar deneyin.");
  }

  await db.transaction((tx) => writePositions(tx, restaurant.id, ids));
  revalidateMenu(restaurant.slug);
  return ok();
}
