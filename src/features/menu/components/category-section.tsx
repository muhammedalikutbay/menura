import type { PublicCategory } from "../types";
import { ProductRow } from "./product-row";

export function CategorySection({ category, currency }: { category: PublicCategory; currency: string }) {
  return (
    <section
      id={`s-${category.id}`}
      data-menu-section={category.id}
      aria-labelledby={`h-${category.id}`}
      // Leaves room for the sticky bar when a chip scrolls here.
      className="mx-auto max-w-2xl scroll-mt-20 px-4 pt-8"
    >
      <h2 id={`h-${category.id}`} className="type-title text-balance">
        {category.name}
      </h2>
      {category.description && <p className="mt-1 text-sm text-fg-muted text-pretty">{category.description}</p>}
      <ul className="mt-1 [&>li:not([hidden])~li:not([hidden])]:border-t [&>li:not([hidden])~li:not([hidden])]:border-border">
        {category.products.map((product) => (
          <ProductRow key={product.id} product={product} categoryName={category.name} currency={currency} />
        ))}
      </ul>
    </section>
  );
}
