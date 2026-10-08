import { DashboardShell } from "@/components/app-shell/dashboard-shell";
import { requireRestaurant } from "@/server/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, restaurant } = await requireRestaurant();
  return (
    <DashboardShell
      restaurant={{ name: restaurant.name, slug: restaurant.slug, isPublished: restaurant.isPublished }}
      user={{ name: user.name, email: user.email }}
    >
      {children}
    </DashboardShell>
  );
}
