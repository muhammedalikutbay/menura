import type { Metadata } from "next";
import { listCategories } from "@/features/categories/queries";
import { MenuBuilder } from "@/features/products/builder/menu-builder";
import { listProducts } from "@/features/products/queries";
import { requireRestaurant } from "@/server/session";

export const metadata: Metadata = { title: "Menü" };

export default async function MenuPage() {
  const { restaurant } = await requireRestaurant();
  const [categories, products] = await Promise.all([listCategories(restaurant.id), listProducts(restaurant.id)]);

  return <MenuBuilder categories={categories} products={products} currency={restaurant.currency} />;
}
