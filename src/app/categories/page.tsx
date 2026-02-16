"use client";

import { useEffect, useState, useMemo } from "react";
import { CategoryCard } from "./_components/CategoryCard";
import { CategoryForm } from "./_components/CategoryForm";
import { Pagination } from "@/components/shared/Pagination";
import { SearchInput } from "@/components/shared/SearchInput";
import { TabNav } from "@/components/shared/TabNav";
import { storage } from "@/lib/storage";
import { Category, CreateCategoryInput } from "@/types/category";
import { Product } from "@/types/product";

type FilterStatus = "all" | "active" | "draft";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterStatus>("all");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: "",
    description: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    setCategories(storage.get<Category>("CATEGORIES"));
    setProducts(storage.get<Product>("PRODUCTS"));
  }, []);

  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => {
        const lowerName = c.name.toLowerCase();
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSearch = lowerName.includes(lowerQuery);
        
        const matchesStatus = 
          activeTab === "all" ? true :
          activeTab === "active" ? c.isActive : !c.isActive;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.order - b.order);
  }, [categories, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredCategories, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const handleEditClick = (category: Category) => {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        image: category.image || "",
        order: category.order,
        isActive: category.isActive,
      });
      // Scroll to top to see form if needed
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        image: "",
        order: categories.length + 1,
        isActive: true,
      });
  }

  const handleSave = () => {
    if (!formData.name) return;

    let updatedCategories: Category[];
    if (editingCategory) {
      updatedCategories = categories.map((c) =>
        c.id === editingCategory.id
          ? { ...c, ...formData, updatedAt: Date.now() }
          : c
      );
    } else {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updatedCategories = [...categories, newCategory];
    }

    setCategories(updatedCategories);
    storage.set("CATEGORIES", updatedCategories);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const updatedCategories = categories.filter((c) => c.id !== id);
      setCategories(updatedCategories);
      storage.set("CATEGORIES", updatedCategories);
      if (editingCategory?.id === id) {
          resetForm();
      }
    }
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen">
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-10 md:py-16">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3 text-[#1D1D1F]">
                    Categories
                </h1>
                <p className="text-lg text-[#86868B] max-w-2xl">
                    Organize your menu items efficiently. Create categories like
                    "Starters", "Main Course", or "Beverages" to help customers navigate
                    your menu.
                </p>
            </div>
            <div className="flex items-center gap-3"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
            {/* Sidebar Form */}
            <div className="w-full lg:w-1/3 xl:w-1/4">
               <CategoryForm 
                 formData={formData}
                 setFormData={setFormData}
                 onSave={handleSave}
                 isEditing={!!editingCategory}
                 onCancel={resetForm}
               />
            </div>

            {/* Main Grid Content */}
            <div className="w-full lg:w-2/3 xl:w-3/4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <TabNav 
                        tabs={[
                            { value: "all", label: "All Categories" },
                            { value: "active", label: "Active" },
                            { value: "draft", label: "Drafts" }
                        ]}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        className="w-full sm:w-auto"
                    />
                    
                    <div className="w-full sm:w-auto">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search..."
                            className="w-full sm:w-64 bg-white border-[#E5E7EB] rounded-full"
                        />
                    </div>
                </div>

                {currentItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {currentItems.map((category) => (
                            <CategoryCard 
                                key={category.id} 
                                category={category} 
                                productCount={products.filter(p => p.categoryId === category.id).length}
                                onEdit={handleEditClick}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-[#E5E7EB]">
                        <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </div>
                        <h3 className="text-[#1D1D1F] font-bold text-lg">No Categories Found</h3>
                        <p className="text-[#86868B]">Try adjusting your search or filters.</p>
                    </div>
                )}
                
                {totalPages > 1 && (
                    <div className="mt-10">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
