import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { tagLabel } from "@/lib/menu-attributes";
import type { PublicProduct } from "../types";
import { searchText } from "../sheet-data";
import { MenuImage } from "./menu-image";
import { Price } from "./price";

/** Whole row opens the detail sheet: the name button is stretched over the row. */
export const stretchedButtonClass =
  "text-left outline-none after:absolute after:inset-0 after:rounded-md " +
  "focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-solid " +
  "focus-visible:after:outline-(color:--menu-accent-text)";

export function ProductRow({
  product,
  categoryName,
  currency,
}: {
  product: PublicProduct;
  categoryName: string;
  currency: string;
}) {
  const unavailable = !product.isAvailable;
  const tags = product.tags.slice(0, 3);

  return (
    <li data-search={searchText(product, categoryName)} className="relative flex gap-4 py-4">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <h3 className={cn("text-[15px] leading-snug font-semibold text-balance", unavailable && "text-fg-muted")}>
          <button type="button" data-product-id={product.id} className={stretchedButtonClass}>
            {product.name}
          </button>
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-sm leading-snug text-fg-muted">{product.description}</p>
        )}
        {tags.length > 0 && (
          <ul className="mt-0.5 flex flex-wrap gap-1.5" aria-label="Etiketler">
            {tags.map((tag) => (
              <li key={tag}>
                <Badge>{tagLabel(tag)}</Badge>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Price product={product} currency={currency} muted={unavailable} />
          {unavailable && <Badge variant="danger">Tükendi</Badge>}
        </div>
      </div>

      {product.imageUrl && (
        <div className="relative size-21 shrink-0 self-start overflow-hidden rounded-md bg-surface-muted">
          <MenuImage
            src={product.imageUrl}
            alt=""
            fill
            loading="lazy"
            sizes="84px"
            className={cn("object-cover", unavailable && "opacity-60 grayscale")}
          />
        </div>
      )}
    </li>
  );
}
