import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import type { PublicProduct } from "../types";

/** Price in the restaurant accent, with an optional struck-through old price. `muted` is for unavailable products. */
export function Price({
  product,
  currency,
  muted = false,
  className,
}: {
  product: Pick<PublicProduct, "priceMinor" | "discountPriceMinor">;
  currency: string;
  muted?: boolean;
  className?: string;
}) {
  const discounted = product.discountPriceMinor != null;
  return (
    <span className={cn("tabular inline-flex items-baseline gap-2", className)}>
      <span
        className={cn("text-[15px] leading-snug font-semibold", muted ? "text-fg-muted" : "text-(color:--menu-accent-text)")}
      >
        {discounted && <span className="sr-only">İndirimli fiyat: </span>}
        {formatMoney(discounted ? product.discountPriceMinor! : product.priceMinor, currency)}
      </span>
      {discounted && (
        <del className="type-caption text-fg-muted">
          <span className="sr-only">Eski fiyat: </span>
          {formatMoney(product.priceMinor, currency)}
        </del>
      )}
    </span>
  );
}
