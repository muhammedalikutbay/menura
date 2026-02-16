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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-divider bg-bg-secondary/10">
            <th className="p-4 w-10">
              <Checkbox 
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th className="p-4 text-caption font-bold text-text-secondary uppercase tracking-widest">Sıra</th>
            <th className="p-4 text-caption font-bold text-text-secondary uppercase tracking-widest">Kategori</th>
            <th className="p-4 text-caption font-bold text-text-secondary uppercase tracking-widest text-center">Durum</th>
            <th className="p-4 text-caption font-bold text-text-secondary uppercase tracking-widest text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-12 text-center text-text-secondary">
                <div className="flex flex-col items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
                    <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/>
                    <path d="M3 10h18"/>
                    <path d="M15 19l2 2 4-4"/>
                  </svg>
                  <p className="text-callout">Sonuç bulunamadı.</p>
                </div>
              </td>
            </tr>
          ) : (
            categories.map((c) => (
              <tr key={c.id} className={cn("group hover:bg-bg-secondary/30 transition-colors", !c.isActive && "bg-bg-secondary/10 text-opacity-40")}>
                <td className="p-4">
                  <Checkbox 
                    checked={selectedIds.includes(c.id)}
                    onChange={(e) => onSelectItem(c.id, e.target.checked)}
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
                    onClick={() => onToggleStatus(c.id)}
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
                    <Button variant="ghost" size="sm" onClick={() => onEdit(c)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/>
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)} className="text-error hover:text-error hover:bg-error-bg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                      </svg>
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
