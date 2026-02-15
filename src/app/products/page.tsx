"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { storage } from "@/lib/storage";
import { Category } from "@/types/category";
import { Product, CreateProductInput } from "@/types/product";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "available" | "unavailable";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<FilterStatus>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setProducts(storage.get<Product>("PRODUCTS"));
    setCategories(storage.get<Category>("CATEGORIES"));
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const trLowerName = p.name.toLocaleLowerCase("tr-TR");
        const trLowerQuery = searchQuery.toLocaleLowerCase("tr-TR");
        const matchesSearch = trLowerName.includes(trLowerQuery);
        
        const matchesCategory = selectedCategoryId === "all" || p.categoryId === selectedCategoryId;
        
        const matchesStatus = 
          activeTab === "all" ? true :
          activeTab === "available" ? p.isAvailable : !p.isAvailable;
          
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => a.order - b.order);
  }, [products, searchQuery, selectedCategoryId, activeTab]);

  const handleToggleAvailability = (id: string) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, isAvailable: !p.isAvailable, updatedAt: Date.now() } : p
    );
    setProducts(updated);
    storage.set("PRODUCTS", updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      storage.set("PRODUCTS", updated);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 font-bold text-text-primary tracking-tight">Ürün Yönetimi</h1>
          <p className="text-body-muted">Menüğünüzdeki ürünleri ekleyin, düzenleyin ve fiyatlandırın.</p>
        </div>
        <Button className="shadow-sm">
          + Yeni Ürün
        </Button>
      </div>

      <Card className="border-none bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-divider bg-bg-secondary/30 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-white border border-divider rounded-lg px-3 py-1.5 w-full md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-action/20 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                className="bg-transparent border-none outline-none text-callout w-full placeholder:text-text-secondary/50" 
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <select 
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="bg-white border border-divider rounded-lg px-3 py-1.5 text-callout shadow-sm outline-none focus:ring-2 focus:ring-action/20 min-w-[150px]"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <div className="flex items-center p-1 bg-white border border-divider rounded-full shadow-sm relative min-w-[240px]">
                <div 
                  className={cn(
                    "absolute h-[calc(100%-8px)] rounded-full bg-action transition-all duration-300 ease-out z-0",
                    activeTab === "all" ? "left-1 w-[32%]" : 
                    activeTab === "available" ? "left-[34%] w-[32%]" : 
                    "left-[67%] w-[32%]"
                  )}
                  style={{
                    left: activeTab === "all" ? "4px" : activeTab === "available" ? "33.33%" : "66.66%",
                    width: "calc(33.33% - 4px)"
                  }}
                />
                {(["all", "available", "unavailable"] as FilterStatus[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-1 text-caption font-semibold rounded-full transition-all relative z-10 capitalize whitespace-nowrap px-4 text-center",
                      activeTab === tab 
                        ? "text-white" 
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {tab === "all" ? "Hepsi" : tab === "available" ? "Mevcut" : "Tükendi"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
               <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 mb-4"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
               <h3 className="text-headline font-semibold text-text-primary">Ürün Bulunamadı</h3>
               <p className="text-body-muted text-center max-w-[300px] mt-1">
                 Seçtiğiniz kriterlere uygun ürün bulunmamaktadır. Aramayı değiştirmeyi veya yeni ürün eklemeyi deneyin.
               </p>
               <Button variant="secondary" className="mt-6" onClick={() => { setSearchQuery(""); setSelectedCategoryId("all"); setActiveTab("all"); }}>
                 Filtreleri Temizle
               </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className={cn("group overflow-hidden border border-divider hover:shadow-lg transition-all duration-300 relative", !product.isAvailable && "opacity-60")}>
                  <div className="aspect-[4/3] bg-bg-secondary relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={product.isAvailable ? "success" : "secondary"} className="shadow-sm">
                        {product.isAvailable ? "Mevcut" : "Tükendi"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="flex flex-col">
                      <h4 className="text-callout font-bold text-text-primary truncate">{product.name}</h4>
                      <span className="text-caption text-text-secondary">
                        {categories.find(c => c.id === product.categoryId)?.name || "Kategorisiz"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-headline font-bold text-action">
                          {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </span>
                        {product.discountPrice && (
                          <span className="text-caption text-text-secondary line-through">
                            {product.discountPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleToggleAvailability(product.id)}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error-bg" onClick={() => handleDelete(product.id)}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
