import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { RestaurantForm, type RestaurantValues } from "@/features/restaurant/components/restaurant-form";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Restoran" };

export default async function RestaurantPage() {
  const { restaurant } = await requireRestaurant();

  const initial: RestaurantValues = {
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
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Restoran" description="Restoranınızın kimliği, iletişim ve Wi-Fi bilgileri." />
      <RestaurantForm initial={initial} />
    </div>
  );
}
