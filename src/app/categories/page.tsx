"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { storage } from "@/lib/storage";
import { Category, CreateCategoryInput } from "@/types/category";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: "",
    description: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    setCategories(storage.get<Category>("CATEGORIES"));
  }, []);

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
    }
  };

  const toggleStatus = (id: string) => {
    const updatedCategories = categories.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive, updatedAt: Date.now() } : c
    );
    setCategories(updatedCategories);
    storage.set("CATEGORIES", updatedCategories);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h2 font-bold text-text-primary">Kategoriler</h1>
          <p className="text-callout text-text-secondary">Menü kategorilerinizi buradan yönetebilirsiniz.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>Yeni Kategori</Button>
      </div>

      <div className="grid gap-4">
        {categories.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-40 text-text-secondary">
              <p>Henüz bir kategori eklenmemiş.</p>
              <Button variant="ghost" className="mt-2" onClick={() => handleOpenModal()}>
                İlk kategorinizi oluşturun
              </Button>
            </CardContent>
          </Card>
        ) : (
          categories
            .sort((a, b) => a.order - b.order)
            .map((category) => (
              <Card key={category.id} className={!category.isActive ? "opacity-60" : ""}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-md bg-bg-secondary text-text-secondary font-medium">
                      {category.order}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-headline font-semibold">{category.name}</h3>
                        {!category.isActive && (
                          <Badge variant="secondary">Pasif</Badge>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-caption text-text-secondary">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(category.id)}
                    >
                      {category.isActive ? "Pasifleştir" : "Aktifleştir"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenModal(category)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error"
                      onClick={() => handleDelete(category.id)}
                    >
                      Sil
                    </Button>
                  </div>
                </div>
              </Card>
            ))
        )}
      </div>

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
            />
          </FormField>
          
          <FormField label="Açıklama (Opsiyonel)">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kategori hakkında kısa bir bilgi..."
            />
          </FormField>

          <FormField label="Sıralama">
            <Input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </FormField>

          <Divider />

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {editingCategory ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
