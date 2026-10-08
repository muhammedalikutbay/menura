"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import {
  MAX_TABLE_CARDS,
  SHEET_LAYOUTS,
  buildCards,
  buildTableLabels,
  cardsPerSheet,
  chunk,
  parsePositiveInt,
  type SheetLayout,
} from "../print";
import { useStoredQrStyle } from "../storage";
import { buildQrOptions, relativeLuminance } from "../style";
import { OptionGroup } from "./option-group";
import { useQrImage } from "./use-qr-image";

type QrPrintSheetProps = {
  menuUrl: string;
  restaurantName: string;
  logoUrl: string | null;
};

const layoutOptions = [
  { value: "2x2", label: "2 × 2 (4 kart)" },
  { value: "3x3", label: "3 × 3 (9 kart)" },
] as const satisfies ReadonlyArray<{ value: SheetLayout; label: string }>;

/**
 * Print rules, active only while this page is mounted: A4 page, and the dashboard chrome
 * (sidebar, mobile bar, skip link: every sibling of <main>) is hidden on paper.
 */
const PRINT_CSS = `
@page { size: A4; margin: 8mm; }
@media print {
  html, body { background: #fff !important; }
  :has(> #main-content) > :not(#main-content) { display: none !important; }
  #main-content { padding: 0 !important; }
  #main-content > div { max-width: none !important; margin: 0 !important; padding: 0 !important; }
}
`;

/** Printable area of an A4 sheet inside the 8 mm page margin (slightly short to avoid blank pages). */
const SHEET_WIDTH = "194mm";
const SHEET_HEIGHT = "280mm";

function readableTextColor(background: string): string {
  return relativeLuminance(background) > 0.4 ? "#1d1d1f" : "#ffffff";
}

export function QrPrintSheet({ menuUrl, restaurantName, logoUrl }: QrPrintSheetProps) {
  const [style] = useStoredQrStyle();
  const [layout, setLayout] = useState<SheetLayout>("2x2");
  const [firstTable, setFirstTable] = useState("1");
  const [lastTable, setLastTable] = useState("");

  const options = useMemo(() => buildQrOptions(style, { data: menuUrl, size: 1024, logoUrl, type: "svg" }), [style, menuUrl, logoUrl]);
  const { url: qrUrl, failed } = useQrImage(options);

  const labels = buildTableLabels(parsePositiveInt(firstTable), parsePositiveInt(lastTable));
  const cards = buildCards(labels, layout);
  const pages = chunk(cards, cardsPerSheet(layout));
  const { columns, rows } = SHEET_LAYOUTS[layout];
  const compact = layout === "3x3";
  const cappedNotice =
    parsePositiveInt(lastTable) !== null && labels.length === MAX_TABLE_CARDS
      ? `Tek seferde en fazla ${MAX_TABLE_CARDS} kart hazırlanır.`
      : null;

  const textColor = readableTextColor(style.bg);

  return (
    <div className="flex flex-col gap-6">
      <style>{PRINT_CSS}</style>

      <div className="flex flex-col gap-6 print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Baskı ayarları</CardTitle>
            <CardDescription>
              Kartlar A4 kâğıda sığacak şekilde hazırlanır. QR kod stili, QR kod sayfasındaki ayarlardan alınır.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <OptionGroup legend="Sayfa düzeni" value={layout} options={layoutOptions} onChange={setLayout} />
            <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
              <Field label="İlk masa numarası" optional>
                <Input inputMode="numeric" value={firstTable} onChange={(event) => setFirstTable(event.target.value)} />
              </Field>
              <Field
                label="Son masa numarası"
                optional
                hint="Boş bırakırsanız tüm kartlar aynı olur."
              >
                <Input
                  inputMode="numeric"
                  placeholder="Örn. 12"
                  value={lastTable}
                  onChange={(event) => setLastTable(event.target.value)}
                />
              </Field>
            </div>
            {cappedNotice && <p className="text-sm text-warning">{cappedNotice}</p>}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => window.print()} disabled={!qrUrl}>
            <Printer aria-hidden="true" />
            Yazdır
          </Button>
          <Link href={"/dashboard/qr" as Route} className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeft aria-hidden="true" />
            QR koda dön
          </Link>
          <p className="text-sm text-fg-muted" aria-live="polite">
            {cards.length} kart · {pages.length} sayfa
          </p>
        </div>
        {failed && (
          <p role="alert" className="text-sm font-medium text-danger">
            QR kod oluşturulamadı. Sayfayı yenileyip tekrar deneyin.
          </p>
        )}
      </div>

      {/* The sheets. On screen they scroll horizontally on narrow viewports; on paper they fill the page. */}
      <div className="overflow-x-auto pb-2 print:overflow-visible print:pb-0">
        <div className="flex w-max min-w-full flex-col items-center gap-6 print:block print:w-auto print:gap-0">
          {pages.map((pageCards, pageIndex) => (
            <section
              key={pageIndex}
              aria-label={`Sayfa ${pageIndex + 1}`}
              className="grid shrink-0 bg-white shadow-md print:shadow-none"
              style={{
                width: SHEET_WIDTH,
                height: SHEET_HEIGHT,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                breakAfter: pageIndex === pages.length - 1 ? "auto" : "page",
                breakInside: "avoid",
              }}
            >
              {pageCards.map((label, cardIndex) => (
                <article
                  key={cardIndex}
                  className={cn(
                    "flex min-w-0 flex-col items-center justify-center text-center",
                    compact ? "gap-2 p-3" : "gap-4 p-6",
                  )}
                  style={{
                    backgroundColor: style.bg,
                    color: textColor,
                    border: "1px dashed #b0b0b5",
                    printColorAdjust: "exact",
                    WebkitPrintColorAdjust: "exact",
                    breakInside: "avoid",
                  }}
                >
                  <h2 className={cn("max-w-full font-semibold tracking-tight text-balance", compact ? "text-base" : "text-2xl")}>
                    {restaurantName}
                  </h2>
                  {qrUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- generated object URL
                    <img src={qrUrl} alt={`${restaurantName} menüsü için QR kod`} className="aspect-square w-[88%]" draggable={false} />
                  ) : (
                    <Skeleton className="aspect-square w-[88%]" />
                  )}
                  <p className={cn("font-medium", compact ? "text-xs" : "text-lg")}>Menüyü görmek için okutun</p>
                  {label && <p className={cn("font-bold tracking-tight", compact ? "text-xl" : "text-4xl")}>{label}</p>}
                </article>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
