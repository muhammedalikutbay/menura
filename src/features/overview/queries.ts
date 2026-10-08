import "server-only";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { category, product } from "@/db/schema";

export type OverviewCounts = {
  categories: { active: number; total: number };
  products: { available: number; total: number };
};

/** Category and product counts for the dashboard overview. Always scoped to one restaurant. */
export async function getOverviewCounts(restaurantId: string): Promise<OverviewCounts> {
  const [[categoryRow], [productRow]] = await Promise.all([
    db
      .select({
        total: count(),
        active: sql<number>`count(*) filter (where ${category.isActive})::int`,
      })
      .from(category)
      .where(eq(category.restaurantId, restaurantId)),
    db
      .select({
        total: count(),
        available: sql<number>`count(*) filter (where ${product.isAvailable})::int`,
      })
      .from(product)
      .where(eq(product.restaurantId, restaurantId)),
  ]);

  return {
    categories: { active: categoryRow?.active ?? 0, total: categoryRow?.total ?? 0 },
    products: { available: productRow?.available ?? 0, total: productRow?.total ?? 0 },
  };
}
