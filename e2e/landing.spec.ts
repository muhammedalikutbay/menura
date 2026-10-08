import { expect, test } from "@playwright/test";

test.describe("landing", () => {
  test("renders one h1, the phone preview with sample products and CTAs to /register", async ({ page }) => {
    const cspViolations: string[] = [];
    page.on("console", (message) => {
      if (message.text().includes("Content Security Policy")) cspViolations.push(message.text());
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("tek bir QR kod");

    const preview = page.getByRole("region", { name: "Örnek menü önizlemesi" });
    await expect(preview).toBeVisible();
    await expect(preview.getByRole("heading", { name: "Lezzet Durağı" })).toBeVisible();
    await expect(preview.getByRole("button", { name: /Domates Çorbası/ }).first()).toBeVisible();

    const ctas = page.getByRole("link", { name: /Ücretsiz başla/ });
    expect(await ctas.count()).toBeGreaterThan(0);
    for (const cta of await ctas.all()) {
      await expect(cta).toHaveAttribute("href", "/register");
    }

    // Let hydration and deferred scripts run before judging the console.
    await page.waitForLoadState("networkidle");
    expect(cspViolations).toEqual([]);
  });

  test("has no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForLoadState("networkidle");
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
});
