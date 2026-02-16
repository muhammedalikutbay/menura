"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { TabNav } from "@/components/shared/TabNav";
import { BulkActionBar } from "@/components/shared/BulkActionBar";
import { CategoryTable } from "./_components/CategoryTable";
import { CategoryForm } from "./_components/CategoryForm";
import { Pagination } from "@/components/shared/Pagination";
import { storage } from "@/lib/storage";
import { Category, CreateCategoryInput } from "@/types/category";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "active" | "passive";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterStatus>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: "",
    description: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    setCategories(storage.get<Category>("CATEGORIES"));
  }, []);

  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => {
        const trLowerName = c.name.toLocaleLowerCase("tr-TR");
        const trLowerQuery = searchQuery.toLocaleLowerCase("tr-TR");
        const matchesSearch = trLowerName.includes(trLowerQuery);
        
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

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        order: category.order,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        order: categories.length + 1,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

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
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      const updatedCategories = categories.filter((c) => c.id !== id);
      setCategories(updatedCategories);
      storage.set("CATEGORIES", updatedCategories);
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const toggleStatus = (id: string) => {
    const updatedCategories = categories.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive, updatedAt: Date.now() } : c
    );
    setCategories(updatedCategories);
    storage.set("CATEGORIES", updatedCategories);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCategories.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(idx => idx !== id));
    }
  };

  const bulkDelete = () => {
    if (confirm(`${selectedIds.length} kategoriyi silmek istediğinize emin misiniz?`)) {
      const updatedCategories = categories.filter(c => !selectedIds.includes(c.id));
      setCategories(updatedCategories);
      storage.set("CATEGORIES", updatedCategories);
      setSelectedIds([]);
    }
  };

  const bulkToggleStatus = (targetStatus: boolean) => {
    const updatedCategories = categories.map(c => 
      selectedIds.includes(c.id) ? { ...c, isActive: targetStatus, updatedAt: Date.now() } : c
    );
    setCategories(updatedCategories);
    storage.set("CATEGORIES", updatedCategories);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1600px] mx-auto">
      <PageHeader 
        title="Kategori Yönetimi" 
        description="Menü kategorilerinizi düzenleyin, sıralayın ve yönetin."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel - Sticky Form */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 z-10">
          <CategoryForm 
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onCancel={() => {
              setEditingCategory(null);
              setFormData({
                name: "",
                description: "",
                order: categories.length + 1,
                isActive: true,
              });
            }}
            isEditing={!!editingCategory}
          />
        </div>

        {/* Right Panel - List & Filters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl border border-divider/60 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto px-2">
              <SearchInput 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Kategori ara..."
              />
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-50 whitespace-nowrap">
                {filteredCategories.length} KAYIT
              </span>
            </div>
            
            <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
               <TabNav 
                tabs={[
                  { value: "all", label: "Tümü" },
                  { value: "active", label: "Aktif" },
                  { value: "passive", label: "Pasif" }
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>

          {/* Category List */}
          <div className="bg-white rounded-3xl border border-divider/60 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-6">
              <CategoryTable 
                categories={currentItems}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                onToggleStatus={toggleStatus}
              />
            </div>
            
            <div className="border-t border-divider/50 p-4 bg-bg-secondary/10">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>

          {/* Bulk Actions */}
          <BulkActionBar 
            selectedCount={selectedIds.length}
            onClearSelection={() => setSelectedIds([])}
            onToggleStatus={bulkToggleStatus}
            onDelete={bulkDelete}
          />
        </div>
      </div>
    </div>
  );
}
