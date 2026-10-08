import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import type { PublicProduct } from "../queries";

/** Price with an optional struck-through old price. `muted` is used for unavailable products. */
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
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      <span className={cn("text-base font-semibold", muted && "text-fg-muted")}>
        {discounted && <span className="sr-only">İndirimli fiyat: </span>}
        {formatMoney(discounted ? product.discountPriceMinor! : product.priceMinor, currency)}
      </span>
      {discounted && (
        <del className="text-sm text-fg-muted">
          <span className="sr-only">Eski fiyat: </span>
          {formatMoney(product.priceMinor, currency)}
        </del>
      )}
    </span>
  );
}
