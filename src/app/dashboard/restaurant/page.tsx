import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileForm, type ProfileValues } from "@/features/restaurant/components/profile-form";
import type { Currency } from "@/lib/money";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Restoran" };

export default async function RestaurantPage() {
  const { restaurant } = await requireRestaurant();

  // The profile form still carries the appearance fields (theme, currency, VAT note,
  // hide unavailable); mnr-s8p.8 splits them onto /dashboard/appearance.
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
      <PageHeader title="Restoran" description="Restoranınızın kimliği, iletişim ve Wi-Fi bilgileri." />
      <div className="flex max-w-3xl flex-col gap-6">
        <ProfileForm initial={profile} />
      </div>
    </div>
  );
}
