"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { TabNav } from "@/components/shared/TabNav";
import { ProductGrid } from "./_components/ProductGrid";
import { ProductForm } from "./_components/ProductForm";
import { Pagination } from "@/components/shared/Pagination";
import { storage } from "@/lib/storage";
import { Category } from "@/types/category";
import { Product, CreateProductInput } from "@/types/product";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "active" | "draft";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get("categoryId") || "all";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [activeTab, setActiveTab] = useState<FilterStatus>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 2 rows of 4 on desktop

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
    
    // Set default category if available and not set by URL
    if (storedCategories.length > 0 && initialCategoryId === "all") {
      setFormData((prev: CreateProductInput) => ({ ...prev, categoryId: storedCategories[0].id }));
    } else if (initialCategoryId !== "all") {
      setFormData((prev: CreateProductInput) => ({ ...prev, categoryId: initialCategoryId }));
    }
  }, [initialCategoryId]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const lowerName = p.name.toLowerCase();
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSearch = lowerName.includes(lowerQuery);
        
        const matchesCategory = selectedCategoryId === "all" || p.categoryId === selectedCategoryId;
        
        const matchesStatus = 
          activeTab === "all" ? true :
          activeTab === "active" ? p.isAvailable : !p.isAvailable;
          
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => a.order - b.order);
  }, [products, searchQuery, selectedCategoryId, activeTab]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryId, activeTab]);

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
        preparationTime: product.preparationTime || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        categoryId: initialCategoryId !== "all" ? initialCategoryId : (categories[0]?.id || ""),
        price: 0,
        discountPrice: undefined,
        isAvailable: true,
        order: products.length + 1,
        description: "",
        calories: undefined,
        allergens: [],
        preparationTime: "",
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
    if (confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      storage.set("PRODUCTS", updated);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Section */}
      <PageHeader 
        title="Product Management"
        description="Add, edit, and price your menu items."
        action={{
          label: "New Product",
          onClick: () => handleOpenModal(),
          icon: <span>+</span>
        }}
      />

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-divider/60 shadow-lg shadow-[#0d7ff2]/5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-300">
        <div className="flex items-center gap-4 flex-1">
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products..."
            className="bg-white"
          />
          <span className="hidden lg:block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-50 whitespace-nowrap">
            {filteredProducts.length} PRODUCTS
          </span>
        </div>

        {/* Combined Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Select */}
          <div className="relative group">
            <select 
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="appearance-none bg-white border border-divider rounded-xl pl-4 pr-10 py-2.5 text-[12px] font-black uppercase tracking-widest shadow-sm outline-none focus:ring-2 focus:ring-action/20 min-w-[180px] transition-all cursor-pointer hover:border-action/30"
            >
              <option value="all">ALL CATEGORIES</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary opacity-40 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          <TabNav 
            tabs={[
              { value: "all", label: "ALL" },
              { value: "active", label: "ACTIVE" },
              { value: "draft", label: "DRAFT" }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Product Grid Area */}
      <div className="min-h-[500px]">
        <ProductGrid 
          products={currentItems}
          categories={categories}
          onToggleAvailability={handleToggleAvailability}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onResetFilters={() => { setSearchQuery(""); setSelectedCategoryId("all"); setActiveTab("all"); }}
        />

        <div className="mt-12 mb-8">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        description="Enhance your menu by entering detailed product information."
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
