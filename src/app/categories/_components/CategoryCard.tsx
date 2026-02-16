"use client";

import { Category } from "@/types/category";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-[#E5E7EB] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden bg-[#F5F5F7]">
        {category.image ? (
          <img 
            src={category.image} 
            alt={category.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#86868B]">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium">
          0 items
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-[#1D1D1F] group-hover:text-[#0071e3] transition-colors">
            {category.name}
          </h3>
          <button className="text-[#86868B] hover:text-[#1D1D1F]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>
        
        <p className="text-sm text-[#86868B] line-clamp-2 mb-4 min-h-[40px]">
          {category.description || "No description provided."}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-[#F5F5F7]">
          {category.isActive ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Active
            </span>
          ) : (
             <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Draft
            </span>
          )}
          
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(category)}
              className="p-1.5 hover:bg-[#F5F5F7] rounded-md transition-colors text-[#86868B] hover:text-[#1D1D1F]"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
            <button 
              onClick={() => onDelete(category.id)}
              className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-[#86868B] hover:text-red-500"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
