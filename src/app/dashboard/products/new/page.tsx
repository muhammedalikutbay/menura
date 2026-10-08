import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/features/products/components/back-link";
import { NoCategories } from "@/features/products/components/no-categories";
import { ProductForm } from "@/features/products/components/product-form";
import { listCategoryOptions } from "@/features/products/queries";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Yeni ürün" };

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { restaurant } = await requireRestaurant();
  const [categories, { category }] = await Promise.all([listCategoryOptions(restaurant.id), searchParams]);

  const filterId =
    typeof category === "string" && categories.some((item) => item.id === category) ? category : null;
  const returnHref = filterId ? `/dashboard/products?category=${filterId}` : "/dashboard/products";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <BackLink href={returnHref} />
      <PageHeader title="Yeni ürün" description="Ürün bilgilerini girin; kaydedince menünüzde görünür." />
      {categories.length === 0 ? (
        <NoCategories />
      ) : (
        <ProductForm
          categories={categories}
          currency={restaurant.currency}
          returnHref={returnHref}
          initialValues={{
            name: "",
            categoryId: filterId ?? (categories.length === 1 ? categories[0]!.id : ""),
            description: "",
            price: "",
            discountPrice: "",
            imageMediaId: null,
            isAvailable: true,
            isFeatured: false,
            prepTime: "",
            calories: "",
            allergens: [],
            tags: [],
          }}
        />
      )}
    </div>
  );
}
