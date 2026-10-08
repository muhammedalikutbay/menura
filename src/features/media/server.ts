import "server-only";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { category, media, product, restaurant } from "@/db/schema";

/** True when the media row exists and belongs to the restaurant. */
export async function isOwnedMedia(restaurantId: string, mediaId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: media.id })
    .from(media)
    .where(and(eq(media.id, mediaId), eq(media.restaurantId, restaurantId)))
    .limit(1);
  return Boolean(row);
}

/**
 * Deletes a media row once nothing references it any more. Call after replacing or
 * removing an image so uploads do not accumulate.
 */
export async function releaseMedia(restaurantId: string, mediaId: string | null | undefined): Promise<void> {
  if (!mediaId) return;
  const [usedByProduct] = await db
    .select({ id: product.id })
    .from(product)
    .where(eq(product.imageMediaId, mediaId))
    .limit(1);
  if (usedByProduct) return;
  const [usedByCategory] = await db
    .select({ id: category.id })
    .from(category)
    .where(eq(category.imageMediaId, mediaId))
    .limit(1);
  if (usedByCategory) return;
  const [usedByRestaurant] = await db
    .select({ id: restaurant.id })
    .from(restaurant)
    .where(or(eq(restaurant.logoMediaId, mediaId), eq(restaurant.coverMediaId, mediaId)))
    .limit(1);
  if (usedByRestaurant) return;
  await db.delete(media).where(and(eq(media.id, mediaId), eq(media.restaurantId, restaurantId)));
}

/**
 * Removes this restaurant's uploads that are older than a day and referenced by nothing
 * (e.g. an image uploaded in a form that was then cancelled). Runs opportunistically on upload.
 */
export async function pruneOrphanMedia(restaurantId: string): Promise<void> {
  await db.execute(sql`
    DELETE FROM ${media} m
    WHERE m.restaurant_id = ${restaurantId}
      AND m.created_at < now() - interval '1 day'
      AND NOT EXISTS (SELECT 1 FROM ${product} p WHERE p.image_media_id = m.id)
      AND NOT EXISTS (SELECT 1 FROM ${category} c WHERE c.image_media_id = m.id)
      AND NOT EXISTS (
        SELECT 1 FROM ${restaurant} r WHERE r.logo_media_id = m.id OR r.cover_media_id = m.id
      )
  `);
}
