import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuView } from "@/features/menu/components/menu-view";
import { PreviewBanner } from "@/features/menu/components/preview-banner";
import { ViewBeacon } from "@/features/menu/components/view-beacon";
import { buildMenuJsonLd, serializeJsonLd } from "@/features/menu/json-ld";
import { getPublicMenu } from "@/features/menu/queries";
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

  return (
    <>
      {!menu.isOwner && <ViewBeacon slug={menu.restaurant.slug} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildMenuJsonLd(menu, env.APP_URL)) }}
      />
      <MenuView menu={menu} mode="page" banner={menu.isPreview ? <PreviewBanner /> : undefined} />
    </>
  );
}
