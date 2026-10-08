import type { Metadata, Route } from "next";
import Link from "next/link";
import { ExternalLink, FolderPlus, Plus, QrCode, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getDailyViews, getTotalViews } from "@/features/analytics/server";
import { formatCount, sumLast } from "@/features/overview/chart";
import { OnboardingChecklist } from "@/features/overview/components/onboarding-checklist";
import { StatCard } from "@/features/overview/components/stat-card";
import { ViewsChart } from "@/features/overview/components/views-chart";
import { getOverviewCounts } from "@/features/overview/queries";
import { CopyLinkButton } from "@/features/qr/components/copy-link-button";
import { env } from "@/server/env";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Genel bakış" };

const CHART_DAYS = 14;

const quickActionClass = buttonVariants({ variant: "secondary", className: "w-full justify-start" });

export default async function DashboardOverviewPage() {
  const { restaurant } = await requireRestaurant();
  const [counts, daily, totalViews] = await Promise.all([
    getOverviewCounts(restaurant.id),
    getDailyViews(restaurant.id, CHART_DAYS),
    getTotalViews(restaurant.id),
  ]);

  const menuUrl = `${env.APP_URL}/m/${restaurant.slug}`;
  const today = daily.at(-1)?.count ?? 0;
  const lastWeek = sumLast(daily, 7);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <PageHeader title="Genel bakış" description={`${restaurant.name} için menü özeti ve son görüntülenmeler.`} />

      {!restaurant.isPublished && (
        <div
          role="status"
          className="flex flex-col gap-4 rounded-lg bg-warning-soft p-5 text-warning-text sm:flex-row sm:items-center sm:p-6"
        >
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface/70"
          >
            <TriangleAlert className="size-5" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="type-title text-base">Menünüz henüz yayında değil</p>
            <p className="type-body">
              Misafirler QR kodu okuttuğunda &ldquo;Menü bulunamadı&rdquo; sayfasını görür. Hazır olduğunuzda
              yayınlayın.
            </p>
          </div>
          <Link
            href={"/dashboard/appearance" as Route}
            className={buttonVariants({
              variant: "secondary",
              size: "sm",
              className: "shrink-0 self-start bg-surface sm:self-auto",
            })}
          >
            Görünüme git
          </Link>
        </div>
      )}

      <OnboardingChecklist
        progress={{
          hasCategory: counts.categories.total > 0,
          hasProduct: counts.products.total > 0,
          hasLogo: restaurant.logoMediaId !== null,
          isPublished: restaurant.isPublished,
        }}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section aria-labelledby="views-heading" className="flex flex-col gap-4 sm:gap-6">
            <h2 id="views-heading" className="sr-only">
              Menü görüntülenmeleri
            </h2>
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
              <StatCard label="Bugün" value={formatCount(today)} detail="menü görüntülenmesi" />
              <StatCard label="Son 7 gün" value={formatCount(lastWeek)} detail="menü görüntülenmesi" />
              <StatCard label="Toplam" value={formatCount(totalViews)} detail="menü görüntülenmesi" />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Son {CHART_DAYS} gün</CardTitle>
                <CardDescription>
                  Menünüzün günlük görüntülenme sayısı. Yalnızca yayındaki menünün açılışları sayılır.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ViewsChart days={daily} />
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="content-heading" className="flex flex-col gap-4 sm:gap-6">
            <h2 id="content-heading" className="sr-only">
              Menü içeriği
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <StatCard
                label="Kategoriler"
                value={formatCount(counts.categories.total)}
                detail={`${formatCount(counts.categories.active)} aktif`}
              />
              <StatCard
                label="Ürünler"
                value={formatCount(counts.products.total)}
                detail={`${formatCount(counts.products.available)} satışta`}
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Menü bağlantısı</CardTitle>
                <Badge variant={restaurant.isPublished ? "success" : "neutral"}>
                  {restaurant.isPublished ? "Yayında" : "Taslak"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="rounded-md bg-surface-muted px-4 py-3 text-sm break-all text-fg-muted">{menuUrl}</p>
              <div className="flex flex-wrap gap-2">
                <CopyLinkButton url={menuUrl} size="sm" variant="primary" />
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <ExternalLink aria-hidden="true" />
                  Menüyü aç
                  <span className="sr-only">(yeni sekmede açılır)</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hızlı işlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link href={"/dashboard/menu?new=product" as Route} className={quickActionClass}>
                    <Plus aria-hidden="true" />
                    Ürün ekle
                  </Link>
                </li>
                <li>
                  <Link href={"/dashboard/menu" as Route} className={quickActionClass}>
                    <FolderPlus aria-hidden="true" />
                    Kategori ekle
                  </Link>
                </li>
                <li>
                  <Link href={"/dashboard/qr" as Route} className={quickActionClass}>
                    <QrCode aria-hidden="true" />
                    QR kodu
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
