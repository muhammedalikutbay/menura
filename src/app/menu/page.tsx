"use client";

import { useEffect, useState, useMemo } from "react";
import { storage } from "@/lib/storage";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";

export default function CustomerMenuView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedProducts = storage.get<Product[]>("PRODUCTS", []);
    const storedCategories = storage.get<Category[]>("CATEGORIES", []);

    const activeCategories = storedCategories.filter(c => c.isActive).sort((a, b) => a.order - b.order);
    const activeProducts = storedProducts.filter(p => p.isAvailable).sort((a, b) => a.order - b.order);

    setCategories(activeCategories);
    setProducts(activeProducts);

    if (activeCategories.length > 0) {
      setActiveCategoryId(activeCategories[0].id);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = p.categoryId === activeCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [products, activeCategoryId, searchQuery]);

  return (
    <div className="min-h-screen bg-bg-secondary/30 selection:bg-action/20">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-divider px-4 py-3 pb-4">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search flavors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-bg-secondary/50 border border-divider rounded-2xl px-12 text-body-muted font-medium outline-none focus:ring-2 focus:ring-action/20 transition-all placeholder:text-text-secondary/50"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
        </div>
      </div>

      {/* Categories Scroller */}
      <div className="sticky top-[73px] z-40 bg-white/50 backdrop-blur-lg border-b border-divider overflow-x-auto no-scrollbar">
        <div className="flex px-4 py-3 gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-caption font-black transition-all uppercase tracking-widest",
                activeCategoryId === cat.id
                  ? "bg-action text-white shadow-lg shadow-action/20 scale-105"
                  : "bg-white border border-divider text-text-secondary hover:bg-bg-secondary"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-8 pb-24">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-divider overflow-hidden hover:shadow-xl transition-all duration-500 group"
              >
                {/* Product Image */}
                <div className="aspect-[4/3] relative overflow-hidden bg-bg-secondary">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                    </div>
                  )}
                  {/* Preparation Time Badge */}
                  {product.preparationTime && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur shadow-sm px-2 py-1 rounded-lg text-[10px] font-black text-text-primary flex items-center gap-1.5 uppercase tracking-tighter">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {product.preparationTime}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-body font-black text-text-primary uppercase tracking-tight leading-tight">{product.name}</h3>
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-body font-black",
                        product.discountPrice ? "text-success" : "text-action"
                      )}>
                        {product.discountPrice ? product.discountPrice : product.price}₺
                      </span>
                      {product.discountPrice && (
                        <span className="text-caption text-text-secondary line-through opacity-50 decoration-2">
                          {product.price}₺
                        </span>
                      )}
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-caption text-text-secondary leading-relaxed line-clamp-2 font-medium">
                      {product.description}
                    </p>
                  )}

                  {/* Highlights (Allergens, Calories) */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {product.calories && (
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-bg-secondary px-2 py-0.5 rounded border border-divider/50">
                        {product.calories} KCAL
                      </span>
                    )}
                    {product.allergens?.map((allergen, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-error/80 uppercase tracking-widest bg-error/5 px-2 py-0.5 rounded border border-error/10">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto border border-divider shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary opacity-30"><path d="m21 8-9-5-9 5v8l9 5 9-5V8z" /><path d="M12 22V12" /><path d="m21 8-9 5-9-5" /></svg>
              </div>
              <div>
                <h4 className="text-body font-black text-text-primary uppercase tracking-widest">No Flavors Found</h4>
                <p className="text-caption text-text-secondary font-medium">Not currently serving in this category.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-divider p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">POWERED BY</span>
          <span className="text-caption font-black text-action tracking-tighter uppercase">MENURA</span>
        </div>
      </footer>
    </div>
  );
}
