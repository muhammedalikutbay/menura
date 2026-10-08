import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { NoCategories } from "@/features/products/components/no-categories";
import { ProductList } from "@/features/products/components/product-list";
import { listCategoryOptions, listProducts } from "@/features/products/queries";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Ürünler" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { restaurant } = await requireRestaurant();
  const [categories, products, { category }] = await Promise.all([
    listCategoryOptions(restaurant.id),
    listProducts(restaurant.id),
    searchParams,
  ]);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Ürünler" />
        <NoCategories />
      </div>
    );
  }

  return (
    <ProductList
      products={products}
      categories={categories}
      currency={restaurant.currency}
      initialCategoryId={typeof category === "string" ? category : null}
    />
  );
}
