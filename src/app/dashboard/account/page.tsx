import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AccountSection } from "@/features/auth/components/account-section";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Hesap" };

export default async function AccountPage() {
  const { user, restaurant } = await requireRestaurant();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Hesap" description="Profiliniz, şifreniz ve hesap güvenliğiniz." />
      <div className="flex max-w-3xl flex-col gap-6">
        <AccountSection restaurantName={restaurant.name} userName={user.name} userEmail={user.email} />
      </div>
    </div>
  );
}
