"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { TabNav } from "@/components/shared/TabNav";
import { ProductGrid } from "./_components/ProductGrid";
import { ProductForm } from "./_components/ProductForm";
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
      <PageHeader 
        title="Ürün Yönetimi"
        description="Menünüzdeki ürünleri ekleyin, düzenleyin ve fiyatlandırın."
        action={{
          label: "Yeni Ürün",
          onClick: () => handleOpenModal(),
          icon: <span>+</span>
        }}
      />

      {/* Filter & Search Section */}
      <Card className="border-none bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-divider bg-bg-secondary/30 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <SearchInput 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Ürün ara..."
            />

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

              <TabNav 
                tabs={[
                  { value: "all", label: "Hepsi" },
                  { value: "available", label: "Mevcut" },
                  { value: "unavailable", label: "Tükendi" }
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid 
          products={filteredProducts}
          categories={categories}
          onToggleAvailability={handleToggleAvailability}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onResetFilters={() => { setSearchQuery(""); setSelectedCategoryId("all"); setActiveTab("all"); }}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
        description="Ürün bilgilerini detaylı bir şekilde girerek menünüzü zenginleştirin."
      >
        <ProductForm 
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          isEditing={!!editingProduct}
        />
      </Modal>
    </div>
  );
}
