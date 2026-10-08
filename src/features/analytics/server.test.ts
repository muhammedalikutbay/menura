import { describe, expect, it } from "vitest";
import { createTenant } from "../../../test/helpers";
import { getDailyViews, getTotalViews, recordMenuView, reportingDay } from "./server";

describe("menu views", () => {
  it("counts views of published menus only and ignores bots", async () => {
    const published = await createTenant({ isPublished: true });
    const draft = await createTenant({ isPublished: false });

    expect(await recordMenuView(published.restaurant.slug, "Mozilla/5.0 (iPhone)")).toBe(true);
    expect(await recordMenuView(published.restaurant.slug, null)).toBe(true);
    expect(await recordMenuView(published.restaurant.slug, "Googlebot/2.1")).toBe(false);
    expect(await recordMenuView(draft.restaurant.slug, "Mozilla/5.0")).toBe(false);
    expect(await recordMenuView("does-not-exist", "Mozilla/5.0")).toBe(false);

    expect(await getTotalViews(published.restaurant.id)).toBe(2);
    expect(await getTotalViews(draft.restaurant.id)).toBe(0);

    const week = await getDailyViews(published.restaurant.id, 7);
    expect(week).toHaveLength(7);
    expect(week.at(-1)).toEqual({ day: reportingDay(), count: 2 });
  });
});
