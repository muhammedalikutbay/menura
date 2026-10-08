import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";

// Local test account created on a throwaway e2e database.
export const PASSWORD = "E2e-Test-Password-2026";

let counter = 0;

/** A string that is unique per project, test run and call; safe for e-mails and slugs. */
export function uniqueId(testInfo: TestInfo, prefix = "t"): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${testInfo.project.name}-${Date.now().toString(36)}${counter}${rand}`.toLowerCase();
}

export type Owner = { email: string; name: string; slug: string; restaurant: string };

/** Registers a fresh owner and completes onboarding; ends on /dashboard. */
export async function registerOwner(page: Page, testInfo: TestInfo, name = "E2E Sahibi"): Promise<Owner> {
  const id = uniqueId(testInfo, "e2e");
  const owner: Owner = { email: `${id}@menura.test`, name, slug: id, restaurant: "E2E Kafe" };

  await page.goto("/register");
  await page.getByLabel("Ad soyad").fill(owner.name);
  await page.getByLabel("E-posta").fill(owner.email);
  await page.getByRole("textbox", { name: "Şifre", exact: true }).fill(PASSWORD);
  await page.getByRole("textbox", { name: "Şifre (tekrar)", exact: true }).fill(PASSWORD);
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Hesap oluştur" }).click();

  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByLabel("Restoran adı").fill(owner.restaurant);
  await page.getByLabel("Menü adresi").fill(owner.slug);
  await page.getByRole("button", { name: "Restoranı oluştur" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return owner;
}

/** Section card of a category in the menu builder. */
export function categorySection(page: Page, name: string): Locator {
  return page.getByRole("region", { name, exact: true });
}

/** Creates a category (the first one through the empty state, later ones through the sheet). */
export async function createCategory(page: Page, name: string): Promise<void> {
  const first = page.getByRole("heading", { name: "İlk kategorinizi oluşturun" });
  if (await first.isVisible()) {
    await page.getByLabel("Kategori adı").fill(name);
    await page.getByRole("button", { name: "Kategori ekle" }).click();
  } else {
    await page.getByRole("button", { name: "Kategori", exact: true }).first().click();
    const sheet = page.getByRole("dialog");
    await sheet.getByLabel("Kategori adı").fill(name);
    await sheet.getByRole("button", { name: "Kaydet" }).click();
    await expect(sheet).toBeHidden();
  }
  await expect(categorySection(page, name)).toBeVisible();
}

/** Adds a product to a category through the editor sheet. `price` is typed as-is (e.g. "120,50"). */
export async function createProduct(page: Page, category: string, name: string, price: string): Promise<void> {
  const section = categorySection(page, category);
  await section.getByRole("button", { name: "Ürün ekle" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Ürün adı").fill(name);
  await sheet.getByLabel(/^Fiyat/).fill(price);
  await sheet.getByRole("button", { name: "Kaydet" }).click();
  await expect(sheet).toBeHidden();
  await expect(section.getByRole("button", { name, exact: true })).toBeVisible();
}

/** Product names of one category, in DOM order. */
export async function productOrder(page: Page, category: string): Promise<string[]> {
  const rows = categorySection(page, category).getByRole("list", { name: `${category} ürünleri` }).locator("> li");
  return rows.evaluateAll((items) =>
    items.map((li) => li.querySelector("button.type-body")?.textContent?.trim() ?? ""),
  );
}

/** Category names in page order. */
export async function categoryOrder(page: Page): Promise<string[]> {
  return page
    .locator("main section[aria-label]")
    .evaluateAll((sections) => sections.map((s) => s.getAttribute("aria-label") ?? ""));
}

/**
 * Keyboard drag with dnd-kit: focus the handle, Space, arrows, Space. Each step waits for dnd-kit's
 * live announcement so the sensor has measured the new position before the next key.
 */
export async function keyboardDrag(page: Page, handle: Locator, keys: string[]): Promise<void> {
  // The builder's DndContext renders after the category index's, so its live region is the last one.
  const live = page.locator("[id^='DndLiveRegion']").last();
  await handle.focus();
  await page.keyboard.press("Space");
  await expect(live).not.toBeEmpty();
  for (const key of keys) {
    const before = await live.textContent();
    await page.keyboard.press(key);
    await expect.poll(async () => live.textContent()).not.toBe(before);
  }
  await page.keyboard.press("Space");
  await expect(live).toContainText(/bırakıldı/);
}
