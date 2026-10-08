import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/cn";
import { toSheetProduct } from "../sheet-data";
import { menuThemeVars } from "../theme";
import type { PublicMenu } from "../types";
import { CategorySection } from "./category-section";
import { FeaturedStrip } from "./featured-strip";
import { MenuBrowser } from "./menu-browser";
import { MenuFooter } from "./menu-footer";
import { MenuHeader } from "./menu-header";
import type { MenuMode } from "./menu-mode";
import { ProductSheet } from "./product-sheet";

/**
 * The guest menu: header, sticky browser (search, chips, scroll-spy), featured strip, sections,
 * footer and product sheet. It carries no `"use client"` itself, so on `/m/[slug]` it is rendered on
 * the server and only the islands (browser, sheet, Wi-Fi dialog) hydrate.
 *
 * - `page`: a full-page document scrolled by the window.
 * - `embedded`: the phone preview. The root element is a labelled region and the scroll container
 *   (it must get a definite height from its parent); see `docs/design/screens.md` §6.
 *
 * `banner` renders above the header inside the themed root (the owner's "not published" notice).
 */
export function MenuView({
  menu,
  mode,
  banner,
}: {
  menu: PublicMenu;
  mode: MenuMode;
  banner?: React.ReactNode;
}) {
  const { restaurant, categories, featured } = menu;
  const embedded = mode === "embedded";
  const sheetProducts = categories.flatMap((category) =>
    category.products.map((product) => toSheetProduct(product, restaurant.currency)),
  );
  const navSections = [
    ...(featured.length > 0 ? [{ id: "featured", label: "Öne çıkanlar" }] : []),
    ...categories.map((category) => ({ id: category.id, label: category.name })),
  ];
  const themeStyle = menuThemeVars(restaurant.themeColor) as React.CSSProperties;

  // One page has one `main` landmark: the embedded preview sits inside the host page's own.
  const Main = embedded ? "div" : "main";
  const content = (
    <>
      {banner}
      <MenuHeader restaurant={restaurant} mode={mode} />

      <Main>
        {categories.length > 0 ? (
          <MenuBrowser sections={navSections} mode={mode}>
            {featured.length > 0 && <FeaturedStrip products={featured} currency={restaurant.currency} />}
            {categories.map((category) => (
              <CategorySection key={category.id} category={category} currency={restaurant.currency} />
            ))}
          </MenuBrowser>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-20 text-center">
            <div
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-fg-muted"
            >
              <UtensilsCrossed className="size-6" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Menü hazırlanıyor</h2>
            <p className="max-w-xs text-sm text-fg-muted">Bu menüye henüz ürün eklenmedi. Lütfen daha sonra tekrar bakın.</p>
          </div>
        )}
      </Main>

      <MenuFooter showVatNote={restaurant.showVatNote} mode={mode} />
    </>
  );

  const focusRing = "[&_:focus-visible]:outline-(color:--menu-accent-text)";

  if (embedded) {
    return (
      <div
        data-menu-root=""
        role="region"
        aria-label="Örnek menü önizlemesi"
        style={themeStyle}
        // `container-type: size` lets the sheet use `100cqh` (the root's height) while it is pinned inside the scroll area.
        className={cn(
          "no-scrollbar relative h-full overflow-x-hidden overflow-y-auto overscroll-contain scroll-smooth bg-bg text-fg [container-type:size] motion-reduce:scroll-auto",
          focusRing,
        )}
      >
        <div data-menu-content="">{content}</div>
        <ProductSheet products={sheetProducts} themeStyle={themeStyle} mode={mode} />
      </div>
    );
  }

  return (
    <div className={cn("min-h-dvh bg-bg text-fg", focusRing)} style={themeStyle}>
      {content}
      <ProductSheet products={sheetProducts} themeStyle={themeStyle} mode={mode} />
    </div>
  );
}
