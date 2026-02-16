"use client";

import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { MenuItemCard } from "./MenuItemCard";
import { Button } from "@/components/ui/button";

interface MenuItemGridProps {
  products: Product[];
  categories: Category[];
  onToggleAvailability: (id: string, e?: React.MouseEvent) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  onResetFilters: () => void;
}

export function MenuItemGrid({
  products,
  categories,
  onToggleAvailability,
  onEdit,
  onDelete,
  onResetFilters,
}: MenuItemGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-[#E5E7EB]">
        <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-[#1D1D1F] font-bold text-lg">No Menu Items Found</h3>
        <p className="text-[#86868B] max-w-xs mx-auto mt-1 mb-6">
          Try adjusting your search criteria, selecting a different category, or adding a new menu item to your list.
        </p>
        <Button
          variant="secondary"
          onClick={onResetFilters}
          className="rounded-full bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E7EB] border-none"
        >
          Reset All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <MenuItemCard
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
