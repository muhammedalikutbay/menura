import { describe, expect, it } from "vitest";
import { db } from "@/db";
import { category, product } from "@/db/schema";
import { createTenant } from "../../../test/helpers";
import { getOverviewCounts } from "./queries";

async function addCategory(restaurantId: string, name: string, isActive = true) {
  const [row] = await db.insert(category).values({ restaurantId, name, isActive }).returning();
  return row!;
}

async function addProduct(restaurantId: string, categoryId: string, name: string, isAvailable = true) {
  await db.insert(product).values({ restaurantId, categoryId, name, priceMinor: 10000, isAvailable });
}

describe("getOverviewCounts", () => {
  it("returns zeros for a restaurant without content", async () => {
    const { restaurant } = await createTenant();
    expect(await getOverviewCounts(restaurant.id)).toEqual({
      categories: { active: 0, total: 0 },
      products: { available: 0, total: 0 },
    });
  });

  it("counts active and available rows separately from the total", async () => {
    const { restaurant } = await createTenant();
    const soups = await addCategory(restaurant.id, "Çorbalar");
    const hidden = await addCategory(restaurant.id, "Gizli", false);
    await addProduct(restaurant.id, soups.id, "Mercimek");
    await addProduct(restaurant.id, soups.id, "Ezogelin", false);
    await addProduct(restaurant.id, hidden.id, "Tarhana");

    expect(await getOverviewCounts(restaurant.id)).toEqual({
      categories: { active: 1, total: 2 },
      products: { available: 2, total: 3 },
    });
  });

  it("never counts another tenant's rows", async () => {
    const a = await createTenant();
    const b = await createTenant();
    const aCategory = await addCategory(a.restaurant.id, "A kategori");
    await addProduct(a.restaurant.id, aCategory.id, "A ürün 1");
    await addProduct(a.restaurant.id, aCategory.id, "A ürün 2");
    const bCategory = await addCategory(b.restaurant.id, "B kategori");
    await addCategory(b.restaurant.id, "B kategori 2", false);
    await addProduct(b.restaurant.id, bCategory.id, "B ürün", false);

    expect(await getOverviewCounts(a.restaurant.id)).toEqual({
      categories: { active: 1, total: 1 },
      products: { available: 2, total: 2 },
    });
    expect(await getOverviewCounts(b.restaurant.id)).toEqual({
      categories: { active: 1, total: 2 },
      products: { available: 0, total: 1 },
    });
  });
});
