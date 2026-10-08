import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { QrCustomizer } from "@/features/qr/components/qr-customizer";
import { UnpublishedQrNotice } from "@/features/qr/components/unpublished-notice";
import { mediaUrl } from "@/features/media/url";
import { env } from "@/server/env";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "QR kod" };

export default async function QrPage() {
  const { restaurant } = await requireRestaurant();
  const menuUrl = `${env.APP_URL}/m/${restaurant.slug}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="QR kod"
        description="Menü bağlantınız için QR kodu tasarlayın, indirin ve masalara yerleştirin."
      />
      {!restaurant.isPublished && <UnpublishedQrNotice />}
      <QrCustomizer
        menuUrl={menuUrl}
        restaurantName={restaurant.name}
        slug={restaurant.slug}
        logoUrl={mediaUrl(restaurant.logoMediaId)}
      />
    </div>
  );
}
