import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { category, product } from "@/db/schema";

export type ProductListItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageMediaId: string | null;
  priceMinor: number;
  discountPriceMinor: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  prepTime: string | null;
  calories: number | null;
  allergens: string[];
  tags: string[];
};

export type CategoryOption = { id: string; name: string; isActive: boolean };

/** Categories in menu order, for selects and filters. */
export async function listCategoryOptions(restaurantId: string): Promise<CategoryOption[]> {
  return db
    .select({ id: category.id, name: category.name, isActive: category.isActive })
    .from(category)
    .where(eq(category.restaurantId, restaurantId))
    .orderBy(asc(category.position), asc(category.createdAt), asc(category.id));
}

/** Every product of the restaurant in menu order (category order, then product order). */
export async function listProducts(restaurantId: string): Promise<ProductListItem[]> {
  return db
    .select({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      imageMediaId: product.imageMediaId,
      priceMinor: product.priceMinor,
      discountPriceMinor: product.discountPriceMinor,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      prepTime: product.prepTime,
      calories: product.calories,
      allergens: product.allergens,
      tags: product.tags,
    })
    .from(product)
    .innerJoin(category, eq(category.id, product.categoryId))
    .where(eq(product.restaurantId, restaurantId))
    .orderBy(asc(category.position), asc(category.id), asc(product.position), asc(product.createdAt), asc(product.id));
}

export async function getProduct(restaurantId: string, productId: string) {
  const [row] = await db
    .select()
    .from(product)
    .where(and(eq(product.id, productId), eq(product.restaurantId, restaurantId)))
    .limit(1);
  return row ?? null;
}
