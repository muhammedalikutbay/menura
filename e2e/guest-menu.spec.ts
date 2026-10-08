import { expect, test } from "@playwright/test";

test.describe("guest menu", () => {
  test("shows the demo menu with categories, search and product details", async ({ page }) => {
    await page.goto("/m/demo");
    await expect(page.getByRole("heading", { level: 1, name: "Lezzet Durağı" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Başlangıçlar" })).toBeVisible();
    // Guests never see dashboard navigation.
    await expect(page.getByRole("link", { name: /Genel bakış|Ayarlar/ })).toHaveCount(0);

    await page.getByRole("button", { name: "Menüde ara" }).click();
    await page.getByRole("searchbox").fill("izgara");
    await expect(page.getByText(/\d+ sonuç/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Izgara Kuşkonmaz" })).toBeVisible();

    await page.getByRole("button", { name: "Izgara Kuşkonmaz" }).first().click();
    const sheet = page.getByRole("dialog", { name: "Izgara Kuşkonmaz" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText("Alerjen bilgisi")).toBeVisible();
  });

  test("returns 404 for unknown menus", async ({ page }) => {
    const response = await page.goto("/m/bu-menu-yok");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Menü bulunamadı")).toBeVisible();
  });
});
