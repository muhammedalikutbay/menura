import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  usePathname: () => "/dashboard/menu",
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock("@/server/session", () => ({ requireRestaurant: vi.fn() }));

const { MenuBuilder } = await import("../builder/menu-builder");
const { BulkBar } = await import("../builder/bulk-bar");
const { ProductForm, useProductForm, emptyProductValues } = await import("./product-form");
const { CategoryIndex, CategoryChips } = await import("../../categories/components/category-index");
const { FirstCategoryCard } = await import("../../categories/components/first-category-card");

const categoryOptions = [
  { id: "c1", name: "Çorbalar", isActive: true },
  { id: "c2", name: "İçecekler", isActive: true },
];

const categories = [
  { id: "c1", name: "Çorbalar", description: "Sıcak", imageMediaId: null, isActive: true, productCount: 1 },
  { id: "c2", name: "İçecekler", description: null, imageMediaId: null, isActive: false, productCount: 1 },
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
    prepTime: null,
    calories: null,
    allergens: [],
    tags: ["vegan", "spicy", "new"],
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
    prepTime: null,
    calories: null,
    allergens: [],
    tags: [],
  },
];

beforeEach(() => {
  search = "";
});

describe("menu builder", () => {
  it("renders category cards with rows, prices, badges, switches and add rows", () => {
    const html = renderToStaticMarkup(<MenuBuilder categories={categories} products={products} currency="TRY" />);
    expect(html).toContain("Menü");
    expect(html).toContain("Çorbalar");
    expect(html).toContain("İçecekler");
    expect(html).toContain("Mercimek çorbası");
    expect(html).toContain("<s");
    expect(html).toContain("/media/m1");
    expect(html).toContain("1 ürün");
    expect(html).toContain("Tükendi");
    expect(html).toContain("Öne çıkan");
    expect(html).toContain("+1"); // the third tag collapses
    expect(html).toContain("Gizli"); // inactive category
    expect(html).toContain('aria-label="Mercimek çorbası stokta"');
    expect(html).toContain('aria-label="Çorbalar menüde göster"');
    expect(html.match(/Ürün ekle/g)).toHaveLength(2);
    expect(html).toContain("Ürünlerde ara");
    expect(html).toContain("Kategori dizini");
    expect(html).toContain("sırasını değiştir");
  });

  it("shows the first-category card when there are no categories", () => {
    const html = renderToStaticMarkup(<MenuBuilder categories={[]} products={[]} currency="TRY" />);
    expect(html).toContain("İlk kategorinizi oluşturun");
    expect(html).toContain("Kategori adı");
    expect(html).not.toContain("Ürünlerde ara");
  });

  it("renders no editor while the URL points at an unknown product", () => {
    search = "product=unknown";
    const html = renderToStaticMarkup(<MenuBuilder categories={categories} products={products} currency="TRY" />);
    expect(html).toContain("Mercimek çorbası");
    expect(html).not.toContain("Ürünü düzenle");
  });
});

describe("category index", () => {
  const entries = [
    { id: "c1", name: "Çorbalar", count: 3, isActive: true },
    { id: "c2", name: "İçecekler", count: 0, isActive: false },
  ];

  it("lists categories with counts and a drag handle for each", () => {
    const html = renderToStaticMarkup(
      <CategoryIndex
        entries={entries}
        activeId="c1"
        dragDisabled={false}
        addDisabled={false}
        onJump={() => {}}
        onReorder={() => {}}
        onAdd={() => {}}
      />,
    );
    expect(html).toContain("Çorbalar");
    expect(html).toContain('aria-current="location"');
    expect(html).toContain("Çorbalar sırasını değiştir");
    expect(html).toContain("Kategori ekle");
  });

  it("drops the handles while dragging is disabled and renders the chip scroller", () => {
    const index = renderToStaticMarkup(
      <CategoryIndex
        entries={entries}
        activeId={null}
        dragDisabled
        addDisabled={false}
        onJump={() => {}}
        onReorder={() => {}}
        onAdd={() => {}}
      />,
    );
    expect(index).not.toContain("sırasını değiştir");

    const chips = renderToStaticMarkup(
      <CategoryChips entries={entries} activeId="c2" addDisabled onJump={() => {}} onAdd={() => {}} />,
    );
    expect(chips).toContain("İçecekler");
    expect(chips).toContain("no-scrollbar");
  });
});

describe("bulk bar", () => {
  it("renders the four actions for a selection and nothing without one", () => {
    const props = { onAvailable: () => {}, onUnavailable: () => {}, onMove: () => {}, onDelete: () => {}, onClear: () => {} };
    const html = renderToStaticMarkup(<BulkBar count={2} {...props} />);
    expect(html).toContain("2 seçili");
    for (const label of ["Stokta yap", "Tükendi", "Taşı", "Sil"]) expect(html).toContain(label);
    expect(renderToStaticMarkup(<BulkBar count={0} {...props} />)).toBe("");
  });
});

describe("first category card", () => {
  it("has an inline name field", () => {
    const html = renderToStaticMarkup(<FirstCategoryCard onCreated={() => {}} />);
    expect(html).toContain("İlk kategorinizi oluşturun");
    expect(html).toContain('placeholder="Örn. Başlangıçlar"');
  });
});

describe("product form", () => {
  function Harness({ categoryId }: { categoryId: string }) {
    const form = useProductForm({
      initialValues: { ...emptyProductValues(categoryId), allergens: ["milk"], tags: ["vegan"] },
      onSaved: () => {},
    });
    return <ProductForm form={form} formId="product-form" categories={categoryOptions} currency="TRY" />;
  }

  it("renders the five groups, the 14 allergens and the legal helper text", () => {
    const html = renderToStaticMarkup(<Harness categoryId="c1" />);
    for (const title of ["Temel bilgiler", "Fiyat", "Görsel", "Alerjen ve etiketler", "Detaylar"]) {
      expect(html).toContain(`>${title}</h3>`);
    }
    expect(html).toContain('id="product-form"');
    expect(html).toContain("yasal bir beyandır");
    expect(html).toContain("15-20 dk");
    expect(html).toContain('inputMode="decimal"');
    expect(html).toContain("₺");
    expect(html.match(/id="allergen-/g)).toHaveLength(14);
    expect(html).toContain('id="allergen-milk"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Vejetaryen");
  });
});
