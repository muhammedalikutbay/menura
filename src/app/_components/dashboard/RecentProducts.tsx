"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { Edit2, Package } from "lucide-react";

export function RecentProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const allProducts = storage.get<Product>("PRODUCTS");
    const allCategories = storage.get<Category>("CATEGORIES");
    
    setCategories(allCategories);
    // Sort by id or timestamp if available, for now just take last 4
    setProducts(allProducts.slice(-4).reverse());
  }, []);

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || "Uncategorized";
  };

  return (
    <section className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-[#E8E8ED] p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h2 className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">Recent Products</h2>
          <p className="text-[13px] text-[#86868B] font-medium">Quick access to latest additions</p>
        </div>
        <a href="/products" className="text-[13px] text-[#0071E3] hover:underline font-bold uppercase tracking-wide transition-colors">
          View All
        </a>
      </div>

      <div className="space-y-2">
        {products.length === 0 ? (
          <div className="py-12 text-center bg-[#F5F5F7] rounded-2xl border border-dashed border-[#D2D2D7]">
            <p className="text-sm text-[#86868B] font-medium">No products found</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#F5F5F7] transition-all group cursor-pointer border border-transparent hover:border-[#E8E8ED]"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-[#F5F5F7] overflow-hidden relative border border-[#E8E8ED]">
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
                  <h4 className="text-[15px] font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[12px] text-[#86868B] font-semibold mt-0.5 uppercase tracking-wide">
                    {getCategoryName(product.categoryId)} • ₺{product.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    product.isAvailable
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "bg-orange-50 text-orange-600 border-orange-100"
                  )}
                >
                  {product.isAvailable ? "Active" : "Draft"}
                </span>
                <button
                  className="p-2 text-[#86868B] hover:text-[#0071E3] bg-white rounded-lg border border-[#E8E8ED] shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/products?edit=${product.id}`;
                  }}
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
