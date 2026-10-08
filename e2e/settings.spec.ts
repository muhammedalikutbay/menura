import { expect, test, type Page } from "@playwright/test";
import { createCategory, createProduct, registerOwner } from "./helpers";

/** Value of the `--color-accent` custom property on the first themed menu root of the page. */
async function accentOf(page: Page, selector: string): Promise<string> {
  return page.locator(selector).first().evaluate((el) => getComputedStyle(el).getPropertyValue("--color-accent").trim());
}

test.describe("settings", () => {
  test("restaurant profile: edit description, save bar, persists", async ({ page }, testInfo) => {
    await registerOwner(page, testInfo);
    await page.goto("/dashboard/restaurant");

    const description = page.getByLabel("Açıklama");
    const bar = page.getByRole("region", { name: "Kaydedilmemiş değişiklikler" });
    await expect(bar).toHaveCount(0);

    await description.fill("Mahallenin sıcak mutfağı.");
    await expect(bar).toBeVisible();
    await bar.getByRole("button", { name: "Değişiklikleri kaydet" }).click();
    await expect(bar).toBeHidden();

    await page.reload();
    await expect(page.getByLabel("Açıklama")).toHaveValue("Mahallenin sıcak mutfağı.");
    await expect(bar).toHaveCount(0);
  });

  test("appearance: theme color updates the preview and the guest menu", async ({ page }, testInfo) => {
    const owner = await registerOwner(page, testInfo);
    await page.goto("/dashboard/menu");
    await createCategory(page, "Çorbalar");
    await createProduct(page, "Çorbalar", "Mercimek", "100");

    await page.goto("/dashboard/appearance");
    await page.getByRole("switch", { name: "Menüyü yayınla" }).click();
    await expect(page.getByRole("switch", { name: "Menüyü yayınla" })).toBeChecked();

    // Below 1024px the preview is collapsed behind a toggle.
    const toggle = page.getByRole("button", { name: "Önizlemeyi göster" });
    if (await toggle.isVisible()) await toggle.click();
    const previewRoot = 'aside[aria-label="Menü önizlemesi"] [data-menu-root]';
    await expect(page.getByRole("region", { name: "Örnek menü önizlemesi" })).toBeVisible();
    const before = await accentOf(page, previewRoot);

    await page.getByRole("radio", { name: "Kırmızı" }).click();
    await expect(page.getByRole("radio", { name: "Kırmızı" })).toBeChecked();
    await expect.poll(() => accentOf(page, previewRoot)).not.toBe(before);
    const chosen = await accentOf(page, previewRoot);
    expect(chosen.toLowerCase()).toContain("d70015");

    await page.getByRole("button", { name: "Değişiklikleri kaydet" }).click();
    await expect(page.getByRole("button", { name: "Değişiklikleri kaydet" })).toBeDisabled();

    const guest = await page.context().newPage();
    await guest.goto(`/m/${owner.slug}`);
    await expect(guest.getByRole("heading", { level: 1, name: owner.restaurant })).toBeVisible();
    expect((await accentOf(guest, '[style*="--color-accent"]')).toLowerCase()).toBe(chosen.toLowerCase());
    await guest.close();
  });

  test("account: changing the name updates the avatar menu", async ({ page }, testInfo) => {
    await registerOwner(page, testInfo, "Eski Ad");
    await page.goto("/dashboard/account");

    await page.getByRole("textbox", { name: /^Ad\b/ }).fill("Yeni Ad Soyad");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByRole("button", { name: "Kaydet" })).toBeDisabled();

    // Desktop: avatar dropdown; below 1024px: the navigation sheet carries the name.
    const avatar = page.getByRole("button", { name: "Hesap menüsü" });
    if (await avatar.isVisible()) await avatar.click();
    else await page.getByRole("button", { name: "Gezinme menüsünü aç" }).click();
    await expect(page.getByText("Yeni Ad Soyad", { exact: true })).toBeVisible();
    await expect(page.getByText("Eski Ad", { exact: true })).toHaveCount(0);
  });

  test("old dashboard URLs redirect to the new pages", async ({ page }, testInfo) => {
    await registerOwner(page, testInfo);

    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/\/dashboard\/restaurant$/);

    await page.goto("/dashboard/categories");
    await expect(page).toHaveURL(/\/dashboard\/menu$/);

    await page.goto("/dashboard/products/new");
    await expect(page).toHaveURL(/\/dashboard\/menu\?new=product/);
  });
});
