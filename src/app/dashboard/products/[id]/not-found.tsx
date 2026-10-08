import type { Route } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ProductNotFound() {
  return (
    <EmptyState
      icon={<SearchX />}
      title="Ürün bulunamadı"
      description="Bu ürün silinmiş olabilir ya da size ait değil."
      action={
        <Link href={"/dashboard/menu" as Route} className={buttonVariants()}>
          Menüye dön
        </Link>
      }
    />
  );
}
