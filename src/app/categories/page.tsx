"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 font-bold text-text-primary tracking-tight">Kategori Yönetimi</h1>
          <p className="text-body-muted">Menü kategorilerinizi düzenleyin, sıralayın ve yönetin.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="shadow-sm">
          + Yeni Kategori
        </Button>
      </div>

      <Card className="border-none bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-divider bg-bg-secondary/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white border border-divider rounded-lg px-3 py-1.5 w-full md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-action/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              className="bg-transparent border-none outline-none text-callout w-full placeholder:text-text-secondary/50" 
              placeholder="Kategori ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Apple Professional TabNav Styling */}
          <div className="flex items-center p-1 bg-white border border-divider rounded-full shadow-sm relative min-w-[240px]">
            <div 
              className={cn(
                "absolute h-[calc(100%-8px)] rounded-full bg-action transition-all duration-300 ease-out z-0",
                activeTab === "all" ? "left-1 w-[32%]" : 
                activeTab === "active" ? "left-[34%] w-[32%]" : 
                "left-[67%] w-[32%]"
              )}
            />
            {(["all", "active", "inactive"] as FilterStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-1.5 text-caption font-semibold rounded-full transition-all relative z-10 capitalize",
                  activeTab === tab 
                    ? "text-white" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {tab === "all" ? "Hepsi" : tab === "active" ? "Aktif" : "Pasif"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-bg-secondary/10">
                <th className="p-4 w-10">
                  <Checkbox 
                    checked={filteredCategories.length > 0 && selectedIds.length === filteredCategories.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="p-4 text-caption font-bold text-text-secondary uppercase tracking-widest">Sıra</th>
                <th className="p-4 text-caption font-bold text-text-secondary uppercase tracking-widest">Kategori</th>
                <th className="p-4 text-caption font-bold text-text-secondary uppercase tracking-widest text-center">Durum</th>
                <th className="p-4 text-caption font-bold text-text-secondary uppercase tracking-widest text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="M15 19l2 2 4-4"/></svg>
                       <p className="text-callout">Sonuç bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c.id} className={cn("group hover:bg-bg-secondary/30 transition-colors", !c.isActive && "bg-bg-secondary/10 text-opacity-40")}>
                    <td className="p-4">
                      <Checkbox 
                        checked={selectedIds.includes(c.id)}
                        onChange={(e) => handleSelectItem(c.id, e.target.checked)}
                      />
                    </td>
                    <td className="p-4">
                      <span className="text-callout font-mono font-medium text-text-secondary">
                        {String(c.order).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-body font-semibold text-text-primary">{c.name}</span>
                        {c.description && <span className="text-caption text-text-secondary line-clamp-1">{c.description}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                         onClick={() => toggleStatus(c.id)}
                         className={cn(
                           "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all",
                           c.isActive 
                             ? "bg-success/10 text-success border border-success/20" 
                             : "bg-text-secondary/10 text-text-secondary border border-text-secondary/20"
                         )}
                      >
                         <div className={cn("w-1.5 h-1.5 rounded-full", c.isActive ? "bg-success animate-pulse" : "bg-text-secondary")} />
                         {c.isActive ? "YAYINDA" : "PASİF"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(c)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-error hover:text-error hover:bg-error-bg">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-text-primary text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-300 z-50">
          <span className="text-callout font-semibold">{selectedIds.length} öğe seçildi</span>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => bulkToggleStatus(true)} className="text-white hover:bg-white/10 px-4 h-9">Aktifleştir</Button>
            <Button variant="ghost" size="sm" onClick={() => bulkToggleStatus(false)} className="text-white hover:bg-white/10 px-4 h-9">Pasifleştir</Button>
            <Button variant="ghost" size="sm" onClick={bulkDelete} className="text-error hover:bg-error-bg px-4 h-9">Toplu Sil</Button>
          </div>
          <button onClick={() => setSelectedIds([])} className="p-1 hover:bg-white/10 rounded-full transition-colors ml-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori"}
        description="Kategori bilgilerini girerek menünüzü düzenleyin."
      >
        <div className="space-y-4">
          <FormField label="Kategori Adı" error={!formData.name ? "Ad zorunludur" : ""}>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Başlangıçlar"
              autoFocus
            />
          </FormField>
          
          <FormField label="Açıklama (Opsiyonel)">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kategori hakkında kısa bir bilgi..."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sıralama">
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </FormField>
            <FormField label="Durum">
              <div className="flex items-center h-10 gap-2">
                <Checkbox 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-callout font-medium text-text-primary">Yayında</span>
              </div>
            </FormField>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={!formData.name} className="shadow-sm">
              {editingCategory ? "Değişiklikleri Kaydet" : "Kategori Oluştur"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
