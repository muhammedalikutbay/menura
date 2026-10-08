import type { PublicMenu, PublicProduct } from "./queries";
import { instagramHandle, instagramUrl, safeHttpUrl } from "./links";

const DIET_URLS: Record<string, string> = {
  vegetarian: "https://schema.org/VegetarianDiet",
  vegan: "https://schema.org/VeganDiet",
  gluten_free: "https://schema.org/GlutenFreeDiet",
};

/** Decimal string with two digits, as schema.org expects for `offers.price`. */
export function decimalPrice(minor: number): string {
  return (minor / 100).toFixed(2);
}

function menuItem(product: PublicProduct, currency: string, baseUrl: string) {
  const diets = product.tags.map((tag) => DIET_URLS[tag]).filter((url): url is string => Boolean(url));
  return {
    "@type": "MenuItem",
    name: product.name,
    ...(product.description && { description: product.description }),
    ...(product.imageUrl && { image: `${baseUrl}${product.imageUrl}` }),
    ...(diets.length > 0 && { suitableForDiet: diets }),
    offers: {
      "@type": "Offer",
      price: decimalPrice(product.discountPriceMinor ?? product.priceMinor),
      priceCurrency: currency,
      availability: product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

/** schema.org Restaurant → Menu → MenuSection → MenuItem for the public menu page. */
export function buildMenuJsonLd(menu: PublicMenu, baseUrl: string) {
  const { restaurant, categories } = menu;
  const url = `${baseUrl}/m/${restaurant.slug}`;
  const handle = restaurant.instagram ? instagramHandle(restaurant.instagram) : null;
  const site = restaurant.website ? safeHttpUrl(restaurant.website) : null;
  const sameAs = [handle ? instagramUrl(handle) : null, site?.href ?? null].filter(
    (value): value is string => Boolean(value),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url,
    ...(restaurant.description && { description: restaurant.description }),
    ...(restaurant.coverUrl && { image: `${baseUrl}${restaurant.coverUrl}` }),
    ...(restaurant.phone && { telephone: restaurant.phone }),
    ...(restaurant.address && { address: { "@type": "PostalAddress", streetAddress: restaurant.address } }),
    ...(sameAs.length > 0 && { sameAs }),
    hasMenu: {
      "@type": "Menu",
      name: `${restaurant.name} menüsü`,
      url,
      inLanguage: "tr",
      hasMenuSection: categories.map((category) => ({
        "@type": "MenuSection",
        name: category.name,
        ...(category.description && { description: category.description }),
        hasMenuItem: category.products.map((product) => menuItem(product, restaurant.currency, baseUrl)),
      })),
    },
  };
}

/** JSON for an inline `<script type="application/ld+json">`; `<` is escaped so no value can close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
