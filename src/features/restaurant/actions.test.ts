import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTenant, createUser, currentTenant, sessionMock, signInAs } from "../../../test/helpers";

vi.mock("@/server/session", () => sessionMock());

const { createRestaurant } = await import("./actions");

describe("createRestaurant", () => {
  beforeEach(() => {
    currentTenant.user = null;
    currentTenant.restaurant = null;
  });

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
