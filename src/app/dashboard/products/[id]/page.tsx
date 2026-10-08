import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/features/products/components/back-link";
import { ProductForm } from "@/features/products/components/product-form";
import { getProduct, listCategoryOptions } from "@/features/products/queries";
import { toMoneyInput } from "@/lib/money";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Ürünü düzenle" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { restaurant } = await requireRestaurant();
  const [{ id }, { category }] = await Promise.all([params, searchParams]);
  const [item, categories] = await Promise.all([getProduct(restaurant.id, id), listCategoryOptions(restaurant.id)]);
  if (!item) notFound();

  const filterId =
    typeof category === "string" && categories.some((entry) => entry.id === category) ? category : null;
  const returnHref = filterId ? `/dashboard/menu?category=${filterId}` : "/dashboard/menu";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <BackLink href={returnHref} />
      <PageHeader title={item.name} description="Ürün bilgilerini güncelleyin." />
      <ProductForm
        // A fresh form for each product, even when Next reuses the page instance.
        key={item.id}
        productId={item.id}
        categories={categories}
        currency={restaurant.currency}
        returnHref={returnHref}
        initialValues={{
          name: item.name,
          categoryId: item.categoryId,
          description: item.description ?? "",
          price: toMoneyInput(item.priceMinor),
          discountPrice: toMoneyInput(item.discountPriceMinor),
          imageMediaId: item.imageMediaId,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
          prepTime: item.prepTime ?? "",
          calories: item.calories === null ? "" : String(item.calories),
          allergens: item.allergens,
          tags: item.tags,
        }}
      />
    </div>
  );
}
