"use client";

import { CreateCategoryInput } from "@/types/category";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E7EB] transition-all duration-300">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[#1D1D1F]">
        <span className="text-[#0071e3]">
           {isEditing ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
           )}
        </span>
        {isEditing ? "Edit Category" : "New Category"}
      </h2>
      
      <div className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#86868B]" htmlFor="categoryName">
            Name
          </label>
          <input
            className="w-full px-4 py-3 rounded-lg bg-[#F5F5F7] border border-[#E5E7EB] focus:ring-2 focus:ring-[#0071e3] focus:border-transparent outline-none transition-all placeholder-[#86868B]/60 text-sm text-[#1D1D1F]"
            id="categoryName"
            placeholder="e.g. Breakfast Specials"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#86868B]" htmlFor="categoryDesc">
            Description
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-lg bg-[#F5F5F7] border border-[#E5E7EB] focus:ring-2 focus:ring-[#0071e3] focus:border-transparent outline-none transition-all placeholder-[#86868B]/60 text-sm resize-none text-[#1D1D1F]"
            id="categoryDesc"
            placeholder="Brief description visible to customers..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
            Cover Image
          </label>
          <div 
            className="relative w-full h-32 rounded-lg border-2 border-dashed border-[#D1D5DB] hover:border-[#0071e3] transition-colors flex flex-col items-center justify-center cursor-pointer group bg-[#F5F5F7] overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.image ? (
              <>
                 <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Change Image</span>
                 </div>
              </>
            ) : (
                <>
                    <span className="text-[#9CA3AF] group-hover:text-[#0071e3] transition-colors mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    </span>
                    <span className="text-xs text-[#9CA3AF] group-hover:text-[#0071e3] transition-colors">
                        Drop or click to upload
                    </span>
                </>
            )}
            <input 
                ref={fileInputRef}
                className="hidden" 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-[#1D1D1F]">Visible on Menu</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={onSave}
              disabled={!formData.name}
              className="w-full h-12 rounded-full font-medium shadow-lg shadow-blue-500/30 !bg-[#0071e3] !hover:bg-[#0077ED] text-white"
            >
               {isEditing ? "Update Category" : "Create Category"}
            </Button>
            
            {isEditing && (
                <Button
                  variant="secondary"
                  onClick={onCancel}
                  className="w-full h-12 rounded-full font-medium bg-white border border-[#E5E7EB] hover:bg-[#F5F5F7] text-[#86868B]"
                >
                   Cancel Edit
                </Button>
            )}
        </div>
      </div>
    </div>
  );
}
