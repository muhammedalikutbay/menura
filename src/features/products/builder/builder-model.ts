import type { CategoryListItem } from "@/features/categories/queries";
import { normalizeForSearch } from "@/lib/text";
import type { ProductListItem } from "../queries";

/** A category as the builder sees it; the product count is derived from the model. */
export type BuilderCategory = Omit<CategoryListItem, "productCount">;

/** Everything the builder renders: categories in menu order and each category's products in order. */
export type BuilderModel = {
  categories: BuilderCategory[];
  products: Record<string, ProductListItem[]>;
};

export type BuilderFilter = "all" | "available" | "unavailable" | "featured";

export const FILTER_LABELS: Record<BuilderFilter, string> = {
  all: "Tümü",
  available: "Stokta",
  unavailable: "Tükendi",
  featured: "Öne çıkanlar",
};

export function buildModel(categories: CategoryListItem[], products: ProductListItem[]): BuilderModel {
  const grouped: Record<string, ProductListItem[]> = {};
  for (const item of categories) grouped[item.id] = [];
  for (const item of products) (grouped[item.categoryId] ??= []).push(item);
  return {
    categories: categories.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageMediaId: item.imageMediaId,
      isActive: item.isActive,
    })),
    products: grouped,
  };
}

export function categoryProducts(model: BuilderModel, categoryId: string): ProductListItem[] {
  return model.products[categoryId] ?? [];
}

export function allProducts(model: BuilderModel): ProductListItem[] {
  return model.categories.flatMap((item) => categoryProducts(model, item.id));
}

export function findProduct(model: BuilderModel, productId: string): ProductListItem | undefined {
  for (const item of model.categories) {
    const found = categoryProducts(model, item.id).find((row) => row.id === productId);
    if (found) return found;
  }
  return undefined;
}

/** Id of the category that holds `productId`, if any. */
export function containerOf(model: BuilderModel, productId: string): string | undefined {
  return model.categories.find((item) => categoryProducts(model, item.id).some((row) => row.id === productId))?.id;
}

/**
 * Moves one product into `toCategoryId` at `index` (end when omitted). Works inside one category
 * too, in which case it is a reorder.
 */
export function moveProduct(model: BuilderModel, productId: string, toCategoryId: string, index?: number): BuilderModel {
  const from = containerOf(model, productId);
  const moving = findProduct(model, productId);
  if (!from || !moving || !(toCategoryId in model.products)) return model;

  const source = categoryProducts(model, from).filter((row) => row.id !== productId);
  const base = from === toCategoryId ? source : categoryProducts(model, toCategoryId);
  const at = index === undefined ? base.length : Math.max(0, Math.min(index, base.length));
  const target = [...base.slice(0, at), { ...moving, categoryId: toCategoryId }, ...base.slice(at)];

  return {
    ...model,
    products: { ...model.products, [from]: source, [toCategoryId]: target },
  };
}

/** Moves several products to the end of a category, keeping their current menu order. */
export function moveProductsToEnd(model: BuilderModel, ids: ReadonlySet<string>, toCategoryId: string): BuilderModel {
  if (!(toCategoryId in model.products)) return model;
  const moved: ProductListItem[] = [];
  const next: Record<string, ProductListItem[]> = {};
  for (const item of model.categories) {
    const rows = categoryProducts(model, item.id);
    if (item.id === toCategoryId) {
      next[item.id] = rows;
      continue;
    }
    next[item.id] = rows.filter((row) => {
      if (!ids.has(row.id)) return true;
      moved.push({ ...row, categoryId: toCategoryId });
      return false;
    });
  }
  next[toCategoryId] = [...categoryProducts(model, toCategoryId), ...moved];
  return { ...model, products: next };
}

export function withCategoryOrder(model: BuilderModel, orderedIds: string[]): BuilderModel {
  const byId = new Map(model.categories.map((item) => [item.id, item]));
  const ordered = orderedIds.flatMap((id) => byId.get(id) ?? []);
  if (ordered.length !== model.categories.length) return model;
  return { ...model, categories: ordered };
}

export function patchProducts(model: BuilderModel, ids: ReadonlySet<string>, patch: Partial<ProductListItem>): BuilderModel {
  const next: Record<string, ProductListItem[]> = {};
  for (const [categoryId, rows] of Object.entries(model.products)) {
    next[categoryId] = rows.map((row) => (ids.has(row.id) ? { ...row, ...patch } : row));
  }
  return { ...model, products: next };
}

export function removeProducts(model: BuilderModel, ids: ReadonlySet<string>): BuilderModel {
  const next: Record<string, ProductListItem[]> = {};
  for (const [categoryId, rows] of Object.entries(model.products)) {
    next[categoryId] = rows.filter((row) => !ids.has(row.id));
  }
  return { ...model, products: next };
}

/**
 * Applies a saved product: replaces it in place, moves it to the end of its new category when the
 * category changed, or appends it when it is new.
 */
export function upsertProduct(model: BuilderModel, item: ProductListItem): BuilderModel {
  const from = containerOf(model, item.id);
  if (from === item.categoryId) {
    return {
      ...model,
      products: {
        ...model.products,
        [from]: categoryProducts(model, from).map((row) => (row.id === item.id ? item : row)),
      },
    };
  }
  const without = from ? removeProducts(model, new Set([item.id])) : model;
  if (!(item.categoryId in without.products)) return without;
  return {
    ...without,
    products: { ...without.products, [item.categoryId]: [...categoryProducts(without, item.categoryId), item] },
  };
}

export function patchCategory(model: BuilderModel, id: string, patch: Partial<BuilderCategory>): BuilderModel {
  return { ...model, categories: model.categories.map((item) => (item.id === id ? { ...item, ...patch } : item)) };
}

export function removeCategory(model: BuilderModel, id: string): BuilderModel {
  const products = { ...model.products };
  delete products[id];
  return { categories: model.categories.filter((item) => item.id !== id), products };
}

export function isFiltering(query: string, filter: BuilderFilter): boolean {
  return normalizeForSearch(query) !== "" || filter !== "all";
}

function matches(item: ProductListItem, normalizedQuery: string, filter: BuilderFilter): boolean {
  if (filter === "available" && !item.isAvailable) return false;
  if (filter === "unavailable" && item.isAvailable) return false;
  if (filter === "featured" && !item.isFeatured) return false;
  if (normalizedQuery === "") return true;
  return normalizeForSearch(`${item.name} ${item.description ?? ""}`).includes(normalizedQuery);
}

/**
 * The categories and rows to render. Without a search or filter this is the whole model; with
 * one, only matching rows remain and categories left empty are hidden.
 */
export function visibleSections(
  model: BuilderModel,
  query: string,
  filter: BuilderFilter,
): { category: BuilderCategory; products: ProductListItem[] }[] {
  const filtering = isFiltering(query, filter);
  const normalizedQuery = normalizeForSearch(query);
  return model.categories.flatMap((category) => {
    const rows = categoryProducts(model, category.id);
    if (!filtering) return [{ category, products: rows }];
    const matching = rows.filter((row) => matches(row, normalizedQuery, filter));
    return matching.length > 0 ? [{ category, products: matching }] : [];
  });
}
