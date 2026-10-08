import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { mediaUrl } from "@/features/media/url";
import { QrPrintSheet } from "@/features/qr/components/qr-print-sheet";
import { UnpublishedQrNotice } from "@/features/qr/components/unpublished-notice";
import { env } from "@/server/env";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Masa kartları" };

export default async function QrPrintPage() {
  const { restaurant } = await requireRestaurant();
  const menuUrl = `${env.APP_URL}/m/${restaurant.slug}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        className="print:hidden"
        title="Masa kartları"
        description="Restoran adı ve QR kod içeren, yazdırmaya hazır A4 masa kartları."
      />
      {!restaurant.isPublished && <UnpublishedQrNotice />}
      <QrPrintSheet menuUrl={menuUrl} restaurantName={restaurant.name} logoUrl={mediaUrl(restaurant.logoMediaId)} />
    </div>
  );
}
