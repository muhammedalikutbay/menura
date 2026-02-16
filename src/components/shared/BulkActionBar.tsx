"use client";

import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onToggleStatus: (status: boolean) => void;
  onDelete: () => void;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onToggleStatus,
  onDelete,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-text-primary text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-300 z-50">
      <span className="text-callout font-semibold">{selectedCount} öğe seçildi</span>
      <div className="h-4 w-px bg-white/20" />
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => onToggleStatus(true)} className="text-white hover:bg-white/10 px-4 h-9">Aktifleştir</Button>
        <Button variant="ghost" size="sm" onClick={() => onToggleStatus(false)} className="text-white hover:bg-white/10 px-4 h-9">Pasifleştir</Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-error hover:bg-error-bg px-4 h-9">Toplu Sil</Button>
      </div>
      <button onClick={onClearSelection} className="p-1 hover:bg-white/10 rounded-full transition-colors ml-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  );
}
