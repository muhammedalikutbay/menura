"use client";

import { FolderInput, Trash2, X } from "lucide-react";

type BulkBarProps = {
  count: number;
  onAvailable: () => void;
  onUnavailable: () => void;
  onMove: () => void;
  onDelete: () => void;
  onClear: () => void;
};

const pill =
  "type-caption inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink-fg/12 px-3.5 text-ink-fg transition-colors hover:bg-ink-fg/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-fg";

/** Floating pill at the bottom center with the actions for the selected rows. */
export function BulkBar({ count, onAvailable, onUnavailable, onMove, onDelete, onClear }: BulkBarProps) {
  if (count === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-3">
      <div
        role="region"
        aria-label="Toplu işlemler"
        className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full bg-ink py-1.5 pr-1.5 pl-4 text-ink-fg shadow-float"
      >
        <p aria-live="polite" className="type-caption tabular shrink-0 whitespace-nowrap">
          {count} seçili
        </p>
        <div className="no-scrollbar flex min-w-0 items-center gap-1.5 overflow-x-auto">
          <button type="button" onClick={onAvailable} className={pill}>
            Stokta yap
          </button>
          <button type="button" onClick={onUnavailable} className={pill}>
            Tükendi
          </button>
          <button type="button" onClick={onMove} className={pill}>
            <FolderInput aria-hidden="true" className="size-4" />
            Taşı
          </button>
          <button type="button" onClick={onDelete} className={pill}>
            <Trash2 aria-hidden="true" className="size-4" />
            Sil
          </button>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Seçimi kaldır"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-fg/80 hover:bg-ink-fg/12 hover:text-ink-fg"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
