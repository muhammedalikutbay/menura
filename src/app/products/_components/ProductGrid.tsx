"use client";

import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onToggleAvailability: (id: string, e?: React.MouseEvent) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  onResetFilters: () => void;
}

export function ProductGrid({
  products,
  categories,
  onToggleAvailability,
  onEdit,
  onDelete,
  onResetFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 mb-4">
          <path d="m21 8-9-5-9 5v8l9 5 9-5V8z"/><path d="M12 22V12"/><path d="m21 8-9 5-9-5"/>
        </svg>
        <h3 className="text-headline font-semibold text-text-primary">Ürün Bulunmuyor</h3>
        <p className="text-body-muted text-center max-w-[320px] mt-1">
          Kriterlere uygun ürün bulunamadı. Filtreleri temizlemeyi veya yeni ürün eklemeyi deneyin.
        </p>
        <Button variant="secondary" className="mt-6" onClick={onResetFilters}>
          Filtreleri Sıfırla
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categories={categories}
          onToggleAvailability={onToggleAvailability}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
