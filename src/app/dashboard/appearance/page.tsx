import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { getPublicMenu } from "@/features/menu/queries";
import { AppearanceEditor } from "@/features/restaurant/components/appearance-editor";
import { displayHost } from "@/features/restaurant/slug-input";
import type { Currency } from "@/lib/money";
import { env } from "@/server/env";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Görünüm" };

export default async function AppearancePage() {
  const { restaurant } = await requireRestaurant();
  // The owner always gets their own menu back, even while it is unpublished.
  const menu = await getPublicMenu(restaurant.slug, true);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Görünüm" description="Menünüzün yayın durumu, adresi ve görünümü." />
      {menu ? (
        <AppearanceEditor
          slug={restaurant.slug}
          host={displayHost(env.APP_URL)}
          isPublished={restaurant.isPublished}
          initial={{
            themeColor: restaurant.themeColor,
            currency: restaurant.currency as Currency,
            showVatNote: restaurant.showVatNote,
            hideUnavailable: restaurant.hideUnavailable,
          }}
          menu={menu}
        />
      ) : null}
    </div>
  );
}
