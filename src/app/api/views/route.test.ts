import { describe, expect, it } from "vitest";
import { createTenant } from "../../../../test/helpers";
import { getTotalViews } from "@/features/analytics/server";
import { POST } from "./route";

const URL_BASE = "http://localhost:3000/api/views";

function beacon(slug: string, headers: Record<string, string> = {}) {
  return POST(
    new Request(URL_BASE, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0", ...headers },
      body: JSON.stringify({ slug }),
    }),
  );
}

describe("POST /api/views", () => {
  it("counts same-origin beacons and rejects cross-site ones", async () => {
    const tenant = await createTenant({ isPublished: true });
    expect((await beacon(tenant.restaurant.slug, { "sec-fetch-site": "same-origin" })).status).toBe(204);
    expect((await beacon(tenant.restaurant.slug, { "sec-fetch-site": "cross-site" })).status).toBe(403);
    expect((await beacon(tenant.restaurant.slug, { origin: "https://evil.example" })).status).toBe(403);
    expect(await getTotalViews(tenant.restaurant.id)).toBe(1);
  });

  it("rejects malformed and oversized bodies", async () => {
    const bad = await POST(new Request(URL_BASE, { method: "POST", body: "not json" }));
    expect(bad.status).toBe(400);
    const big = await POST(new Request(URL_BASE, { method: "POST", body: "x".repeat(2048) }));
    expect(big.status).toBe(413);
  });
});
