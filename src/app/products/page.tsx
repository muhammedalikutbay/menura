"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { Checkbox } from "@/components/ui/checkbox";
import { storage } from "@/lib/storage";
import { Category } from "@/types/category";
import { Product, CreateProductInput } from "@/types/product";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "available" | "unavailable";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<FilterStatus>("all");

  const [formData, setFormData] = useState<CreateProductInput>({
    name: "",
    categoryId: "",
    price: 0,
    discountPrice: undefined,
    isAvailable: true,
    order: 0,
    description: "",
    calories: undefined,
    allergens: [],
  });

  useEffect(() => {
    // Initial data load
    const storedProducts = storage.get<Product>("PRODUCTS") || [];
    const storedCategories = storage.get<Category>("CATEGORIES") || [];
    setProducts(storedProducts);
    setCategories(storedCategories);
    
    // Set default category if available
    if (storedCategories.length > 0) {
      setFormData((prev: CreateProductInput) => ({ ...prev, categoryId: storedCategories[0].id }));
    }
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

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        discountPrice: product.discountPrice,
        isAvailable: product.isAvailable,
        order: product.order,
        description: product.description || "",
        calories: product.calories,
        allergens: product.allergens || [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        categoryId: categories[0]?.id || "",
        price: 0,
        discountPrice: undefined,
        isAvailable: true,
        order: products.length + 1,
        description: "",
        calories: undefined,
        allergens: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.categoryId) return;

    let updatedProducts: Product[];
    if (editingProduct) {
      updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? { ...p, ...formData, updatedAt: Date.now() }
          : p
      );
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updatedProducts = [...products, newProduct];
    }

    setProducts(updatedProducts);
    storage.set("PRODUCTS", updatedProducts);
    setIsModalOpen(false);
  };

  const handleToggleAvailability = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = products.map(p => 
      p.id === id ? { ...p, isAvailable: !p.isAvailable, updatedAt: Date.now() } : p
    );
    setProducts(updated);
    storage.set("PRODUCTS", updated);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      storage.set("PRODUCTS", updated);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 font-bold text-text-primary tracking-tight">Ürün Yönetimi</h1>
          <p className="text-body-muted">Menünüzdeki ürünleri ekleyin, düzenleyin ve fiyatlandırın.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="shadow-sm">
          + Yeni Ürün
        </Button>
      </div>

      {/* Filter & Search Section */}
      <Card className="border-none bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-divider bg-bg-secondary/30 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border border-divider rounded-lg px-3 py-1.5 w-full md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-action/20 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                className="bg-transparent border-none outline-none text-callout w-full placeholder:text-text-secondary/50" 
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Combined Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Select */}
              <select 
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="bg-white border border-divider rounded-lg px-3 py-1.5 text-callout shadow-sm outline-none focus:ring-2 focus:ring-action/20 min-w-[160px]"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Status TabNav */}
              <div className="flex items-center p-1 bg-white border border-divider rounded-full shadow-sm relative min-w-[240px]">
                <div 
                  className={cn(
                    "absolute h-[calc(100%-8px)] rounded-full bg-action transition-all duration-300 ease-out z-0",
                  )}
                  style={{
                    left: activeTab === "all" ? "4px" : activeTab === "available" ? "calc(33.33% + 2px)" : "calc(66.66% + 2px)",
                    width: "calc(33.33% - 6px)"
                  }}
                />
                {(["all", "available", "unavailable"] as FilterStatus[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-1 text-[11px] font-bold rounded-full transition-all relative z-10 capitalize whitespace-nowrap px-2 text-center",
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

        {/* Product Grid */}
        <div className="p-6">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
               <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 mb-4"><path d="m21 8-9-5-9 5v8l9 5 9-5V8z"/><path d="M12 22V12"/><path d="m21 8-9 5-9-5"/></svg>
               <h3 className="text-headline font-semibold text-text-primary">Ürün Bulunmuyor</h3>
               <p className="text-body-muted text-center max-w-[320px] mt-1">
                 Kriterlere uygun ürün bulunamadı. Filtreleri temizlemeyi veya yeni ürün eklemeyi deneyin.
               </p>
               <Button variant="secondary" className="mt-6" onClick={() => { setSearchQuery(""); setSelectedCategoryId("all"); setActiveTab("all"); }}>
                 Filtreleri Sıfırla
               </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className={cn("group overflow-hidden border border-divider hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full", !product.isAvailable && "opacity-60")}>
                  {/* Image Holder */}
                  <div className="aspect-[4/3] bg-bg-secondary relative overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary/20 bg-gradient-to-br from-bg-secondary to-divider">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={product.isAvailable ? "success" : "secondary"} className="shadow-md backdrop-blur-md bg-white/90 border-none text-[10px] font-black uppercase tracking-widest">
                        {product.isAvailable ? "Mevcut" : "Tükendi"}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-callout font-bold text-text-primary line-clamp-1">{product.name}</h4>
                        <span className="text-[10px] font-mono font-medium text-text-secondary border border-divider px-1.5 rounded">#{String(product.order).padStart(2, "0")}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-tight">
                        {categories.find(c => c.id === product.categoryId)?.name || "Genel"}
                      </span>
                      {product.description && <p className="text-caption text-text-secondary line-clamp-2 leading-relaxed">{product.description}</p>}
                    </div>

                    <div className="flex items-center justify-between border-t border-divider pt-3 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-headline font-black text-action">
                          {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </span>
                        {product.discountPrice && (
                          <span className="text-caption text-text-secondary line-through italic decoration-error/50">
                            {product.discountPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                          </span>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-bg-secondary" onClick={(e) => handleToggleAvailability(product.id, e)} title="Stok Durumu">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={product.isAvailable ? "text-success" : "text-text-secondary"}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-bg-secondary" onClick={() => handleOpenModal(product)}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-error-bg text-error/40 hover:text-error" onClick={(e) => handleDelete(product.id, e)}>
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

      {/* Product Edit/Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
        description="Ürün bilgilerini detaylı bir şekilde girerek menünüzü zenginleştirin."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ürün Adı" error={!formData.name ? "Zorunludur" : ""}>
              <Input
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Kebap"
                autoFocus
              />
            </FormField>

            <FormField label="Kategori" error={!formData.categoryId ? "Zorunludur" : ""}>
              <select 
                value={formData.categoryId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-white border border-divider rounded-lg px-3 py-2 text-callout shadow-sm outline-none focus:ring-2 focus:ring-action/20"
              >
                <option value="" disabled>Seçiniz...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Açıklama">
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ürün içeriği, malzemeler vb."
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Fiyat (₺)">
              <Input
                type="number"
                value={formData.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </FormField>
            
            <FormField label="İndirimli Fiyat (₺)">
              <Input
                type="number"
                value={formData.discountPrice || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, discountPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </FormField>

            <FormField label="Görsel URL">
              <Input
                value={formData.image || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Sıralama">
              <Input
                type="number"
                value={formData.order}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </FormField>

            <FormField label="Kalori (kcal)">
              <Input
                type="number"
                value={formData.calories || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, calories: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </FormField>

            <FormField label="Satışta">
               <div className="flex items-center h-10 gap-2">
                  <Checkbox 
                    checked={formData.isAvailable}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  <span className="text-callout font-medium text-text-primary">Mevcut</span>
               </div>
            </FormField>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-divider mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.categoryId} className="shadow-sm">
              {editingProduct ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
