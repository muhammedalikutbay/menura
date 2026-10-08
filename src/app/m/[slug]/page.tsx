import { UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategorySection } from "@/features/menu/components/category-section";
import { FeaturedStrip } from "@/features/menu/components/featured-strip";
import { MenuBrowser } from "@/features/menu/components/menu-browser";
import { MenuFooter } from "@/features/menu/components/menu-footer";
import { MenuHeader } from "@/features/menu/components/menu-header";
import { PreviewBanner } from "@/features/menu/components/preview-banner";
import { ProductSheet } from "@/features/menu/components/product-sheet";
import { ViewBeacon } from "@/features/menu/components/view-beacon";
import { buildMenuJsonLd, serializeJsonLd } from "@/features/menu/json-ld";
import { getPublicMenu } from "@/features/menu/queries";
import { toSheetProduct } from "@/features/menu/sheet-data";
import { menuThemeVars } from "@/features/menu/theme";
import { env } from "@/server/env";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);
  if (!menu) return { title: "Menü bulunamadı", robots: { index: false, follow: false } };

  const { restaurant } = menu;
  const description = restaurant.description?.trim() || `${restaurant.name} dijital menüsü`;
  const path = `/m/${restaurant.slug}`;
  return {
    // `absolute` skips the "· Menura" suffix: guests should see the restaurant, not the platform.
    title: { absolute: restaurant.name },
    description,
    alternates: { canonical: path },
    // The share image (cover photo or accent card) comes from opengraph-image.tsx next to this page.
    openGraph: { type: "website", url: path, title: restaurant.name, description, siteName: restaurant.name, locale: "tr_TR" },
    twitter: { card: "summary_large_image", title: restaurant.name, description },
    robots: restaurant.isPublished ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);
  if (!menu) notFound();

  const { restaurant, categories, featured, isOwner, isPreview } = menu;
  const sheetProducts = categories.flatMap((category) =>
    category.products.map((product) => toSheetProduct(product, restaurant.currency)),
  );
  const navSections = [
    ...(featured.length > 0 ? [{ id: "featured", label: "Öne çıkanlar" }] : []),
    ...categories.map((category) => ({ id: category.id, label: category.name })),
  ];

  const themeStyle = menuThemeVars(restaurant.themeColor) as React.CSSProperties;

  return (
    <div
      className="min-h-dvh bg-bg text-fg [&_:focus-visible]:outline-(color:--menu-accent-text)"
      style={themeStyle}
    >
      {isPreview && <PreviewBanner />}
      {!isOwner && <ViewBeacon slug={restaurant.slug} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildMenuJsonLd(menu, env.APP_URL)) }}
      />

      <MenuHeader restaurant={restaurant} />

      <main>
        {categories.length > 0 ? (
          <MenuBrowser sections={navSections}>
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
      </main>

      <MenuFooter showVatNote={restaurant.showVatNote} />
      <ProductSheet products={sheetProducts} themeStyle={themeStyle} />
    </div>
  );
}
