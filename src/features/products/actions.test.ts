import { asc, eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { category, media, product } from "@/db/schema";
import { createTenant, currentTenant, sessionMock, signInAs } from "../../../test/helpers";

vi.mock("@/server/session", () => sessionMock());

const {
  createProduct,
  deleteProduct,
  deleteProducts,
  duplicateProduct,
  moveProducts,
  moveProductToCategory,
  reorderProducts,
  setProductAvailability,
  setProductsAvailability,
  updateProduct,
} = await import("./actions");
const { getProduct, listProducts } = await import("./queries");
const { productSchema } = await import("./schema");

type Tenant = Awaited<ReturnType<typeof createTenant>>;

async function addMedia(tenant: Tenant) {
  const [row] = await db
    .insert(media)
    .values({
      restaurantId: tenant.restaurant.id,
      contentType: "image/webp",
      width: 1,
      height: 1,
      byteSize: 1,
      data: Buffer.from([1]),
    })
    .returning({ id: media.id });
  return row!.id;
}

async function addCategory(tenant: Tenant, name = "Kategori", position = 0) {
  const [row] = await db.insert(category).values({ restaurantId: tenant.restaurant.id, name, position }).returning();
  return row!;
}

async function addProduct(
  tenant: Tenant,
  categoryId: string,
  name: string,
  position = 0,
  extra: Partial<typeof product.$inferInsert> = {},
) {
  const [row] = await db
    .insert(product)
    .values({ restaurantId: tenant.restaurant.id, categoryId, name, priceMinor: 1000, position, ...extra })
    .returning();
  return row!;
}

const mediaExists = async (id: string) => (await db.select().from(media).where(eq(media.id, id))).length === 1;

async function namesIn(categoryId: string) {
  const rows = await db.select().from(product).where(eq(product.categoryId, categoryId)).orderBy(asc(product.position));
  return rows.map((row) => row.name);
}

const baseInput = (categoryId: string) => ({
  name: "Mercimek çorbası",
  categoryId,
  description: "",
  price: "85,50",
  discountPrice: "",
  imageMediaId: null,
  isAvailable: true,
  isFeatured: false,
  prepTime: "",
  calories: "",
  allergens: [],
  tags: [],
});

describe("productSchema", () => {
  it("converts prices to minor units and normalizes optional fields", () => {
    const parsed = productSchema.parse({
      ...baseInput("c1"),
      price: "1.250,75",
      discountPrice: "999",
      description: "  ",
      prepTime: " 15-20 dk ",
      calories: "420",
      allergens: ["milk", "milk", "eggs"],
    });
    expect(parsed).toMatchObject({
      price: 125075,
      discountPrice: 99900,
      description: null,
      prepTime: "15-20 dk",
      calories: 420,
      allergens: ["milk", "eggs"],
    });
  });

  it("rejects bad prices with the Turkish message", () => {
    const result = productSchema.safeParse({ ...baseInput("c1"), price: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("Geçerli bir fiyat girin.");
    expect(productSchema.safeParse({ ...baseInput("c1"), price: "" }).success).toBe(false);
    expect(productSchema.safeParse({ ...baseInput("c1"), price: "-5" }).success).toBe(false);
    expect(productSchema.safeParse({ ...baseInput("c1"), price: "99999999" }).success).toBe(false);
  });

  it("rejects a discount that is not lower than the price", () => {
    for (const discountPrice of ["85,50", "100"]) {
      const result = productSchema.safeParse({ ...baseInput("c1"), discountPrice });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues.some((i) => i.path[0] === "discountPrice")).toBe(true);
    }
    expect(productSchema.safeParse({ ...baseInput("c1"), discountPrice: "70" }).success).toBe(true);
  });

  it("rejects unknown allergens and out-of-range calories", () => {
    expect(productSchema.safeParse({ ...baseInput("c1"), allergens: ["pollen"] }).success).toBe(false);
    expect(productSchema.safeParse({ ...baseInput("c1"), tags: ["keto"] }).success).toBe(false);
    expect(productSchema.safeParse({ ...baseInput("c1"), calories: "5001" }).success).toBe(false);
    expect(productSchema.safeParse({ ...baseInput("c1"), calories: "12.5" }).success).toBe(false);
    expect(productSchema.safeParse({ ...baseInput("c1"), prepTime: "x".repeat(21) }).success).toBe(false);
  });
});

describe("product actions", () => {
  let a: Tenant;
  let b: Tenant;
  let catA: Awaited<ReturnType<typeof addCategory>>;
  let catB: Awaited<ReturnType<typeof addCategory>>;

  beforeEach(async () => {
    currentTenant.user = null;
    currentTenant.restaurant = null;
    a = await createTenant();
    b = await createTenant();
    catA = await addCategory(a);
    catB = await addCategory(b);
    signInAs(a);
  });

  describe("createProduct", () => {
    it("creates a product at the end of its category", async () => {
      await addProduct(a, catA.id, "Mevcut", 4);
      const result = await createProduct({
        ...baseInput(catA.id),
        discountPrice: "70",
        calories: "250",
        allergens: ["milk"],
        tags: ["vegetarian"],
        prepTime: "15-20 dk",
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const created = await getProduct(a.restaurant.id, result.data.id);
      expect(created).toMatchObject({
        name: "Mercimek çorbası",
        priceMinor: 8550,
        discountPriceMinor: 7000,
        calories: 250,
        allergens: ["milk"],
        tags: ["vegetarian"],
        prepTime: "15-20 dk",
        position: 5,
      });
    });

    it("rejects a discount at or above the price with a field error", async () => {
      const result = await createProduct({ ...baseInput(catA.id), discountPrice: "90" });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors?.discountPrice).toBeDefined();
      expect(await db.select().from(product).where(eq(product.restaurantId, a.restaurant.id))).toHaveLength(0);
    });

    it("rejects invalid prices and names", async () => {
      const badPrice = await createProduct({ ...baseInput(catA.id), price: "bedava" });
      expect(badPrice.ok).toBe(false);
      if (!badPrice.ok) expect(badPrice.fieldErrors?.price).toEqual(["Geçerli bir fiyat girin."]);
      expect((await createProduct({ ...baseInput(catA.id), name: " " })).ok).toBe(false);
      expect((await createProduct({ ...baseInput(catA.id), name: "x".repeat(81) })).ok).toBe(false);
    });

    it("rejects a category from another restaurant or a missing one", async () => {
      const foreign = await createProduct(baseInput(catB.id));
      expect(foreign.ok).toBe(false);
      if (!foreign.ok) expect(foreign.fieldErrors?.categoryId).toBeDefined();
      expect((await createProduct(baseInput("missing"))).ok).toBe(false);
      expect(await db.select().from(product).where(eq(product.categoryId, catB.id))).toHaveLength(0);
    });

    it("rejects an image from another restaurant", async () => {
      const foreignImage = await addMedia(b);
      const result = await createProduct({ ...baseInput(catA.id), imageMediaId: foreignImage });
      expect(result.ok).toBe(false);
    });

    it("enforces the 1000 product limit", async () => {
      await db
        .insert(product)
        .values(
          Array.from({ length: 1000 }, (_, i) => ({
            restaurantId: a.restaurant.id,
            categoryId: catA.id,
            name: `P${i}`,
            priceMinor: 100,
            position: i,
          })),
        );
      const result = await createProduct(baseInput(catA.id));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("1000");
    });
  });

  describe("updateProduct", () => {
    it("updates fields and releases the replaced image", async () => {
      const oldImage = await addMedia(a);
      const newImage = await addMedia(a);
      const row = await addProduct(a, catA.id, "Eski", 0, { imageMediaId: oldImage });

      const result = await updateProduct(row.id, {
        ...baseInput(catA.id),
        name: "Yeni",
        price: "100",
        imageMediaId: newImage,
        isFeatured: true,
      });
      expect(result.ok).toBe(true);

      const updated = await getProduct(a.restaurant.id, row.id);
      expect(updated).toMatchObject({ name: "Yeni", priceMinor: 10000, imageMediaId: newImage, isFeatured: true });
      expect(await mediaExists(oldImage)).toBe(false);
      expect(await mediaExists(newImage)).toBe(true);
    });

    it("keeps an image that another product still uses", async () => {
      const shared = await addMedia(a);
      const row = await addProduct(a, catA.id, "A", 0, { imageMediaId: shared });
      await addProduct(a, catA.id, "B", 1, { imageMediaId: shared });
      await updateProduct(row.id, { ...baseInput(catA.id), imageMediaId: null });
      expect(await mediaExists(shared)).toBe(true);
    });

    it("rejects a discount that is not lower than the price", async () => {
      const row = await addProduct(a, catA.id, "P");
      const result = await updateProduct(row.id, { ...baseInput(catA.id), price: "50", discountPrice: "60" });
      expect(result.ok).toBe(false);
      expect((await getProduct(a.restaurant.id, row.id))?.priceMinor).toBe(1000);
    });

    it("moves a product to the end of another category when its category changes", async () => {
      const second = await addCategory(a, "İkinci", 1);
      await addProduct(a, second.id, "Orada", 3);
      const row = await addProduct(a, catA.id, "Gezgin");
      await updateProduct(row.id, { ...baseInput(second.id), name: "Gezgin" });
      expect(await namesIn(second.id)).toEqual(["Orada", "Gezgin"]);
    });

    it("rejects a foreign category or image", async () => {
      const row = await addProduct(a, catA.id, "P");
      expect((await updateProduct(row.id, baseInput(catB.id))).ok).toBe(false);
      const foreignImage = await addMedia(b);
      expect((await updateProduct(row.id, { ...baseInput(catA.id), imageMediaId: foreignImage })).ok).toBe(false);
      expect((await getProduct(a.restaurant.id, row.id))?.categoryId).toBe(catA.id);
    });

    it("cannot update another tenant's product", async () => {
      const foreign = await addProduct(b, catB.id, "B ürünü");
      const result = await updateProduct(foreign.id, { ...baseInput(catA.id), name: "Ele geçirildi" });
      expect(result.ok).toBe(false);
      const unchanged = await getProduct(b.restaurant.id, foreign.id);
      expect(unchanged).toMatchObject({ name: "B ürünü", categoryId: catB.id });
    });
  });

  describe("deleteProduct / deleteProducts", () => {
    it("deletes and releases images that are no longer used", async () => {
      const image = await addMedia(a);
      const row = await addProduct(a, catA.id, "P", 0, { imageMediaId: image });
      expect((await deleteProduct(row.id)).ok).toBe(true);
      expect(await getProduct(a.restaurant.id, row.id)).toBeNull();
      expect(await mediaExists(image)).toBe(false);
    });

    it("bulk deletes only the tenant's own products", async () => {
      const own1 = await addProduct(a, catA.id, "A1");
      const own2 = await addProduct(a, catA.id, "A2");
      const foreign = await addProduct(b, catB.id, "B1");

      const result = await deleteProducts([own1.id, own2.id, foreign.id]);
      expect(result).toEqual({ ok: true, data: { deleted: 2 } });
      expect(await getProduct(b.restaurant.id, foreign.id)).not.toBeNull();
    });

    it("fails when nothing belongs to the tenant", async () => {
      const foreign = await addProduct(b, catB.id, "B1");
      expect((await deleteProduct(foreign.id)).ok).toBe(false);
      expect((await deleteProducts([])).ok).toBe(false);
      expect(await getProduct(b.restaurant.id, foreign.id)).not.toBeNull();
    });
  });

  describe("availability", () => {
    it("toggles one and many, never across tenants", async () => {
      const own1 = await addProduct(a, catA.id, "A1");
      const own2 = await addProduct(a, catA.id, "A2");
      const foreign = await addProduct(b, catB.id, "B1");

      expect((await setProductAvailability(own1.id, false)).ok).toBe(true);
      expect((await getProduct(a.restaurant.id, own1.id))?.isAvailable).toBe(false);

      const bulk = await setProductsAvailability([own1.id, own2.id, foreign.id], false);
      expect(bulk).toEqual({ ok: true, data: { updated: 2 } });
      expect((await getProduct(b.restaurant.id, foreign.id))?.isAvailable).toBe(true);

      expect((await setProductAvailability(foreign.id, false)).ok).toBe(false);
      expect((await getProduct(b.restaurant.id, foreign.id))?.isAvailable).toBe(true);
    });
  });

  describe("moveProducts", () => {
    it("moves products to the end of the target category preserving order", async () => {
      const target = await addCategory(a, "Hedef", 1);
      await addProduct(a, target.id, "T1", 0);
      const p1 = await addProduct(a, catA.id, "P1", 0);
      const p2 = await addProduct(a, catA.id, "P2", 1);
      await addProduct(a, catA.id, "P3", 2);

      const result = await moveProducts([p2.id, p1.id], target.id);
      expect(result).toEqual({ ok: true, data: { moved: 2 } });
      expect(await namesIn(target.id)).toEqual(["T1", "P1", "P2"]);
      expect(await namesIn(catA.id)).toEqual(["P3"]);
    });

    it("refuses a foreign target category and foreign products", async () => {
      const own = await addProduct(a, catA.id, "A1");
      const foreign = await addProduct(b, catB.id, "B1");
      const ownTarget = await addCategory(a, "Hedef", 1);

      expect((await moveProducts([own.id], catB.id)).ok).toBe(false);
      expect((await getProduct(a.restaurant.id, own.id))?.categoryId).toBe(catA.id);

      const result = await moveProducts([foreign.id], ownTarget.id);
      expect(result).toEqual({ ok: true, data: { moved: 0 } });
      expect((await getProduct(b.restaurant.id, foreign.id))?.categoryId).toBe(catB.id);
    });

    it("tenant B cannot move products into tenant A's category", async () => {
      const bProduct = await addProduct(b, catB.id, "B1");
      signInAs(b);
      const result = await moveProducts([bProduct.id], catA.id);
      expect(result.ok).toBe(false);
      expect((await getProduct(b.restaurant.id, bProduct.id))?.categoryId).toBe(catB.id);
    });
  });

  describe("duplicateProduct", () => {
    it("creates a copy right after the original", async () => {
      const image = await addMedia(a);
      const first = await addProduct(a, catA.id, "Birinci", 0);
      const original = await addProduct(a, catA.id, "Çorba", 1, {
        imageMediaId: image,
        priceMinor: 5000,
        discountPriceMinor: 4000,
        allergens: ["milk"],
        tags: ["vegan"],
        isFeatured: true,
        calories: 100,
        prepTime: "10 dk",
      });
      await addProduct(a, catA.id, "Üçüncü", 2);

      const result = await duplicateProduct(original.id);
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(await namesIn(catA.id)).toEqual(["Birinci", "Çorba", "Çorba (kopya)", "Üçüncü"]);
      const copy = await getProduct(a.restaurant.id, result.data.id);
      expect(copy).toMatchObject({
        categoryId: catA.id,
        imageMediaId: image,
        priceMinor: 5000,
        discountPriceMinor: 4000,
        allergens: ["milk"],
        tags: ["vegan"],
        isFeatured: true,
        calories: 100,
        prepTime: "10 dk",
      });
      expect(first.id).not.toBe(copy?.id);

      // The shared image stays while either product uses it.
      await deleteProduct(original.id);
      expect(await mediaExists(image)).toBe(true);
    });

    it("keeps the copy name within 80 characters", async () => {
      const original = await addProduct(a, catA.id, "x".repeat(80));
      const result = await duplicateProduct(original.id);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const copy = await getProduct(a.restaurant.id, result.data.id);
      expect(copy?.name.length).toBeLessThanOrEqual(80);
      expect(copy?.name.endsWith(" (kopya)")).toBe(true);
    });

    it("cannot duplicate another tenant's product", async () => {
      const foreign = await addProduct(b, catB.id, "B1");
      expect((await duplicateProduct(foreign.id)).ok).toBe(false);
      expect(await db.select().from(product).where(eq(product.categoryId, catB.id))).toHaveLength(1);
    });
  });

  describe("reorderProducts", () => {
    it("writes the new order within the category", async () => {
      const p1 = await addProduct(a, catA.id, "P1", 0);
      const p2 = await addProduct(a, catA.id, "P2", 1);
      const p3 = await addProduct(a, catA.id, "P3", 2);

      expect((await reorderProducts(catA.id, [p3.id, p1.id, p2.id])).ok).toBe(true);
      expect(await namesIn(catA.id)).toEqual(["P3", "P1", "P2"]);
    });

    it("rejects partial, duplicated, unknown and cross-category id lists", async () => {
      const other = await addCategory(a, "Diğer", 1);
      const p1 = await addProduct(a, catA.id, "P1", 0);
      const p2 = await addProduct(a, catA.id, "P2", 1);
      const elsewhere = await addProduct(a, other.id, "X", 0);
      const foreign = await addProduct(b, catB.id, "B1", 0);

      expect((await reorderProducts(catA.id, [p1.id])).ok).toBe(false);
      expect((await reorderProducts(catA.id, [p1.id, p1.id])).ok).toBe(false);
      expect((await reorderProducts(catA.id, [p1.id, p2.id, "nope"])).ok).toBe(false);
      expect((await reorderProducts(catA.id, [p1.id, elsewhere.id])).ok).toBe(false);
      expect((await reorderProducts(catA.id, [p1.id, foreign.id])).ok).toBe(false);
      expect((await reorderProducts(catA.id, "nope")).ok).toBe(false);
      expect(await namesIn(catA.id)).toEqual(["P1", "P2"]);
    });

    it("cannot reorder another tenant's category", async () => {
      const b1 = await addProduct(b, catB.id, "B1", 0);
      const b2 = await addProduct(b, catB.id, "B2", 1);
      const result = await reorderProducts(catB.id, [b2.id, b1.id]);
      expect(result.ok).toBe(false);
      expect(await namesIn(catB.id)).toEqual(["B1", "B2"]);
    });
  });

  describe("moveProductToCategory", () => {
    it("moves a product into another category at the given position", async () => {
      const other = await addCategory(a, "Diğer", 1);
      const p1 = await addProduct(a, catA.id, "P1", 0);
      const p2 = await addProduct(a, catA.id, "P2", 1);
      const o1 = await addProduct(a, other.id, "O1", 0);
      const o2 = await addProduct(a, other.id, "O2", 1);

      expect((await moveProductToCategory(p1.id, other.id, [o1.id, p1.id, o2.id])).ok).toBe(true);
      expect(await namesIn(other.id)).toEqual(["O1", "P1", "O2"]);
      expect(await namesIn(catA.id)).toEqual(["P2"]);
      expect((await getProduct(a.restaurant.id, p1.id))?.categoryId).toBe(other.id);

      // Into an empty category.
      const empty = await addCategory(a, "Boş", 2);
      expect((await moveProductToCategory(p2.id, empty.id, [p2.id])).ok).toBe(true);
      expect(await namesIn(empty.id)).toEqual(["P2"]);
    });

    it("reorders when dropped inside its own category", async () => {
      const p1 = await addProduct(a, catA.id, "P1", 0);
      const p2 = await addProduct(a, catA.id, "P2", 1);
      expect((await moveProductToCategory(p1.id, catA.id, [p2.id, p1.id])).ok).toBe(true);
      expect(await namesIn(catA.id)).toEqual(["P2", "P1"]);
    });

    it("rejects an order that is not the target's products plus the moved one", async () => {
      const other = await addCategory(a, "Diğer", 1);
      const p1 = await addProduct(a, catA.id, "P1", 0);
      const o1 = await addProduct(a, other.id, "O1", 0);
      const foreign = await addProduct(b, catB.id, "B1", 0);

      expect((await moveProductToCategory(p1.id, other.id, [p1.id])).ok).toBe(false);
      expect((await moveProductToCategory(p1.id, other.id, [o1.id])).ok).toBe(false);
      expect((await moveProductToCategory(p1.id, other.id, [o1.id, p1.id, p1.id])).ok).toBe(false);
      expect((await moveProductToCategory(p1.id, other.id, [o1.id, p1.id, foreign.id])).ok).toBe(false);
      expect((await moveProductToCategory(p1.id, other.id, "nope")).ok).toBe(false);
      expect(await namesIn(catA.id)).toEqual(["P1"]);
      expect(await namesIn(other.id)).toEqual(["O1"]);
    });

    it("never crosses tenants", async () => {
      const mine = await addProduct(a, catA.id, "A1", 0);
      const foreign = await addProduct(b, catB.id, "B1", 0);

      // Tenant A cannot move its product into tenant B's category.
      expect((await moveProductToCategory(mine.id, catB.id, [foreign.id, mine.id])).ok).toBe(false);
      // Tenant A cannot move tenant B's product into its own category.
      expect((await moveProductToCategory(foreign.id, catA.id, [mine.id, foreign.id])).ok).toBe(false);
      expect(await namesIn(catA.id)).toEqual(["A1"]);
      expect(await namesIn(catB.id)).toEqual(["B1"]);
      expect((await getProduct(b.restaurant.id, foreign.id))?.categoryId).toBe(catB.id);
    });
  });

  describe("listProducts", () => {
    it("returns the tenant's products in menu order", async () => {
      const second = await addCategory(a, "İkinci", 1);
      await addProduct(a, second.id, "S1", 0);
      await addProduct(a, catA.id, "A2", 1);
      await addProduct(a, catA.id, "A1", 0);
      await addProduct(b, catB.id, "Yabancı", 0);

      const list = await listProducts(a.restaurant.id);
      expect(list.map((p) => p.name)).toEqual(["A1", "A2", "S1"]);
    });

    it("includes the fields the editor needs", async () => {
      await addProduct(a, catA.id, "Detaylı", 0, {
        prepTime: "10 dk",
        calories: 320,
        allergens: ["milk"],
        tags: ["vegan"],
      });
      const [item] = await listProducts(a.restaurant.id);
      expect(item).toMatchObject({ prepTime: "10 dk", calories: 320, allergens: ["milk"], tags: ["vegan"] });
    });
  });
});
