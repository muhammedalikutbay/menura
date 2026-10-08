import { expect, test } from "@playwright/test";

// Local test account created on a throwaway e2e database.
const PASSWORD = "E2e-Test-Password-2026";

test("owner builds and publishes a menu that guests can open", async ({ page, browser }, testInfo) => {
  const unique = `${testInfo.project.name}-${Date.now()}`;
  const slug = `e2e-${unique}`.toLowerCase();

  // Register
  await page.goto("/register");
  await page.getByLabel("Ad soyad").fill("E2E Sahibi");
  await page.getByLabel("E-posta").fill(`${unique}@menura.test`);
  await page.getByRole("textbox", { name: "Şifre", exact: true }).fill(PASSWORD);
  await page.getByRole("textbox", { name: "Şifre (tekrar)", exact: true }).fill(PASSWORD);
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Hesap oluştur" }).click();

  // Onboarding
  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByLabel("Restoran adı").fill("E2E Kafe");
  await page.getByLabel("Menü adresi").fill(slug);
  await page.getByRole("button", { name: "Restoranı oluştur" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // Unpublished menus are hidden from guests.
  const guest = await browser.newPage();
  expect((await guest.goto(`/m/${slug}`))?.status()).toBe(404);

  // Category
  await page.goto("/dashboard/menu");
  await page.getByRole("button", { name: "Yeni kategori" }).first().click();
  await page.getByLabel("Kategori adı").fill("Çorbalar");
  await page.getByRole("button", { name: "Kategori ekle" }).click();
  await expect(page.getByText("Çorbalar").first()).toBeVisible();

  // Product
  await page.goto("/dashboard/products/new");
  await page.getByLabel("Ürün adı").fill("Mercimek Çorbası");
  const category = page.getByRole("combobox", { name: "Kategori" });
  if ((await category.textContent())?.includes("Kategori seçin")) {
    await category.click();
    await page.getByRole("option", { name: "Çorbalar" }).click();
  }
  await page.getByLabel(/^Fiyat/).fill("120,50");
  await page.getByRole("button", { name: "Ürünü ekle" }).click();
  await expect(page).toHaveURL(/\/dashboard\/menu/);
  await expect(page.getByText("Mercimek Çorbası").first()).toBeVisible();

  // Publish
  await page.goto("/dashboard/appearance");
  await page.getByRole("switch", { name: "Menüyü yayınla" }).click();
  await expect(page.getByRole("switch", { name: "Menüyü yayınla" })).toBeChecked();

  // Guest sees the published menu with the formatted price.
  await guest.goto(`/m/${slug}`);
  await expect(guest.getByRole("heading", { level: 1, name: "E2E Kafe" })).toBeVisible();
  await expect(guest.getByRole("heading", { name: "Mercimek Çorbası" })).toBeVisible();
  await expect(guest.getByText(/120,5/).first()).toBeVisible();
  await guest.close();
});
