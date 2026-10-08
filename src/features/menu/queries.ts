import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { category, product, restaurant } from "@/db/schema";
import { mediaUrl } from "@/features/media/url";
import { getSession } from "@/server/session";
import type { PublicCategory, PublicMenu, PublicProduct } from "./types";

export type { PublicCategory, PublicMenu, PublicProduct, PublicRestaurant } from "./types";

/**
 * Everything the public menu page needs, or `null` when there is nothing to show.
 * Unpublished restaurants are visible only to their owner (preview).
 */
export const getPublicMenu = cache(async (slug: string): Promise<PublicMenu | null> => {
  const [row] = await db
    .select()
    .from(restaurant)
    .where(eq(restaurant.slug, slug.trim().toLowerCase()))
    .limit(1);
  if (!row) return null;

  const session = await getSession();
  const isOwner = session?.user.id === row.ownerId;
  if (!row.isPublished && !isOwner) return null;

  const categoryRows = await db
    .select()
    .from(category)
    .where(and(eq(category.restaurantId, row.id), eq(category.isActive, true)))
    .orderBy(asc(category.position), asc(category.createdAt), asc(category.id));

  const productRows =
    categoryRows.length === 0
      ? []
      : await db
          .select()
          .from(product)
          .where(
            and(
              eq(product.restaurantId, row.id),
              inArray(
                product.categoryId,
                categoryRows.map((c) => c.id),
              ),
              row.hideUnavailable ? eq(product.isAvailable, true) : undefined,
            ),
          )
          .orderBy(asc(product.position), asc(product.createdAt), asc(product.id));

  const productsByCategory = new Map<string, PublicProduct[]>();
  for (const p of productRows) {
    const item: PublicProduct = {
      id: p.id,
      name: p.name,
      description: p.description,
      imageUrl: mediaUrl(p.imageMediaId),
      priceMinor: p.priceMinor,
      discountPriceMinor: p.discountPriceMinor,
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      prepTime: p.prepTime,
      calories: p.calories,
      allergens: p.allergens,
      tags: p.tags,
    };
    const list = productsByCategory.get(p.categoryId);
    if (list) list.push(item);
    else productsByCategory.set(p.categoryId, [item]);
  }

  const categories: PublicCategory[] = [];
  for (const c of categoryRows) {
    const products = productsByCategory.get(c.id);
    if (products?.length) categories.push({ id: c.id, name: c.name, description: c.description, products });
  }

  return {
    restaurant: {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      logoUrl: mediaUrl(row.logoMediaId),
      coverUrl: mediaUrl(row.coverMediaId),
      phone: row.phone,
      address: row.address,
      instagram: row.instagram,
      website: row.website,
      wifiName: row.wifiName,
      wifiPassword: row.wifiPassword,
      currency: row.currency,
      themeColor: row.themeColor,
      isPublished: row.isPublished,
      showVatNote: row.showVatNote,
      hideUnavailable: row.hideUnavailable,
    },
    categories,
    featured: categories.flatMap((c) => c.products).filter((p) => p.isFeatured && p.isAvailable),
    isOwner,
    isPreview: !row.isPublished && isOwner,
  };
});
