import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AccountSection } from "@/features/auth/components/account-section";
import { ProfileForm, type ProfileValues } from "@/features/restaurant/components/profile-form";
import { PublishCard } from "@/features/restaurant/components/publish-card";
import { SlugCard } from "@/features/restaurant/components/slug-card";
import { displayHost } from "@/features/restaurant/slug-input";
import type { Currency } from "@/lib/money";
import { env } from "@/server/env";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const { restaurant } = await requireRestaurant();

  const profile: ProfileValues = {
    name: restaurant.name,
    description: restaurant.description ?? "",
    phone: restaurant.phone ?? "",
    address: restaurant.address ?? "",
    instagram: restaurant.instagram ?? "",
    website: restaurant.website ?? "",
    wifiName: restaurant.wifiName ?? "",
    wifiPassword: restaurant.wifiPassword ?? "",
    logoMediaId: restaurant.logoMediaId,
    coverMediaId: restaurant.coverMediaId,
    themeColor: restaurant.themeColor,
    currency: restaurant.currency as Currency,
    showVatNote: restaurant.showVatNote,
    hideUnavailable: restaurant.hideUnavailable,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ayarlar" description="Restoran bilgilerinizi, menü adresinizi ve hesabınızı yönetin." />
      <div className="flex max-w-3xl flex-col gap-6">
        <PublishCard isPublished={restaurant.isPublished} slug={restaurant.slug} />
        <ProfileForm initial={profile} />
        <SlugCard slug={restaurant.slug} host={displayHost(env.APP_URL)} />
        <AccountSection restaurantName={restaurant.name} />
      </div>
    </div>
  );
}
