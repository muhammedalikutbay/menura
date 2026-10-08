import Image from "next/image";
import { cn } from "@/lib/cn";
import type { PublicProduct } from "../queries";
import { Price } from "./price";
import { stretchedButtonClass } from "./product-row";

/** Horizontal strip of featured products ("Öne çıkanlar"). */
export function FeaturedStrip({ products, currency }: { products: PublicProduct[]; currency: string }) {
  return (
    <section id="s-featured" data-menu-section="featured" aria-labelledby="h-featured" className="mx-auto max-w-2xl scroll-mt-20 pt-6">
      <h2 id="h-featured" className="px-4 text-2xl font-bold tracking-tight">
        Öne çıkanlar
      </h2>
      <ul className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 motion-reduce:scroll-auto">
        {products.map((product) => (
          <li key={product.id} className="relative flex w-44 shrink-0 scroll-ml-4 snap-start flex-col gap-2 sm:w-52">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-muted">
              {product.imageUrl && (
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 640px) 208px, 176px"
                  className="object-cover"
                />
              )}
            </div>
            <h3 className="line-clamp-2 text-base leading-snug font-semibold">
              <button
                type="button"
                data-product-id={product.id}
                className={cn(stretchedButtonClass, "after:rounded-xl")}
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
