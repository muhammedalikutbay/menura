import { cn } from "@/lib/cn";
import type { PublicProduct } from "../types";
import { MenuImage } from "./menu-image";
import { Price } from "./price";
import { stretchedButtonClass } from "./product-row";

/** Horizontal strip of featured products ("Öne çıkanlar"): 160px cards. */
export function FeaturedStrip({ products, currency }: { products: PublicProduct[]; currency: string }) {
  return (
    <section
      id="s-featured"
      data-menu-section="featured"
      aria-labelledby="h-featured"
      className="mx-auto max-w-2xl scroll-mt-20 pt-8"
    >
      <h2 id="h-featured" className="type-title px-4">
        Öne çıkanlar
      </h2>
      <ul className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 motion-reduce:scroll-auto">
        {products.map((product) => (
          <li key={product.id} className="relative flex w-40 shrink-0 scroll-ml-4 snap-start flex-col gap-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-muted">
              {product.imageUrl && (
                <MenuImage
                  src={product.imageUrl}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="160px"
                  className="object-cover"
                />
              )}
            </div>
            <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold">
              <button
                type="button"
                data-product-id={product.id}
                className={cn(stretchedButtonClass, "after:rounded-lg")}
              >
                {product.name}
              </button>
            </h3>
            <Price product={product} currency={currency} />
          </li>
        ))}
      </ul>
    </section>
  );
}
