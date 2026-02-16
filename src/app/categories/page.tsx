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
import { storage } from "@/lib/storage";
import { Category, CreateCategoryInput } from "@/types/category";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "active" | "inactive";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterStatus>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
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
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader 
        title="Kategori Yönetimi" 
        description="Menü kategorilerinizi düzenleyin, sıralayın ve yönetin."
        action={{
          label: "Yeni Kategori",
          onClick: () => handleOpenModal(),
          icon: <span>+</span>
        }}
      />

      <Card className="border-none bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-divider bg-bg-secondary/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Kategori ara..."
          />

          <TabNav 
            tabs={[
              { value: "all", label: "Hepsi" },
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Pasif" }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <CategoryTable 
          categories={filteredCategories}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectItem}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onToggleStatus={toggleStatus}
        />
      </Card>

      <BulkActionBar 
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onToggleStatus={bulkToggleStatus}
        onDelete={bulkDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori"}
        description="Kategori bilgilerini girerek menünüzü düzenleyin."
      >
        <CategoryForm 
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          isEditing={!!editingCategory}
        />
      </Modal>
    </div>
  );
}
