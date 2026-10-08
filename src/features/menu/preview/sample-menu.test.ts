import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALLERGEN_CODES, DIETARY_TAG_CODES } from "@/lib/menu-attributes";
import { normalizeAccent } from "../theme";
import { SAMPLE_MENU } from "./sample-menu";

const products = SAMPLE_MENU.categories.flatMap((category) => category.products);
const publicDir = join(process.cwd(), "public");

describe("SAMPLE_MENU", () => {
  it("is Lezzet Durağı with 3 categories and 7 products", () => {
    expect(SAMPLE_MENU.restaurant.name).toBe("Lezzet Durağı");
    expect(SAMPLE_MENU.categories).toHaveLength(3);
    expect(products).toHaveLength(7);
    expect(new Set(products.map((p) => p.id)).size).toBe(7);
    expect(new Set(SAMPLE_MENU.categories.map((c) => c.id)).size).toBe(3);
  });

  it("has exactly one discount and one featured product", () => {
    const discounted = products.filter((p) => p.discountPriceMinor != null);
    expect(discounted).toHaveLength(1);
    expect(discounted[0]!.discountPriceMinor!).toBeLessThan(discounted[0]!.priceMinor);
    expect(products.filter((p) => p.isFeatured)).toHaveLength(1);
    expect(SAMPLE_MENU.featured).toEqual(products.filter((p) => p.isFeatured && p.isAvailable));
  });

  it("shows tags and allergens with valid codes", () => {
    expect(products.some((p) => p.tags.length > 0)).toBe(true);
    expect(products.every((p) => p.allergens.length > 0)).toBe(true);
    for (const p of products) {
      for (const code of p.allergens) expect(ALLERGEN_CODES).toContain(code);
      for (const code of p.tags) expect(DIETARY_TAG_CODES).toContain(code);
      expect(Number.isInteger(p.priceMinor) && p.priceMinor > 0).toBe(true);
    }
  });

  it("is a published, guest-facing menu with a valid accent color", () => {
    expect(SAMPLE_MENU.isOwner).toBe(false);
    expect(SAMPLE_MENU.isPreview).toBe(false);
    expect(SAMPLE_MENU.restaurant.isPublished).toBe(true);
    expect(normalizeAccent(SAMPLE_MENU.restaurant.themeColor)).toBe(SAMPLE_MENU.restaurant.themeColor);
  });

  it("uses small local webp images: 6 product photos <= 60 KB and a cover <= 90 KB", () => {
    const productImages = products.map((p) => p.imageUrl).filter((url): url is string => url !== null);
    expect(productImages).toHaveLength(6);
    expect(new Set(productImages).size).toBe(6);
    for (const url of productImages) {
      expect(url).toMatch(/^\/preview\/[a-z-]+\.webp$/);
      const file = join(publicDir, url);
      expect(existsSync(file), url).toBe(true);
      expect(statSync(file).size, url).toBeLessThanOrEqual(60 * 1024);
    }
    const cover = SAMPLE_MENU.restaurant.coverUrl!;
    expect(cover).toBe("/preview/cover.webp");
    expect(statSync(join(publicDir, cover)).size).toBeLessThanOrEqual(90 * 1024);
  });
});
