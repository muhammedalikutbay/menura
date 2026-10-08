import { describe, expect, it } from "vitest";
import { buildMenuJsonLd, decimalPrice, serializeJsonLd } from "./json-ld";
import type { PublicMenu, PublicProduct } from "./types";

const product = (overrides: Partial<PublicProduct> = {}): PublicProduct => ({
  id: "p1",
  name: "Kebap",
  description: null,
  imageUrl: null,
  priceMinor: 25050,
  discountPriceMinor: null,
  isAvailable: true,
  isFeatured: false,
  prepTime: null,
  calories: null,
  allergens: [],
  tags: [],
  ...overrides,
});

const menu = (products: PublicProduct[]): PublicMenu => ({
  restaurant: {
    id: "r1",
    slug: "deniz",
    name: "Deniz </script> Balık",
    description: null,
    logoUrl: null,
    coverUrl: "/media/cover-id",
    phone: "+90 212 555 00 11",
    address: "Kadıköy",
    instagram: "@deniz",
    website: "javascript:alert(1)",
    wifiName: null,
    wifiPassword: null,
    currency: "TRY",
    themeColor: "#0071e3",
    isPublished: true,
    showVatNote: true,
    hideUnavailable: false,
  },
  categories: [{ id: "c1", name: "Ana yemekler", description: null, products }],
  featured: [],
  isOwner: false,
  isPreview: false,
});

describe("buildMenuJsonLd", () => {
  it("formats prices as decimal strings", () => {
    expect(decimalPrice(25050)).toBe("250.50");
    expect(decimalPrice(9900)).toBe("99.00");
  });

  it("builds Restaurant > Menu > MenuSection > MenuItem with offers", () => {
    const json = buildMenuJsonLd(
      menu([product({ discountPriceMinor: 20000, tags: ["vegan"], isAvailable: false })]),
      "https://menura.app",
    );
    expect(json["@type"]).toBe("Restaurant");
    expect(json.url).toBe("https://menura.app/m/deniz");
    expect(json.image).toBe("https://menura.app/media/cover-id");
    expect(json.sameAs).toEqual(["https://instagram.com/deniz"]); // the unsafe website is dropped
    const item = json.hasMenu.hasMenuSection[0]!.hasMenuItem[0]!;
    expect(item).toMatchObject({
      "@type": "MenuItem",
      name: "Kebap",
      suitableForDiet: ["https://schema.org/VeganDiet"],
      offers: { price: "200.00", priceCurrency: "TRY", availability: "https://schema.org/OutOfStock" },
    });
  });

  it("escapes the less-than sign so no value can close the script tag", () => {
    const serialized = serializeJsonLd(buildMenuJsonLd(menu([product()]), "https://menura.app"));
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized).name).toBe("Deniz </script> Balık");
  });
});
