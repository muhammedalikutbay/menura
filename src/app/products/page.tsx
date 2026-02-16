"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [activeTab, setActiveTab] = useState<FilterStatus>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState<CreateProductInput>({
    name: "",
    categoryId: "",
    price: 0,
    isAvailable: true,
    description: "",
    image: "",
    order: 0,
  });

  useEffect(() => {
    // Initial data load
    const storedProducts = storage.get<Product>("PRODUCTS") || [];
    const storedCategories = storage.get<Category>("CATEGORIES") || [];
    setProducts(storedProducts);
    setCategories(storedCategories);
    
    // Set default category if available and not set by URL
    if (storedCategories.length > 0 && initialCategoryId === "all") {
      setFormData((prev: CreateProductInput) => ({ 
        ...prev, 
        categoryId: "",
        order: storedProducts.length + 1
      }));
    } else if (initialCategoryId !== "all") {
      setFormData((prev: CreateProductInput) => ({ 
        ...prev, 
        categoryId: initialCategoryId,
        order: storedProducts.length + 1
      }));
    }
  }, [initialCategoryId]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p: Product) => {
        const lowerName = p.name.toLowerCase();
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSearch = lowerName.includes(lowerQuery);
        
        const matchesCategory = selectedCategoryId === "all" || p.categoryId === selectedCategoryId;
        
        const matchesStatus = 
          activeTab === "all" ? true :
          activeTab === "active" ? p.isAvailable : !p.isAvailable;
          
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a: Product, b: Product) => (a.order || 0) - (b.order || 0));
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
        isAvailable: product.isAvailable,
        description: product.description || "",
        image: product.image || "",
        order: product.order || 0,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        categoryId: "",
        price: 0,
        isAvailable: true,
        description: "",
        image: "",
        order: products.length + 1,
      });
    }
  };

  const topCategories = useMemo(() => {
    const counts = categories.map(cat => ({
      ...cat,
      count: products.filter(p => p.categoryId === cat.id).length
    }));
    return counts.sort((a, b) => b.count - a.count).slice(0, 3);
  }, [categories, products]);

  const handleSave = () => {
    if (!formData.name || !formData.categoryId || !formData.description || !formData.image) return;

    let updatedProducts: Product[];
    if (editingProduct) {
      updatedProducts = products.map((p: Product) =>
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
    handleOpenModal(); // Reset form
  };

  const handleToggleAvailability = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = products.map((p: Product) => 
      p.id === id ? { ...p, isAvailable: !p.isAvailable, updatedAt: Date.now() } : p
    );
    setProducts(updated);
    storage.set("PRODUCTS", updated);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter((p: Product) => p.id !== id);
      setProducts(updated);
      storage.set("PRODUCTS", updated);
    }
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen">
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-10 md:py-16">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3 text-[#1D1D1F]">
                    Products
                </h1>
                <p className="text-lg text-[#86868B] max-w-2xl">
                    Manage your culinary creations. Add new items, update prices, 
                    and keep your menu fresh for your customers.
                </p>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
            {/* Sidebar Form */}
            <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0">
                <ProductForm 
                 formData={formData}
                 setFormData={setFormData}
                 categories={categories}
                 topCategories={topCategories}
                 onSave={handleSave}
                 isEditing={!!editingProduct}
                 onCancel={() => handleOpenModal()} 
               />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Advanced Filter Bar */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <TabNav 
                          tabs={[
                            { value: "all", label: "All Products" },
                            { value: "active", label: "Active" },
                            { value: "draft", label: "Drafts" }
                          ]}
                          activeTab={activeTab}
                          onTabChange={setActiveTab}
                          className="w-full sm:w-auto"
                        />
                        
                        <div className="w-full sm:w-64">
                            <SearchInput
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search products..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <button 
                            onClick={() => setSelectedCategoryId("all")}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all shrink-0 border",
                                selectedCategoryId === "all" 
                                    ? "bg-[#0071e3] text-white border-[#0071e3] shadow-md shadow-[#0071e3]/20" 
                                    : "bg-white text-[#86868B] border-[#E5E7EB] hover:border-[#0071e3] hover:text-[#0071e3]"
                            )}
                        >
                            All Categories
                        </button>
                        {categories.map((cat: Category) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategoryId(cat.id)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all shrink-0 border",
                                    selectedCategoryId === cat.id 
                                        ? "bg-[#0071e3] text-white border-[#0071e3] shadow-md shadow-[#0071e3]/20" 
                                        : "bg-white text-[#86868B] border-[#E5E7EB] hover:border-[#0071e3] hover:text-[#0071e3]"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
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

                    {totalPages > 1 && (
                        <div className="mt-12 mb-8">
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
