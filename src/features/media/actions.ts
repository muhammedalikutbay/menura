"use server";

import { db } from "@/db";
import { media } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireRestaurant } from "@/server/session";
import { InvalidImageError, processImage } from "./process-image";
import { countMedia, MAX_MEDIA_PER_RESTAURANT, pruneOrphanMedia } from "./server";
import { mediaUrl } from "./url";

/**
 * Stores an uploaded image for the current restaurant. The returned id is attached to a
 * product/category/restaurant by that entity's own action; unattached uploads are removed
 * when the entity form is saved with another image (see releaseMedia).
 */
export async function uploadImage(formData: FormData): Promise<ActionResult<{ id: string; url: string }>> {
  const { restaurant } = await requireRestaurant();
  const file = formData.get("file");
  if (!(file instanceof File)) return fail("Görsel seçilmedi.");
  if ((await countMedia(restaurant.id)) >= MAX_MEDIA_PER_RESTAURANT) {
    await pruneOrphanMedia(restaurant.id);
    if ((await countMedia(restaurant.id)) >= MAX_MEDIA_PER_RESTAURANT) {
      return fail("Görsel sınırına ulaştınız. Kullanılmayan görselleri kaldırıp tekrar deneyin.");
    }
  }

  try {
    const image = await processImage(Buffer.from(await file.arrayBuffer()));
    const [row] = await db
      .insert(media)
      .values({ restaurantId: restaurant.id, ...image })
      .returning({ id: media.id });
    if (!row) return fail("Görsel kaydedilemedi.");
    await pruneOrphanMedia(restaurant.id);
    return ok({ id: row.id, url: mediaUrl(row.id)! });
  } catch (error) {
    if (error instanceof InvalidImageError) return fail(error.message);
    console.error("uploadImage failed", error);
    return fail("Görsel yüklenemedi. Lütfen tekrar deneyin.");
  }
}
