import { Fish, GripVertical, Salad, Soup, type LucideIcon } from "lucide-react";
import { Badge, Chip } from "@/components/ui/badge";
import { FloatingCard } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import { MiniBars, QrGlyph } from "./sample-ui";

/*
 * Feature illustrations composed from the real UI kit (Card, Switch, Badge, Chip). They are
 * static samples: `inert` keeps them out of the tab order and the accessibility tree, the
 * copy next to them says everything a screen reader user needs.
 */

/** Soft canvas panel with a brand glow that every feature visual sits on. */
export function VisualStage({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      inert
      className={cn(
        "relative isolate flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-canvas p-4 shadow-hairline sm:p-10",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="gradient-brand absolute top-1/2 left-1/2 -z-10 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
      />
      {children}
    </div>
  );
}

type BuilderRow = {
  name: string;
  note: string;
  priceMinor: number;
  discountMinor?: number;
  icon: LucideIcon;
  tag?: string;
  available: boolean;
};

const BUILDER_ROWS: BuilderRow[] = [
  { name: "Mercimek çorbası", note: "Kırmızı mercimek, limon", priceMinor: 12000, icon: Soup, tag: "Vegan", available: true },
  { name: "Roka salatası", note: "Parmesan, ceviz, nar ekşisi", priceMinor: 16500, icon: Salad, tag: "Vejetaryen", available: true },
  { name: "Kalamar tava", note: "Tarator sos ile", priceMinor: 29000, discountMinor: 24650, icon: Fish, available: false },
];

/** A fragment of the menu builder: one category card with three product rows. */
export function BuilderVisual() {
  return (
    <VisualStage>
      <FloatingCard className="w-full max-w-[440px] overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-3 sm:px-4">
          <GripVertical aria-hidden="true" className="size-5 shrink-0 text-fg-subtle" />
          <div className="min-w-0 flex-1">
            <p className="type-title truncate">Başlangıçlar</p>
            <p className="type-caption text-fg-muted">3 ürün</p>
          </div>
          <span className="type-caption text-fg-muted">Menüde</span>
          <Switch defaultChecked aria-label="Kategori menüde" />
        </div>
        <ul>
          {BUILDER_ROWS.map((row) => (
            <li
              key={row.name}
              className="flex items-center gap-2 border-b border-border px-3 py-3 last:border-b-0 sm:gap-3 sm:px-4"
            >
              <GripVertical aria-hidden="true" className="size-5 shrink-0 text-fg-subtle" />
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-md bg-surface-muted text-fg-muted sm:flex">
                <row.icon aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] leading-snug font-semibold tracking-[-0.01em]">{row.name}</p>
                <p className="type-caption hidden truncate text-fg-muted sm:block">{row.note}</p>
                {row.tag && <Badge variant="success" className="mt-1 sm:hidden">{row.tag}</Badge>}
              </div>
              {row.tag && (
                <Badge variant="success" className="hidden md:inline-flex">
                  {row.tag}
                </Badge>
              )}
              <p className="tabular text-right text-[15px] leading-tight font-semibold">
                {row.discountMinor ? (
                  <>
                    <span className="block">{formatMoney(row.discountMinor)}</span>
                    <s className="type-caption block font-normal text-fg-muted">{formatMoney(row.priceMinor)}</s>
                  </>
                ) : (
                  formatMoney(row.priceMinor)
                )}
              </p>
              <Switch defaultChecked={row.available} aria-label={`${row.name} satışta`} />
            </li>
          ))}
        </ul>
      </FloatingCard>
    </VisualStage>
  );
}

const QR_COLORS = [
  { name: "Siyah", dot: "bg-ink" },
  { name: "Mor", dot: "bg-accent" },
  { name: "Yeşil", dot: "bg-success" },
  { name: "Turuncu", dot: "bg-warning" },
  { name: "Kırmızı", dot: "bg-danger" },
] as const;

/** QR customization card: preview, color dots and download formats. */
export function QrVisual() {
  return (
    <VisualStage>
      <FloatingCard className="flex w-full max-w-[320px] flex-col items-center gap-5 p-6">
        <div className="rounded-lg bg-surface p-4 shadow-hairline">
          <QrGlyph className="size-40 text-ink" />
        </div>
        <ul className="flex items-center gap-3">
          {QR_COLORS.map((color, index) => (
            <li
              key={color.name}
              className={cn(
                "rounded-full p-0.5",
                index === 1 && "ring-2 ring-accent ring-offset-2 ring-offset-surface",
              )}
            >
              <span className={cn("block size-6 rounded-full", color.dot)} />
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Chip variant="outline">PNG</Chip>
          <Chip variant="outline">SVG</Chip>
        </div>
      </FloatingCard>
    </VisualStage>
  );
}

const DAILY_VIEWS = [38, 52, 44, 61, 48, 70, 66, 42, 58, 74, 68, 81, 63, 92];

/** 14-day views card. Values are a sample and labelled as such. */
export function StatsVisual() {
  return (
    <VisualStage>
      <FloatingCard className="flex w-full max-w-[440px] flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="type-caption text-fg-muted">Görüntülenme</p>
            <p className="tabular mt-1 text-[32px] leading-none font-semibold tracking-[-0.03em]">1.284</p>
          </div>
          <Badge>Son 14 gün · örnek</Badge>
        </div>
        <MiniBars className="h-36 gap-1.5" values={DAILY_VIEWS} barClassName="rounded-t-md rounded-b-[3px]" />
        <div className="type-caption flex justify-between text-fg-muted">
          <span>14 gün önce</span>
          <span>Bugün</span>
        </div>
      </FloatingCard>
    </VisualStage>
  );
}
