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
      href: "/dashboard/menu?new=product",
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
          <CardTitle id="checklist-title">
            Kurulumu tamamlayın
          </CardTitle>
          <p className="type-caption tabular text-fg-muted">
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
          className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
        >
          <div
            className="gradient-brand h-full rounded-full transition-[width]"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col divide-y divide-border">
          {steps.map((step, index) => (
            <li key={step.id}>
              <Link
                href={step.href as Route}
                className="-mx-3 flex min-h-16 items-center gap-4 rounded-md px-3 py-3 transition-colors hover:bg-surface-muted"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "tabular flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
                    step.done ? "bg-success text-bg" : "gradient-brand text-brand-fg",
                  )}
                >
                  {step.done ? <Check className="size-4" strokeWidth={3} /> : index + 1}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className={cn("text-[15px] font-medium", step.done && "text-fg-muted line-through")}>
                    {step.label}
                    <span className="sr-only">{step.done ? " (tamamlandı)" : " (yapılacak)"}</span>
                  </span>
                  {!step.done && <span className="type-body text-fg-muted">{step.hint}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
