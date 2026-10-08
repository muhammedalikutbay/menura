import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { category, product } from "@/db/schema";

export type CategoryListItem = {
  id: string;
  name: string;
  description: string | null;
  imageMediaId: string | null;
  isActive: boolean;
  productCount: number;
};

/** All categories of a restaurant in menu order, with the number of products in each. */
export async function listCategories(restaurantId: string): Promise<CategoryListItem[]> {
  return db
    .select({
      id: category.id,
      name: category.name,
      description: category.description,
      imageMediaId: category.imageMediaId,
      isActive: category.isActive,
      productCount: count(product.id),
    })
    .from(category)
    .leftJoin(product, eq(product.categoryId, category.id))
    .where(eq(category.restaurantId, restaurantId))
    .groupBy(category.id)
    .orderBy(asc(category.position), asc(category.createdAt), asc(category.id));
}
