"use client";

import { Category } from "@/types/category";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryTableProps {
  categories: Category[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function CategoryTable({
  categories,
  selectedIds,
  onSelectAll,
  onSelectItem,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryTableProps) {
  const isAllSelected = categories.length > 0 && selectedIds.length === categories.length;

  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed border-divider rounded-3xl bg-white/50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center text-text-secondary/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="M15 19l2 2 4-4"/>
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-callout font-black text-text-primary uppercase tracking-widest">Kategori Bulunamadı</h3>
              <p className="text-caption text-text-secondary font-medium">Henüz bir kategori oluşturmadınız.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {categories.map((c) => (
            <div 
              key={c.id} 
              className={cn(
                "group relative bg-white border border-divider/60 rounded-3xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-[#0d7ff2]/10 hover:-translate-y-1 flex flex-col sm:flex-row sm:items-center gap-5",
                !c.isActive && "bg-bg-secondary/20 border-divider/50 shadow-none grayscale-[0.5]"
              )}
            >
              {/* Checkbox for Bulk Actions */}
              <div className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0">
                <Checkbox 
                  checked={selectedIds.includes(c.id)}
                  onChange={(e) => onSelectItem(c.id, e.target.checked)}
                  className="w-5 h-5"
                />
              </div>

              {/* Image / Icon Section */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-bg-secondary border border-divider flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary opacity-30">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                )}
              </div>

              {/* Title and Info */}
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-body font-black text-text-primary uppercase tracking-tight truncate leading-none">
                    {c.name}
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-text-secondary bg-bg-secondary px-2 py-0.5 rounded-full border border-divider/50 shadow-sm leading-none shrink-0">
                    SIRA: {String(c.order).padStart(2, "0")}
                  </span>
                </div>
                {c.description && (
                  <p className="text-caption text-text-secondary font-medium line-clamp-2 leading-relaxed max-w-2xl">
                    {c.description}
                  </p>
                )}
              </div>

              {/* Actions and Status */}
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-divider/30">
                {/* Status Toggle */}
                <button 
                  onClick={() => onToggleStatus(c.id)}
                  className={cn(
                    "inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all shadow-sm",
                    c.isActive 
                      ? "bg-success/5 text-success border border-success/10 hover:bg-success hover:text-white" 
                      : "bg-text-secondary/5 text-text-secondary border border-text-secondary/10 hover:bg-text-secondary hover:text-white"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", c.isActive ? "bg-success group-hover:bg-white animate-pulse" : "bg-text-secondary group-hover:bg-white")} />
                  {c.isActive ? "Aktif" : "Pasif"}
                </button>

                {/* Edit / Delete Actions */}
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(c)} className="w-10 h-10 rounded-xl hover:bg-action/10 hover:text-action">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)} className="w-10 h-10 rounded-xl text-error hover:bg-error/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
