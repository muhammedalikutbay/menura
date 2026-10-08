import type { Metadata } from "next";
import { CategoryManager } from "@/features/categories/components/category-manager";
import { listCategories } from "@/features/categories/queries";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Kategoriler" };

export default async function CategoriesPage() {
  const { restaurant } = await requireRestaurant();
  const categories = await listCategories(restaurant.id);
  return <CategoryManager categories={categories} />;
}
