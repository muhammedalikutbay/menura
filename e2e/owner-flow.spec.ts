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

  // Category: the empty builder asks for the first one inline.
  await page.goto("/dashboard/menu");
  await expect(page.getByRole("heading", { name: "İlk kategorinizi oluşturun" })).toBeVisible();
  await page.getByLabel("Kategori adı").fill("Çorbalar");
  await page.getByRole("button", { name: "Kategori ekle" }).click();
  const section = page.getByRole("region", { name: "Çorbalar" });
  await expect(section).toBeVisible();
  await expect(section.getByText("0 ürün")).toBeVisible();

  // Product: "+ Ürün ekle" opens the editor sheet with the category preset.
  await section.getByRole("button", { name: "Ürün ekle" }).click();
  await expect(page).toHaveURL(/new=product&category=/);
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("heading", { name: "Yeni ürün" })).toBeVisible();
  await expect(sheet.getByRole("combobox", { name: "Kategori" })).toContainText("Çorbalar");
  await sheet.getByLabel("Ürün adı").fill("Mercimek Çorbası");
  await sheet.getByLabel(/^Fiyat/).fill("120,50");
  await sheet.getByRole("button", { name: "Kaydet" }).click();
  await expect(sheet).toBeHidden();
  await expect(page).not.toHaveURL(/new=product/);
  await expect(section.getByRole("button", { name: "Mercimek Çorbası", exact: true })).toBeVisible();
  await expect(section.getByText("1 ürün")).toBeVisible();

  // The row opens the editor via ?product=<id>; the back button closes it again.
  await section.getByRole("button", { name: "Mercimek Çorbası", exact: true }).click();
  await expect(page).toHaveURL(/[?&]product=/);
  await expect(sheet.getByLabel("Ürün adı")).toHaveValue("Mercimek Çorbası");
  await page.goBack();
  await expect(sheet).toBeHidden();

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
