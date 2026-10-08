import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryManager } from "@/features/categories/components/category-manager";
import { listCategories } from "@/features/categories/queries";
import { NoCategories } from "@/features/products/components/no-categories";
import { ProductList } from "@/features/products/components/product-list";
import { listCategoryOptions, listProducts } from "@/features/products/queries";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Menü" };

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { restaurant } = await requireRestaurant();
  const [categories, categoryOptions, products, { category }] = await Promise.all([
    listCategories(restaurant.id),
    listCategoryOptions(restaurant.id),
    listProducts(restaurant.id),
    searchParams,
  ]);

  return (
    <div className="flex flex-col gap-12">
      <CategoryManager categories={categories} />
      {categoryOptions.length === 0 ? (
        <div className="flex flex-col gap-6">
          <PageHeader title="Ürünler" />
          <NoCategories />
        </div>
      ) : (
        <ProductList
          products={products}
          categories={categoryOptions}
          currency={restaurant.currency}
          initialCategoryId={typeof category === "string" ? category : null}
        />
      )}
    </div>
  );
}
