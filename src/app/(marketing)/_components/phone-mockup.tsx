import { Coffee, CupSoda, Croissant, Leaf, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";

type MockItem = { name: string; note: string; priceMinor: number; icon: LucideIcon; tag?: string };

// Illustrative content for the landing preview only; it is not tenant data.
const ITEMS: MockItem[] = [
  { name: "Türk kahvesi", note: "Közde, lokum ile", priceMinor: 9500, icon: Coffee },
  { name: "Zeytinli kruvasan", note: "Taze fırından", priceMinor: 14000, icon: Croissant, tag: "Vegan" },
  { name: "Ev yapımı limonata", note: "Nane ve taze limon", priceMinor: 11000, icon: CupSoda },
  { name: "Yeşil salata", note: "Mevsim yeşillikleri", priceMinor: 16500, icon: Leaf, tag: "Glutensiz" },
];

const CATEGORIES = ["Kahveler", "Fırın", "İçecekler", "Salatalar"];

/** A phone frame built from CSS only, showing what a guest sees after scanning the QR code. */
export function PhoneMockup({ className }: { className?: string }) {
  return (
    <figure className={cn("mx-auto w-full max-w-[19rem]", className)}>
      <div
        aria-hidden="true"
        className="relative rounded-[2.75rem] border-[10px] border-fg bg-fg p-0 shadow-lg"
      >
        {/* Notch */}
        <div className="absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-fg" />
        <div className="flex h-[34rem] flex-col overflow-hidden rounded-[2.1rem] bg-bg">
          <div className="flex flex-col gap-3 bg-accent-soft px-5 pt-10 pb-4">
            <p className="text-xs font-medium text-fg-muted">Hoş geldiniz</p>
            <p className="text-xl font-semibold tracking-tight">Örnek Kafe</p>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-hidden px-1">
              {CATEGORIES.map((name, index) => (
                <span
                  key={name}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                    index === 0 ? "bg-accent text-accent-fg" : "bg-surface text-fg-muted",
                  )}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          <ul className="flex flex-1 flex-col gap-1 px-4 py-3">
            {ITEMS.map(({ name, note, priceMinor, icon: Icon, tag }) => (
              <li key={name} className="flex items-center gap-3 rounded-lg px-1 py-2.5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-text">
                  <Icon className="size-6" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">{name}</span>
                  <span className="truncate text-xs text-fg-muted">{note}</span>
                  {tag && (
                    <span className="mt-1 w-fit rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium text-success">
                      {tag}
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold tabular-nums">{formatMoney(priceMinor)}</span>
              </li>
            ))}
          </ul>

          <p className="border-t border-border px-4 py-3 text-center text-[10px] text-fg-muted">
            Fiyatlara KDV dahildir.
          </p>
        </div>
      </div>
      <figcaption className="sr-only">
        Menura ile hazırlanmış örnek bir menünün telefon ekranındaki görünümü: kategoriler, ürünler, fiyatlar ve
        diyet etiketleri.
      </figcaption>
    </figure>
  );
}
