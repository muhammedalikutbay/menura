import { describe, expect, it } from "vitest";
import type { CategoryListItem } from "@/features/categories/queries";
import type { ProductListItem } from "../queries";
import {
  buildModel,
  categoryProducts,
  containerOf,
  isFiltering,
  moveProduct,
  moveProductsToEnd,
  patchProducts,
  removeCategory,
  removeProducts,
  upsertProduct,
  visibleSections,
  withCategoryOrder,
} from "./builder-model";

const category = (id: string, name: string): CategoryListItem => ({
  id,
  name,
  description: null,
  imageMediaId: null,
  isActive: true,
  productCount: 0,
});

const item = (id: string, categoryId: string, name: string, extra: Partial<ProductListItem> = {}): ProductListItem => ({
  id,
  categoryId,
  name,
  description: null,
  imageMediaId: null,
  priceMinor: 1000,
  discountPriceMinor: null,
  isAvailable: true,
  isFeatured: false,
  prepTime: null,
  calories: null,
  allergens: [],
  tags: [],
  ...extra,
});

const names = (model: ReturnType<typeof buildModel>, id: string) => categoryProducts(model, id).map((row) => row.name);

function sample() {
  return buildModel(
    [category("a", "Çorbalar"), category("b", "İçecekler"), category("c", "Boş")],
    [
      item("1", "a", "Mercimek"),
      item("2", "a", "Ezogelin", { isAvailable: false }),
      item("3", "b", "Ayran", { isFeatured: true, description: "Soğuk" }),
      item("4", "b", "Çay"),
    ],
  );
}

describe("builder model", () => {
  it("groups products by category and keeps empty categories", () => {
    const model = sample();
    expect(model.categories.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
    expect(names(model, "a")).toEqual(["Mercimek", "Ezogelin"]);
    expect(names(model, "c")).toEqual([]);
    expect(containerOf(model, "3")).toBe("b");
    expect(containerOf(model, "nope")).toBeUndefined();
  });

  it("moves a product across categories at an index, into an empty one, and within its own", () => {
    const model = sample();
    const across = moveProduct(model, "1", "b", 1);
    expect(names(across, "a")).toEqual(["Ezogelin"]);
    expect(names(across, "b")).toEqual(["Ayran", "Mercimek", "Çay"]);
    expect(categoryProducts(across, "b")[1]?.categoryId).toBe("b");

    expect(names(moveProduct(model, "2", "c"), "c")).toEqual(["Ezogelin"]);
    expect(names(moveProduct(model, "1", "a", 1), "a")).toEqual(["Ezogelin", "Mercimek"]);
    expect(moveProduct(model, "1", "missing")).toBe(model);
    // The original model is untouched.
    expect(names(model, "a")).toEqual(["Mercimek", "Ezogelin"]);
  });

  it("moves several products to the end of a category in menu order", () => {
    const moved = moveProductsToEnd(sample(), new Set(["4", "1"]), "c");
    expect(names(moved, "c")).toEqual(["Mercimek", "Çay"]);
    expect(names(moved, "a")).toEqual(["Ezogelin"]);
    expect(names(moved, "b")).toEqual(["Ayran"]);
  });

  it("reorders categories, patches, removes and upserts", () => {
    const model = sample();
    expect(withCategoryOrder(model, ["c", "a", "b"]).categories.map((entry) => entry.id)).toEqual(["c", "a", "b"]);
    expect(withCategoryOrder(model, ["a"])).toBe(model);

    expect(categoryProducts(patchProducts(model, new Set(["1"]), { isAvailable: false }), "a")[0]?.isAvailable).toBe(false);
    expect(names(removeProducts(model, new Set(["1", "3"])), "a")).toEqual(["Ezogelin"]);
    expect(removeCategory(model, "b").categories.map((entry) => entry.id)).toEqual(["a", "c"]);

    const edited = upsertProduct(model, item("1", "a", "Mercimek 2"));
    expect(names(edited, "a")).toEqual(["Mercimek 2", "Ezogelin"]);
    const recategorized = upsertProduct(model, item("1", "c", "Mercimek"));
    expect(names(recategorized, "a")).toEqual(["Ezogelin"]);
    expect(names(recategorized, "c")).toEqual(["Mercimek"]);
    const created = upsertProduct(model, item("9", "b", "Yeni"));
    expect(names(created, "b")).toEqual(["Ayran", "Çay", "Yeni"]);
  });

  it("searches Turkish-normalized, filters and hides empty categories", () => {
    const model = sample();
    expect(isFiltering("  ", "all")).toBe(false);
    expect(visibleSections(model, "", "all").map((s) => s.category.id)).toEqual(["a", "b", "c"]);

    // Category names are not searched, only products.
    expect(visibleSections(model, "corba", "all")).toHaveLength(0);

    const byName = visibleSections(model, "çay", "all");
    expect(byName.map((s) => s.category.id)).toEqual(["b"]);
    expect(byName[0]?.products.map((row) => row.name)).toEqual(["Çay"]);

    // Matches the description too, and dotless/dotted i fold together.
    expect(visibleSections(model, "SOGUK", "all")[0]?.products.map((row) => row.name)).toEqual(["Ayran"]);
    expect(visibleSections(model, "ezogelın", "all")[0]?.products.map((row) => row.name)).toEqual(["Ezogelin"]);

    const flat = (query: string, filter: Parameters<typeof visibleSections>[2]) =>
      visibleSections(model, query, filter).flatMap((s) => s.products.map((row) => row.name));
    expect(flat("", "unavailable")).toEqual(["Ezogelin"]);
    expect(flat("", "available")).toEqual(["Mercimek", "Ayran", "Çay"]);
    expect(flat("", "featured")).toEqual(["Ayran"]);
  });
});
