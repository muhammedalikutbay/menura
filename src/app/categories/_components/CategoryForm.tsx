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
    <div className="space-y-6">
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
</div>

      <div className="flex gap-2 justify-end pt-4 border-t border-divider">
        <Button variant="secondary" onClick={onCancel}>
          İptal
        </Button>
        <Button onClick={onSave} disabled={!formData.name} className="shadow-sm">
          {isEditing ? "Değişiklikleri Kaydet" : "Kategori Oluştur"}
        </Button>
      </div>
    </div>
  );
}
