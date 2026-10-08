import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { media, restaurant } from "@/db/schema";
import { createTenant, createUser, currentTenant, sessionMock, signInAs } from "../../../test/helpers";

vi.mock("@/server/session", () => sessionMock());

const { createRestaurant, setPublished, updateAppearance, updateRestaurantProfile, updateSlug } = await import("./actions");

function resetTenant() {
  currentTenant.user = null;
  currentTenant.restaurant = null;
}

async function loadRestaurant(id: string) {
  const [row] = await db.select().from(restaurant).where(eq(restaurant.id, id));
  return row!;
}

async function createMedia(restaurantId: string) {
  const [row] = await db
    .insert(media)
    .values({ restaurantId, contentType: "image/webp", width: 10, height: 10, byteSize: 3, data: Buffer.from([1, 2, 3]) })
    .returning({ id: media.id });
  return row!.id;
}

async function mediaExists(id: string) {
  const rows = await db.select({ id: media.id }).from(media).where(eq(media.id, id));
  return rows.length > 0;
}

describe("createRestaurant", () => {
  beforeEach(resetTenant);

  it("creates a restaurant for a user without one", async () => {
    signInAs({ user: await createUser(), restaurant: null });
    const result = await createRestaurant({ name: "Deniz Balık", slug: "deniz-balik" });
    expect(result).toEqual({ ok: true, data: { slug: "deniz-balik" } });
  });

  it("rejects taken and reserved slugs", async () => {
    await createTenant({ slug: "taken-slug" });
    signInAs({ user: await createUser(), restaurant: null });

    expect((await createRestaurant({ name: "Kopya", slug: "taken-slug" })).ok).toBe(false);
    expect((await createRestaurant({ name: "Panel", slug: "dashboard" })).ok).toBe(false);
  });

  it("rejects a second restaurant for the same user", async () => {
    const tenant = await createTenant();
    signInAs(tenant);
    const result = await createRestaurant({ name: "İkinci", slug: "ikinci-restoran" });
    expect(result.ok).toBe(false);
  });
});

const validProfile = {
  name: "Yeni Ad",
  description: "Taze balık",
  phone: "0212 000 00 00",
  address: "",
  instagram: "@yeniad",
  website: "https://example.com",
  wifiName: "Misafir",
  wifiPassword: "12345678",
};

const validAppearance = {
  themeColor: "#1e7b34",
  currency: "EUR" as const,
  showVatNote: false,
  hideUnavailable: true,
};

describe("updateRestaurantProfile", () => {
  beforeEach(resetTenant);

  it("saves the profile, normalizing empty and prefixed values", async () => {
    const tenant = await createTenant({ address: "Eski adres" });
    signInAs(tenant);

    expect(await updateRestaurantProfile(validProfile)).toEqual({ ok: true, data: undefined });

    const saved = await loadRestaurant(tenant.restaurant.id);
    expect(saved).toMatchObject({
      name: "Yeni Ad",
      description: "Taze balık",
      address: null,
      instagram: "yeniad",
      website: "https://example.com",
      slug: tenant.restaurant.slug,
    });
  });

  it("returns field errors for invalid input and writes nothing", async () => {
    const tenant = await createTenant();
    signInAs(tenant);

    const result = await updateRestaurantProfile({
      ...validProfile,
      name: "A",
      website: "javascript:alert(1)",
      instagram: "bad/handle",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.fieldErrors ?? {})).toEqual(
        expect.arrayContaining(["name", "website", "instagram"]),
      );
    }
    expect((await loadRestaurant(tenant.restaurant.id)).name).toBe(tenant.restaurant.name);
  });

  it("ignores a slug sent in the profile payload", async () => {
    const tenant = await createTenant();
    signInAs(tenant);
    await updateRestaurantProfile({ ...validProfile, slug: "sneaky-new-slug" });
    expect((await loadRestaurant(tenant.restaurant.id)).slug).toBe(tenant.restaurant.slug);
  });

  it("attaches own media and releases the replaced image", async () => {
    const tenant = await createTenant();
    signInAs(tenant);
    const first = await createMedia(tenant.restaurant.id);
    const second = await createMedia(tenant.restaurant.id);

    expect((await updateRestaurantProfile({ ...validProfile, logoMediaId: first })).ok).toBe(true);
    expect((await loadRestaurant(tenant.restaurant.id)).logoMediaId).toBe(first);
    expect(await mediaExists(first)).toBe(true);

    signInAs({ user: tenant.user, restaurant: await loadRestaurant(tenant.restaurant.id) });
    expect((await updateRestaurantProfile({ ...validProfile, logoMediaId: second })).ok).toBe(true);
    expect((await loadRestaurant(tenant.restaurant.id)).logoMediaId).toBe(second);
    expect(await mediaExists(first)).toBe(false);
    expect(await mediaExists(second)).toBe(true);
  });

  it("keeps images when the ids are omitted and removes them on null", async () => {
    const tenant = await createTenant();
    signInAs(tenant);
    const cover = await createMedia(tenant.restaurant.id);
    await updateRestaurantProfile({ ...validProfile, coverMediaId: cover });

    signInAs({ user: tenant.user, restaurant: await loadRestaurant(tenant.restaurant.id) });
    await updateRestaurantProfile(validProfile);
    expect((await loadRestaurant(tenant.restaurant.id)).coverMediaId).toBe(cover);

    await updateRestaurantProfile({ ...validProfile, coverMediaId: null });
    expect((await loadRestaurant(tenant.restaurant.id)).coverMediaId).toBeNull();
    expect(await mediaExists(cover)).toBe(false);
  });

  it("rejects media that belongs to another restaurant", async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();
    const foreign = await createMedia(tenantA.restaurant.id);

    signInAs(tenantB);
    const result = await updateRestaurantProfile({ ...validProfile, logoMediaId: foreign });
    expect(result.ok).toBe(false);
    expect((await loadRestaurant(tenantB.restaurant.id)).logoMediaId).toBeNull();
    expect(await mediaExists(foreign)).toBe(true);
  });

  it("only ever touches the caller's restaurant", async () => {
    const tenantA = await createTenant({ name: "A Restoran" });
    const tenantB = await createTenant({ name: "B Restoran" });

    signInAs(tenantB);
    expect((await updateRestaurantProfile({ ...validProfile, name: "B Yeni" })).ok).toBe(true);

    expect((await loadRestaurant(tenantA.restaurant.id)).name).toBe("A Restoran");
    expect((await loadRestaurant(tenantB.restaurant.id)).name).toBe("B Yeni");
  });
});

describe("updateAppearance", () => {
  beforeEach(resetTenant);

  it("saves appearance settings without touching the profile", async () => {
    const tenant = await createTenant({ name: "Aynı Ad" });
    signInAs(tenant);

    expect(await updateAppearance(validAppearance)).toEqual({ ok: true, data: undefined });

    expect(await loadRestaurant(tenant.restaurant.id)).toMatchObject({
      ...validAppearance,
      name: "Aynı Ad",
      slug: tenant.restaurant.slug,
    });
  });

  it("profile saves leave appearance settings alone", async () => {
    const tenant = await createTenant();
    signInAs(tenant);
    await updateAppearance(validAppearance);
    await updateRestaurantProfile({ ...validProfile, ...{ currency: "USD", themeColor: "#000000" } });
    expect(await loadRestaurant(tenant.restaurant.id)).toMatchObject(validAppearance);
  });

  it("rejects an invalid color or currency and writes nothing", async () => {
    const tenant = await createTenant();
    signInAs(tenant);

    const result = await updateAppearance({ ...validAppearance, themeColor: "red", currency: "XXX" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.fieldErrors ?? {})).toEqual(expect.arrayContaining(["themeColor", "currency"]));
    expect((await updateAppearance({ ...validAppearance, themeColor: "#12345" })).ok).toBe(false);
    expect((await updateAppearance({ ...validAppearance, showVatNote: "yes" })).ok).toBe(false);

    expect(await loadRestaurant(tenant.restaurant.id)).toMatchObject({
      themeColor: tenant.restaurant.themeColor,
      currency: tenant.restaurant.currency,
    });
  });

  it("only ever touches the caller's restaurant", async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();
    signInAs(tenantB);
    expect((await updateAppearance(validAppearance)).ok).toBe(true);

    expect((await loadRestaurant(tenantA.restaurant.id)).themeColor).toBe(tenantA.restaurant.themeColor);
    expect((await loadRestaurant(tenantB.restaurant.id)).themeColor).toBe("#1e7b34");
  });
});

describe("updateSlug", () => {
  beforeEach(resetTenant);

  it("changes the slug and normalizes case", async () => {
    const tenant = await createTenant();
    signInAs(tenant);
    expect(await updateSlug({ slug: "  Yeni-Adres-1 " })).toEqual({ ok: true, data: { slug: "yeni-adres-1" } });
    expect((await loadRestaurant(tenant.restaurant.id)).slug).toBe("yeni-adres-1");
  });

  it("is a no-op for the current slug", async () => {
    const tenant = await createTenant();
    signInAs(tenant);
    expect(await updateSlug({ slug: tenant.restaurant.slug })).toEqual({
      ok: true,
      data: { slug: tenant.restaurant.slug },
    });
  });

  it("rejects taken, reserved and malformed slugs", async () => {
    await createTenant({ slug: "already-used" });
    const tenant = await createTenant();
    signInAs(tenant);

    const taken = await updateSlug({ slug: "already-used" });
    expect(taken.ok).toBe(false);
    if (!taken.ok) expect(taken.fieldErrors?.slug).toBeDefined();

    for (const slug of ["dashboard", "ab", "Boşluk var", "-bad-", "a--b"]) {
      expect((await updateSlug({ slug })).ok).toBe(false);
    }
    expect((await loadRestaurant(tenant.restaurant.id)).slug).toBe(tenant.restaurant.slug);
  });

  it("only changes the caller's restaurant", async () => {
    const tenantA = await createTenant({ slug: "tenant-a-slug" });
    const tenantB = await createTenant();
    signInAs(tenantB);
    expect((await updateSlug({ slug: "tenant-b-new" })).ok).toBe(true);
    expect((await loadRestaurant(tenantA.restaurant.id)).slug).toBe("tenant-a-slug");
  });
});

describe("setPublished", () => {
  beforeEach(resetTenant);

  it("publishes and unpublishes the caller's menu only", async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();
    signInAs(tenantA);

    expect(await setPublished({ isPublished: true })).toEqual({ ok: true, data: { isPublished: true } });
    expect((await loadRestaurant(tenantA.restaurant.id)).isPublished).toBe(true);
    expect((await loadRestaurant(tenantB.restaurant.id)).isPublished).toBe(false);

    expect((await setPublished({ isPublished: false })).ok).toBe(true);
    expect((await loadRestaurant(tenantA.restaurant.id)).isPublished).toBe(false);
  });

  it("rejects non-boolean input", async () => {
    signInAs(await createTenant());
    expect((await setPublished({ isPublished: "yes" })).ok).toBe(false);
    expect((await setPublished(null)).ok).toBe(false);
  });
});
