import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { category, product } from "@/db/schema";
import { createTenant, createUser, currentTenant, sessionMock, signInAs } from "../../../test/helpers";

vi.mock("@/server/session", () => sessionMock());

const { getPublicMenu } = await import("./queries");

type Tenant = Awaited<ReturnType<typeof createTenant>>;

async function addCategory(tenant: Tenant, values: Partial<typeof category.$inferInsert> & { name: string }) {
  const [row] = await db
    .insert(category)
    .values({ restaurantId: tenant.restaurant.id, ...values })
    .returning();
  return row!;
}

async function addProduct(
  tenant: Tenant,
  categoryId: string,
  values: Partial<typeof product.$inferInsert> & { name: string },
) {
  const [row] = await db
    .insert(product)
    .values({ restaurantId: tenant.restaurant.id, categoryId, priceMinor: 10000, ...values })
    .returning();
  return row!;
}

describe("getPublicMenu", () => {
  beforeEach(() => {
    currentTenant.user = null;
    currentTenant.restaurant = null;
  });

  it("returns null for an unknown slug", async () => {
    expect(await getPublicMenu("does-not-exist")).toBeNull();
  });

  it("hides unpublished menus from guests and other users", async () => {
    const tenant = await createTenant({ isPublished: false });
    expect(await getPublicMenu(tenant.restaurant.slug)).toBeNull();

    signInAs({ user: await createUser(), restaurant: null });
    expect(await getPublicMenu(tenant.restaurant.slug)).toBeNull();
  });

  it("lets the owner preview an unpublished menu", async () => {
    const tenant = await createTenant({ isPublished: false });
    signInAs(tenant);
    const menu = await getPublicMenu(tenant.restaurant.slug);
    expect(menu).not.toBeNull();
    expect(menu).toMatchObject({ isOwner: true, isPreview: true });
  });

  it("shows a published menu to guests without preview flags", async () => {
    const tenant = await createTenant({ isPublished: true });
    const menu = await getPublicMenu(tenant.restaurant.slug);
    expect(menu).toMatchObject({ isOwner: false, isPreview: false });
    expect(menu?.restaurant.slug).toBe(tenant.restaurant.slug);
  });

  it("does not expose the owner id", async () => {
    const tenant = await createTenant({ isPublished: true });
    const menu = await getPublicMenu(tenant.restaurant.slug);
    expect(menu?.restaurant).not.toHaveProperty("ownerId");
  });

  it("orders categories and products by position", async () => {
    const tenant = await createTenant({ isPublished: true });
    const second = await addCategory(tenant, { name: "İçecekler", position: 2 });
    const first = await addCategory(tenant, { name: "Başlangıçlar", position: 1 });
    await addProduct(tenant, first.id, { name: "Çorba", position: 2 });
    await addProduct(tenant, first.id, { name: "Salata", position: 1 });
    await addProduct(tenant, second.id, { name: "Ayran" });

    const menu = await getPublicMenu(tenant.restaurant.slug);
    expect(menu?.categories.map((c) => c.name)).toEqual(["Başlangıçlar", "İçecekler"]);
    expect(menu?.categories[0]?.products.map((p) => p.name)).toEqual(["Salata", "Çorba"]);
  });

  it("skips inactive and empty categories", async () => {
    const tenant = await createTenant({ isPublished: true });
    const visible = await addCategory(tenant, { name: "Ana yemekler", position: 1 });
    const inactive = await addCategory(tenant, { name: "Gizli", position: 2, isActive: false });
    await addCategory(tenant, { name: "Boş", position: 3 });
    await addProduct(tenant, visible.id, { name: "Kebap" });
    await addProduct(tenant, inactive.id, { name: "Gizli ürün" });

    const menu = await getPublicMenu(tenant.restaurant.slug);
    expect(menu?.categories.map((c) => c.name)).toEqual(["Ana yemekler"]);
  });

  it("excludes unavailable products when the restaurant hides them", async () => {
    const tenant = await createTenant({ isPublished: true, hideUnavailable: true });
    const mains = await addCategory(tenant, { name: "Ana yemekler" });
    const soldOutOnly = await addCategory(tenant, { name: "Tatlılar", position: 1 });
    await addProduct(tenant, mains.id, { name: "Kebap" });
    await addProduct(tenant, mains.id, { name: "Tükenen", isAvailable: false });
    await addProduct(tenant, soldOutOnly.id, { name: "Baklava", isAvailable: false });

    const menu = await getPublicMenu(tenant.restaurant.slug);
    expect(menu?.categories.map((c) => c.name)).toEqual(["Ana yemekler"]);
    expect(menu?.categories[0]?.products.map((p) => p.name)).toEqual(["Kebap"]);
  });

  it("keeps hidden sold-out products for the owner's appearance preview", async () => {
    const tenant = await createTenant({ isPublished: true, hideUnavailable: true });
    const mains = await addCategory(tenant, { name: "Ana yemekler" });
    await addProduct(tenant, mains.id, { name: "Kebap", position: 1 });
    await addProduct(tenant, mains.id, { name: "Tükenen", isAvailable: false, position: 2 });

    const menu = await getPublicMenu(tenant.restaurant.slug, true);
    expect(menu?.categories[0]?.products.map((p) => p.name)).toEqual(["Kebap", "Tükenen"]);
  });

  it("keeps unavailable products, flagged, when the restaurant shows them", async () => {
    const tenant = await createTenant({ isPublished: true, hideUnavailable: false });
    const mains = await addCategory(tenant, { name: "Ana yemekler" });
    await addProduct(tenant, mains.id, { name: "Kebap", position: 1 });
    await addProduct(tenant, mains.id, { name: "Tükenen", isAvailable: false, position: 2 });

    const menu = await getPublicMenu(tenant.restaurant.slug);
    const products = menu?.categories[0]?.products ?? [];
    expect(products.map((p) => [p.name, p.isAvailable])).toEqual([
      ["Kebap", true],
      ["Tükenen", false],
    ]);
  });

  it("collects available featured products and never mixes in other tenants", async () => {
    const tenant = await createTenant({ isPublished: true });
    const other = await createTenant({ isPublished: true });
    const mains = await addCategory(tenant, { name: "Ana yemekler" });
    const otherMains = await addCategory(other, { name: "Başka" });
    await addProduct(tenant, mains.id, { name: "Şefin tabağı", isFeatured: true });
    await addProduct(tenant, mains.id, { name: "Tükenen vitrin", isFeatured: true, isAvailable: false });
    await addProduct(tenant, mains.id, { name: "Sıradan" });
    await addProduct(other, otherMains.id, { name: "Yabancı ürün", isFeatured: true });

    const menu = await getPublicMenu(tenant.restaurant.slug);
    expect(menu?.featured.map((p) => p.name)).toEqual(["Şefin tabağı"]);
    expect(menu?.categories.flatMap((c) => c.products).map((p) => p.name)).not.toContain("Yabancı ürün");
  });

  it("has no image URLs when no media is attached", async () => {
    const tenant = await createTenant({ isPublished: true });
    const mains = await addCategory(tenant, { name: "Ana yemekler" });
    await addProduct(tenant, mains.id, { name: "Düz" });

    const menu = await getPublicMenu(tenant.restaurant.slug);
    expect(menu?.categories[0]?.products[0]?.imageUrl).toBeNull();
    expect(menu?.restaurant.coverUrl).toBeNull();
  });
});
