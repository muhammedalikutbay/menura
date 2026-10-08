import { formatMoney } from "@/lib/money";
import { allergenLabel, tagLabel } from "@/lib/menu-attributes";
import { normalizeForSearch } from "@/lib/text";
import type { PublicProduct } from "./types";

/** Everything the detail sheet shows, already formatted so the client needs no domain logic. */
export type SheetProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: string;
  /** Present when discounted: `price` is the new price and this is the old one. */
  oldPrice: string | null;
  isAvailable: boolean;
  tags: string[];
  allergens: string[];
  calories: number | null;
  prepTime: string | null;
};

export function toSheetProduct(product: PublicProduct, currency: string): SheetProduct {
  const discounted = product.discountPriceMinor != null;
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    price: formatMoney(discounted ? product.discountPriceMinor! : product.priceMinor, currency),
    oldPrice: discounted ? formatMoney(product.priceMinor, currency) : null,
    isAvailable: product.isAvailable,
    tags: product.tags.map(tagLabel),
    allergens: product.allergens.map(allergenLabel),
    calories: product.calories,
    prepTime: product.prepTime,
  };
}

/** Normalized text the client-side search matches against (name, description, tags, category). */
export function searchText(product: PublicProduct, categoryName: string): string {
  return normalizeForSearch(
    [product.name, product.description ?? "", product.tags.map(tagLabel).join(" "), categoryName].join(" "),
  );
}
