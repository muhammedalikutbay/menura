import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { PublishCard } from "@/features/restaurant/components/publish-card";
import { SlugCard } from "@/features/restaurant/components/slug-card";
import { displayHost } from "@/features/restaurant/slug-input";
import { env } from "@/server/env";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Görünüm" };

// Theme, currency, VAT note and "hide unavailable" are still part of the profile form on
// /dashboard/restaurant; mnr-s8p.8 moves them here.
export default async function AppearancePage() {
  const { restaurant } = await requireRestaurant();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Görünüm" description="Menünüzün yayın durumu, adresi ve görünümü." />
      <div className="flex max-w-3xl flex-col gap-6">
        <PublishCard isPublished={restaurant.isPublished} slug={restaurant.slug} />
        <SlugCard slug={restaurant.slug} host={displayHost(env.APP_URL)} />
      </div>
    </div>
  );
}
