import { asc, eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { category, media, product } from "@/db/schema";
import { createTenant, currentTenant, sessionMock, signInAs } from "../../../test/helpers";

vi.mock("@/server/session", () => sessionMock());

const { createCategory, deleteCategory, reorderCategories, setCategoryActive, updateCategory } = await import(
  "./actions"
);
const { listCategories } = await import("./queries");

type Tenant = Awaited<ReturnType<typeof createTenant>>;

const valid = { name: "Başlangıçlar", description: "", imageMediaId: null, isActive: true };

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

async function addCategory(tenant: Tenant, name: string, position: number, imageMediaId: string | null = null) {
  const [row] = await db
    .insert(category)
    .values({ restaurantId: tenant.restaurant.id, name, position, imageMediaId })
    .returning();
  return row!;
}

async function addProduct(tenant: Tenant, categoryId: string, name: string, imageMediaId: string | null = null) {
  const [row] = await db
    .insert(product)
    .values({ restaurantId: tenant.restaurant.id, categoryId, name, priceMinor: 1000, imageMediaId })
    .returning();
  return row!;
}

const mediaExists = async (id: string) => (await db.select().from(media).where(eq(media.id, id))).length === 1;

describe("category actions", () => {
  let a: Tenant;
  let b: Tenant;

  beforeEach(async () => {
    currentTenant.user = null;
    currentTenant.restaurant = null;
    a = await createTenant();
    b = await createTenant();
    signInAs(a);
  });

  describe("createCategory", () => {
    it("appends new categories at the end", async () => {
      const first = await createCategory({ ...valid, name: "Bir" });
      const second = await createCategory({ ...valid, name: "İki", description: "  açıklama " });
      expect(first.ok && second.ok).toBe(true);

      const list = await listCategories(a.restaurant.id);
      expect(list.map((c) => c.name)).toEqual(["Bir", "İki"]);
      expect(list[1]?.description).toBe("açıklama");
    });

    it("validates the input", async () => {
      const empty = await createCategory({ ...valid, name: "   " });
      expect(empty.ok).toBe(false);
      if (!empty.ok) expect(empty.fieldErrors?.name).toBeDefined();

      expect((await createCategory({ ...valid, name: "x".repeat(61) })).ok).toBe(false);
      expect((await createCategory({ ...valid, description: "x".repeat(201) })).ok).toBe(false);
      expect((await createCategory({ name: "Eksik" })).ok).toBe(false);
    });

    it("rejects another restaurant's image", async () => {
      const foreign = await addMedia(b);
      const result = await createCategory({ ...valid, imageMediaId: foreign });
      expect(result.ok).toBe(false);
      expect(await listCategories(a.restaurant.id)).toHaveLength(0);
    });

    it("enforces the 100 category limit", async () => {
      await db
        .insert(category)
        .values(Array.from({ length: 100 }, (_, i) => ({ restaurantId: a.restaurant.id, name: `K${i}`, position: i })));
      const result = await createCategory(valid);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("100");
    });
  });

  describe("updateCategory", () => {
    it("updates fields and releases the replaced image", async () => {
      const oldImage = await addMedia(a);
      const newImage = await addMedia(a);
      const row = await addCategory(a, "Eski", 0, oldImage);

      const result = await updateCategory(row.id, { ...valid, name: "Yeni", imageMediaId: newImage });
      expect(result.ok).toBe(true);

      const [updated] = await db.select().from(category).where(eq(category.id, row.id));
      expect(updated).toMatchObject({ name: "Yeni", imageMediaId: newImage });
      expect(await mediaExists(oldImage)).toBe(false);
      expect(await mediaExists(newImage)).toBe(true);
    });

    it("cannot touch another tenant's category", async () => {
      const foreign = await addCategory(b, "B kategorisi", 0);
      const result = await updateCategory(foreign.id, { ...valid, name: "Ele geçirildi" });
      expect(result.ok).toBe(false);
      const [unchanged] = await db.select().from(category).where(eq(category.id, foreign.id));
      expect(unchanged?.name).toBe("B kategorisi");
    });
  });

  describe("setCategoryActive", () => {
    it("toggles for the owner and is isolated between tenants", async () => {
      const own = await addCategory(a, "A", 0);
      const foreign = await addCategory(b, "B", 0);

      expect((await setCategoryActive(own.id, false)).ok).toBe(true);
      expect((await setCategoryActive(foreign.id, false)).ok).toBe(false);

      const [ownRow] = await db.select().from(category).where(eq(category.id, own.id));
      const [foreignRow] = await db.select().from(category).where(eq(category.id, foreign.id));
      expect(ownRow?.isActive).toBe(false);
      expect(foreignRow?.isActive).toBe(true);
    });
  });

  describe("deleteCategory", () => {
    it("deletes the category with its products and releases their images", async () => {
      const categoryImage = await addMedia(a);
      const productImage = await addMedia(a);
      const keptImage = await addMedia(a);
      const doomed = await addCategory(a, "Silinecek", 0, categoryImage);
      const kept = await addCategory(a, "Kalacak", 1);
      await addProduct(a, doomed.id, "P1", productImage);
      await addProduct(a, doomed.id, "P2", productImage);
      await addProduct(a, doomed.id, "P3");
      await addProduct(a, kept.id, "Korunan", keptImage);

      const result = await deleteCategory(doomed.id);
      expect(result).toEqual({ ok: true, data: { deletedProducts: 3 } });

      expect(await db.select().from(category).where(eq(category.id, doomed.id))).toHaveLength(0);
      expect((await db.select().from(product).where(eq(product.restaurantId, a.restaurant.id))).map((p) => p.name)).toEqual([
        "Korunan",
      ]);
      expect(await mediaExists(categoryImage)).toBe(false);
      expect(await mediaExists(productImage)).toBe(false);
      expect(await mediaExists(keptImage)).toBe(true);
    });

    it("keeps an image that is still used by a product in another category", async () => {
      const shared = await addMedia(a);
      const doomed = await addCategory(a, "Silinecek", 0);
      const kept = await addCategory(a, "Kalacak", 1);
      await addProduct(a, doomed.id, "Kopya", shared);
      await addProduct(a, kept.id, "Asıl", shared);

      await deleteCategory(doomed.id);
      expect(await mediaExists(shared)).toBe(true);
    });

    it("cannot delete another tenant's category", async () => {
      const foreign = await addCategory(b, "B", 0);
      await addProduct(b, foreign.id, "B ürünü");
      const result = await deleteCategory(foreign.id);
      expect(result.ok).toBe(false);
      expect(await db.select().from(category).where(eq(category.id, foreign.id))).toHaveLength(1);
      expect(await db.select().from(product).where(eq(product.categoryId, foreign.id))).toHaveLength(1);
    });
  });

  describe("reorderCategories", () => {
    it("writes the new order", async () => {
      const one = await addCategory(a, "Bir", 0);
      const two = await addCategory(a, "İki", 1);
      const three = await addCategory(a, "Üç", 2);

      const result = await reorderCategories([three.id, one.id, two.id]);
      expect(result.ok).toBe(true);
      const rows = await db
        .select()
        .from(category)
        .where(eq(category.restaurantId, a.restaurant.id))
        .orderBy(asc(category.position));
      expect(rows.map((r) => r.name)).toEqual(["Üç", "Bir", "İki"]);
      expect(rows.map((r) => r.position)).toEqual([0, 1, 2]);
    });

    it("rejects partial, duplicated, unknown and foreign id lists", async () => {
      const one = await addCategory(a, "Bir", 0);
      const two = await addCategory(a, "İki", 1);
      const foreign = await addCategory(b, "B", 0);

      expect((await reorderCategories([one.id])).ok).toBe(false);
      expect((await reorderCategories([one.id, one.id])).ok).toBe(false);
      expect((await reorderCategories([one.id, two.id, "nope"])).ok).toBe(false);
      expect((await reorderCategories([one.id, foreign.id])).ok).toBe(false);
      expect((await reorderCategories("not a list")).ok).toBe(false);

      const [foreignRow] = await db.select().from(category).where(eq(category.id, foreign.id));
      expect(foreignRow?.position).toBe(0);
    });

    it("accepts an empty list when there are no categories", async () => {
      expect((await reorderCategories([])).ok).toBe(true);
    });
  });

  describe("listCategories", () => {
    it("returns only the tenant's categories in order with product counts", async () => {
      const second = await addCategory(a, "İkinci", 1);
      const first = await addCategory(a, "Birinci", 0);
      await addCategory(b, "Yabancı", 0);
      await addProduct(a, first.id, "P1");
      await addProduct(a, first.id, "P2");
      await addProduct(a, second.id, "P3");

      const list = await listCategories(a.restaurant.id);
      expect(list.map((c) => [c.name, c.productCount])).toEqual([
        ["Birinci", 2],
        ["İkinci", 1],
      ]);
    });
  });
});
