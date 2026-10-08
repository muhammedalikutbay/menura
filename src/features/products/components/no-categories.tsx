import type { Route } from "next";
import Link from "next/link";
import { Tags } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** Shown instead of the product pages while the restaurant has no category yet. */
export function NoCategories() {
  return (
    <EmptyState
      icon={<Tags />}
      title="Önce bir kategori ekleyin"
      description="Ürünler bir kategoriye bağlıdır. Ürün eklemeden önce en az bir kategori oluşturmanız gerekir."
      action={
        <Link href={"/dashboard/categories" as Route} className={buttonVariants()}>
          Kategorilere git
        </Link>
      }
    />
  );
}
