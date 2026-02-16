"use client";

import { CreateCategoryInput } from "@/types/category";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/ImageUpload";

interface CategoryFormProps {
  formData: CreateCategoryInput;
  setFormData: (data: CreateCategoryInput) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function CategoryForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  isEditing,
}: CategoryFormProps) {
  return (
    <div className="bg-white rounded-3xl border border-divider/60 shadow-lg shadow-[#0d7ff2]/5 overflow-hidden sticky top-8">
      <div className="p-5 border-b border-divider/50 bg-bg-secondary/20">
        <h3 className="text-h3 font-black text-text-primary tracking-tight">
          {isEditing ? "Kategoriyi Düzenle" : "Yeni Kategori"}
        </h3>
        <p className="text-caption text-text-secondary font-medium mt-1">
          {isEditing ? "Mevcut kategori detaylarını güncelleyin." : "Menünüze yeni bir kategori ekleyin."}
        </p>
      </div>

      <div className="p-6 space-y-6">
        <ImageUpload 
          value={formData.image}
          onChange={(val) => setFormData({ ...formData, image: val })}
        />

        <div className="space-y-4">
          <FormField label="Kategori Adı" error={!formData.name ? "Ad zorunludur" : ""}>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Başlangıçlar"
            />
          </FormField>
          
          <FormField label="Açıklama">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Liste görünümünde görünecek kısa açıklama..."
              className="resize-none h-24"
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
              <div className="flex items-center h-10 gap-3 px-1">
                <Checkbox 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  id="isAvailable-category"
                  className="w-5 h-5 rounded-md"
                />
                <label htmlFor="isAvailable-category" className="text-xs font-black text-text-primary cursor-pointer select-none uppercase tracking-widest hover:text-action transition-colors">Aktif</label>
              </div>
            </FormField>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button onClick={onSave} disabled={!formData.name} className="w-full h-11 shadow-lg shadow-action/20 text-[13px] tracking-widest font-black uppercase rounded-xl">
            {isEditing ? "Değişiklikleri Kaydet" : "Kategori Oluştur"}
          </Button>
          {isEditing && (
            <Button variant="ghost" onClick={onCancel} className="w-full text-text-secondary hover:text-text-primary h-10 rounded-xl">
              İptal Et
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
