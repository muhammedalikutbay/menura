import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/dashboard/products",
}));
vi.mock("@/server/session", () => ({ requireRestaurant: vi.fn() }));

const { ProductList } = await import("./product-list");
const { ProductForm } = await import("./product-form");
const { CategoryManager } = await import("../../categories/components/category-manager");

const categories = [
  { id: "c1", name: "Çorbalar", isActive: true },
  { id: "c2", name: "İçecekler", isActive: true },
];

const products = [
  {
    id: "p1",
    categoryId: "c1",
    name: "Mercimek çorbası",
    description: "Süzme",
    imageMediaId: null,
    priceMinor: 8550,
    discountPriceMinor: 7000,
    isAvailable: false,
    isFeatured: true,
  },
  {
    id: "p2",
    categoryId: "c2",
    name: "Ayran",
    description: null,
    imageMediaId: "m1",
    priceMinor: 2500,
    discountPriceMinor: null,
    isAvailable: true,
    isFeatured: false,
  },
];

describe("product list", () => {
  it("renders rows with price, discount and badges", () => {
    const html = renderToStaticMarkup(
      <ProductList products={products} categories={categories} currency="TRY" initialCategoryId={null} />,
    );
    expect(html).toContain("Mercimek çorbası");
    expect(html).toContain("Tükendi");
    expect(html).toContain("Öne çıkan");
    expect(html).toContain("<s>");
    expect(html).toContain("/media/m1");
    expect(html).toContain("2 ürün");
    expect(html).toContain("Sıralamak için bir kategori seçin.");
  });

  it("enables drag reorder when filtered by a category", () => {
    const html = renderToStaticMarkup(
      <ProductList products={products} categories={categories} currency="TRY" initialCategoryId="c1" />,
    );
    expect(html).toContain("Mercimek çorbası");
    expect(html).not.toContain("Ayran");
    expect(html).toContain("sırasını değiştir");
  });

  it("ignores an unknown category in the URL", () => {
    const html = renderToStaticMarkup(
      <ProductList products={products} categories={categories} currency="TRY" initialCategoryId="nope" />,
    );
    expect(html).toContain("Ayran");
  });

  it("shows the empty state without products", () => {
    const html = renderToStaticMarkup(
      <ProductList products={[]} categories={categories} currency="TRY" initialCategoryId={null} />,
    );
    expect(html).toContain("Henüz ürün yok");
  });
});

describe("product form", () => {
  it("renders every field, the 14 allergens and the legal helper text", () => {
    const html = renderToStaticMarkup(
      <ProductForm
        categories={categories}
        currency="TRY"
        returnHref="/dashboard/products"
        initialValues={{
          name: "",
          categoryId: "c1",
          description: "",
          price: "",
          discountPrice: "",
          imageMediaId: null,
          isAvailable: true,
          isFeatured: false,
          prepTime: "",
          calories: "",
          allergens: ["milk"],
          tags: ["vegan"],
        }}
      />,
    );
    expect(html).toContain("Ürünü ekle");
    expect(html).toContain("yasal bir beyandır");
    expect(html).toContain("15-20 dk");
    expect(html).toContain('inputMode="decimal"');
    expect(html).toContain("₺");
    expect(html.match(/id="allergen-/g)).toHaveLength(14);
    expect(html).toContain('aria-pressed="true"');
  });
});

describe("category manager", () => {
  it("renders the empty state and the list", () => {
    const empty = renderToStaticMarkup(<CategoryManager categories={[]} />);
    expect(empty).toContain("Henüz kategori yok");

    const list = renderToStaticMarkup(
      <CategoryManager
        categories={[
          { id: "c1", name: "Çorbalar", description: "Sıcak", imageMediaId: null, isActive: true, productCount: 3 },
          { id: "c2", name: "Tatlılar", description: null, imageMediaId: null, isActive: false, productCount: 0 },
        ]}
      />,
    );
    expect(list).toContain("Çorbalar");
    expect(list).toContain("3 ürün · Sıcak");
    expect(list).toContain("Gizli");
    expect(list).toContain("2 / 100 kategori");
  });
});
