"use client";

import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <h3 className="text-[#1D1D1F] font-bold text-lg">No Categories</h3>
        <p className="text-[#86868B]">No categories found to list.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {categories.map((c) => (
        <div
          key={c.id}
          className="group flex items-center gap-6 py-5 border-b border-[#F5F5F7] last:border-0 hover:bg-[#F5F5F7]/30 transition-colors px-4 -mx-4 rounded-xl"
        >
          {/* Drag Handle */}
          <button className="text-[#E5E7EB] hover:text-[#86868B] cursor-grab active:cursor-grabbing transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </button>

          {/* Image */}
          <div className="w-[60px] h-[60px] rounded-2xl bg-[#F5F5F7] overflow-hidden border border-[#E5E7EB] shrink-0">
            {c.image ? (
              <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#E5E7EB]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">
                {c.name}
              </h3>
              <div className="px-2.5 py-0.5 rounded-full bg-[#F5F5F7] border border-[#E5E7EB]">
                <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wide">
                  0 Menu Items
                </span>
              </div>
            </div>
            <p className="text-[14px] text-[#86868B] font-medium line-clamp-1">
              {c.description || "No description"}
            </p>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[13px] font-bold uppercase tracking-wider transition-colors",
                c.isActive ? "text-[#1D1D1F]" : "text-[#86868B]"
              )}>
                {c.isActive ? "Active" : "Passive"}
              </span>
              <button
                onClick={() => onToggleStatus(c.id)}
                className={cn(
                  "w-12 h-7 rounded-full relative transition-colors duration-300 ease-out",
                  c.isActive ? "bg-[#34C759]" : "bg-[#E5E7EB]"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-out",
                  c.isActive ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            <div className="h-8 w-[1px] bg-[#E5E7EB]" />

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => onEdit(c)}
                className="w-9 h-9 p-0 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                onClick={() => onDelete(c.id)}
                className="w-9 h-9 p-0 rounded-full text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FFF5F5]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
