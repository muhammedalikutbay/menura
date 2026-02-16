"use client";

import { Category } from "@/types/category";
import { CreateProductInput } from "@/types/product";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/ImageUpload";

interface ProductFormProps {
  formData: CreateProductInput;
  setFormData: (data: CreateProductInput) => void;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function ProductForm({
  formData,
  setFormData,
  categories,
  onSave,
  onCancel,
  isEditing,
}: ProductFormProps) {
  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      <ImageUpload 
        value={formData.image}
        onChange={(val) => setFormData({ ...formData, image: val })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Ürün Adı" error={!formData.name ? "Zorunludur" : ""}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Örn: Kebap"
            autoFocus
          />
        </FormField>

        <FormField label="Kategori" error={!formData.categoryId ? "Zorunludur" : ""}>
          <select 
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full bg-white border border-divider rounded-lg px-3 py-2 text-callout shadow-sm outline-none focus:ring-2 focus:ring-action/20"
          >
            <option value="" disabled>Seçiniz...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Açıklama">
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ürün içeriği, malzemeler vb."
          rows={2}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Fiyat (₺)">
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="w-full"
          />
        </FormField>
        
        <FormField label="İndirimli Fiyat (₺)">
          <Input
            type="number"
            value={formData.discountPrice || ""}
            onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full"
          />
        </FormField>

        <FormField label="Kalori (kcal)">
          <Input
            type="number"
            value={formData.calories || ""}
            onChange={(e) => setFormData({ ...formData, calories: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <FormField label="Sıralama">
          <Input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            className="w-full"
          />
        </FormField>

        <div className="flex items-center h-10 gap-2 border border-divider rounded-lg px-3 bg-bg-secondary/10">
          <Checkbox 
            checked={formData.isAvailable}
            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
            id="isAvailable"
          />
          <label htmlFor="isAvailable" className="text-caption font-bold text-text-primary cursor-pointer select-none">SATIŞA SUNULSUN</label>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-divider mt-6">
        <Button variant="secondary" onClick={onCancel}>İptal</Button>
        <Button onClick={onSave} disabled={!formData.name || !formData.categoryId} className="shadow-sm">
          {isEditing ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
        </Button>
      </div>
    </div>
  );
}
