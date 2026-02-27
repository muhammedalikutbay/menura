"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { Edit2, Package } from "lucide-react";
import { Pagination } from "@/components/shared/Pagination";

interface RecentMenuItemsProps {
  onEditMenuItem?: (item: Product) => void;
}

export function RecentMenuItems({ onEditMenuItem }: RecentMenuItemsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const allProducts = storage.get<Product[]>("PRODUCTS", []);
    const allCategories = storage.get<Category[]>("CATEGORIES", []);

    setCategories(allCategories);
    // Sort by createdAt desc for true "Recent" feel
    setProducts([...allProducts].sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || "Uncategorized";
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <section className="lg:col-span-2 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F2F2F7] p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h2 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">Recent Menu Items</h2>
          <p className="text-[14px] text-[#86868B] font-medium">Quick access to latest additions</p>
        </div>
        <a href="/menu-items" className="text-md text-[#0071E3] hover:underline font-bold tracking-wide transition-colors">
          View All
        </a>
      </div>

      <div className="space-y-3 flex-grow">
        {products.length === 0 ? (
          <div className="py-20 text-center bg-[#F5F5F7] rounded-3xl border border-dashed border-[#D2D2D7]">
            <p className="text-[15px] text-[#86868B] font-medium">No menu items found</p>
          </div>
        ) : (
          currentProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 px-6 rounded-2xl hover:bg-[#F5F5F7] transition-all group border border-transparent hover:border-[#E8E8ED]"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] overflow-hidden relative border border-[#E8E8ED]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#D2D2D7]">
                      <Package size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-[18px] font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[14px] text-[#86868B] font-semibold mt-1 uppercase tracking-wide">
                    {getCategoryName(product.categoryId)} • ₺{product.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border",
                    product.isAvailable
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "bg-orange-50 text-orange-600 border-orange-100"
                  )}
                >
                  {product.isAvailable ? "Active" : "Draft"}
                </span>
                <button
                  className="p-3 text-[#0071E3] hover:text-[#0071E3] bg-white rounded-xl border border-[#E8E8ED] shadow-sm opacity-60 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMenuItem?.(product);
                  }}
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </section>
  );
}
