"use client";

import type { Route } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useQrDownloaded } from "@/features/qr/storage";

export type ChecklistProgress = {
  hasCategory: boolean;
  hasProduct: boolean;
  hasLogo: boolean;
  isPublished: boolean;
};

type Step = { id: string; label: string; hint: string; href: string; done: boolean };

/**
 * Setup checklist. Four steps come from the database; "QR kodu indir" cannot be detected
 * on the server, so the QR page leaves a flag in localStorage that is read here.
 * The card disappears once every step is done.
 */
export function OnboardingChecklist({ progress }: { progress: ChecklistProgress }) {
  const qrDownloaded = useQrDownloaded();

  const steps: Step[] = [
    {
      id: "category",
      label: "Kategori ekle",
      hint: "Menünüzü Çorbalar, Tatlılar gibi bölümlere ayırın.",
      href: "/dashboard/menu",
      done: progress.hasCategory,
    },
    {
      id: "product",
      label: "Ürün ekle",
      hint: "İlk ürününüzü fiyatı ve açıklamasıyla ekleyin.",
      href: "/dashboard/products/new",
      done: progress.hasProduct,
    },
    {
      id: "logo",
      label: "Logo yükle",
      hint: "Menünüzün üstünde ve QR kodun ortasında görünür.",
      href: "/dashboard/restaurant",
      done: progress.hasLogo,
    },
    {
      id: "publish",
      label: "Menüyü yayınla",
      hint: "Yayınlanana kadar misafirler menünüzü göremez.",
      href: "/dashboard/appearance",
      done: progress.isPublished,
    },
    {
      id: "qr",
      label: "QR kodu indir",
      hint: "Masalara yerleştirmek için PNG veya SVG olarak indirin.",
      href: "/dashboard/qr",
      done: qrDownloaded,
    },
  ];

  const doneCount = steps.filter((step) => step.done).length;
  if (doneCount === steps.length) return null;

  return (
    <Card role="region" aria-labelledby="checklist-title">
      <CardHeader>
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle id="checklist-title" className="text-lg">
            Kurulumu tamamlayın
          </CardTitle>
          <p className="text-sm font-medium text-fg-muted tabular-nums">
            {doneCount} / {steps.length}
          </p>
        </div>
        <CardDescription>Menünüzü misafirlerinize açmak için son birkaç adım.</CardDescription>
        <div
          role="progressbar"
          aria-label="Kurulum ilerlemesi"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={doneCount}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col divide-y divide-border">
          {steps.map((step) => (
            <li key={step.id}>
              <Link
                href={step.href as Route}
                className="-mx-2 flex min-h-14 items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-muted"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border",
                    step.done ? "border-success bg-success text-bg" : "border-border-strong",
                  )}
                >
                  {step.done && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className={cn("text-[15px] font-medium", step.done && "text-fg-muted line-through")}>
                    {step.label}
                    <span className="sr-only">{step.done ? " (tamamlandı)" : " (yapılacak)"}</span>
                  </span>
                  {!step.done && <span className="text-sm text-fg-muted">{step.hint}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
