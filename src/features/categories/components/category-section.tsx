"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImageIcon, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { mediaUrl } from "@/features/media/url";
import { cn } from "@/lib/cn";
import { CATEGORY_NAME_MAX } from "../schema";
import type { CategoryListItem } from "../queries";

export type SectionCategory = Pick<CategoryListItem, "id" | "name" | "description" | "imageMediaId" | "isActive">;

/** Dom id of a category card; the index and `?category=` scroll to it. */
export const categoryDomId = (id: string) => `cat-${id}`;

type CategorySectionProps = {
  category: SectionCategory;
  /** Number of products in the category, regardless of filters. */
  productCount: number;
  /** Ids of the rows rendered in `children`, for the nested sortable context. */
  productIds: string[];
  /** Drag and drop (of the card and its rows) is off while a search or filter is active. */
  dragDisabled: boolean;
  /** Hide the "+ Ürün ekle" row (while filtering). */
  hideAdd: boolean;
  onRename: (name: string) => void;
  onToggleActive: (isActive: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddProduct: () => void;
  /** The product rows (`<li>`), or nothing. */
  children: React.ReactNode;
};

/** A category as a Card: header (drag handle, inline name, switch, menu), rows and the add row. */
export function CategorySection({
  category,
  productCount,
  productIds,
  dragDisabled,
  hideAdd,
  onRename,
  onToggleActive,
  onEdit,
  onDelete,
  onAddProduct,
  children,
}: CategorySectionProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    disabled: dragDisabled,
    data: { type: "category" },
  });

  const thumb = mediaUrl(category.imageMediaId);

  return (
    <section
      ref={setNodeRef}
      id={categoryDomId(category.id)}
      aria-label={category.name}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("scroll-mt-28", isDragging && "relative z-10 opacity-40")}
    >
      <Card className="gap-0 overflow-hidden py-0 sm:py-0">
        <header className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
          <button
            ref={setActivatorNodeRef}
            type="button"
            disabled={dragDisabled}
            aria-label={`${category.name} kategorisinin sırasını değiştir`}
            className="relative flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-fg-subtle after:absolute after:-inset-1 after:content-[''] hover:bg-surface-muted hover:text-fg active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            {...attributes}
            {...listeners}
          >
            <GripVertical aria-hidden="true" className="size-4" />
          </button>

          {thumb && (
            // eslint-disable-next-line @next/next/no-img-element -- media is already resized and immutable
            <img src={thumb} alt="" loading="lazy" className="hidden size-8 shrink-0 rounded-sm object-cover sm:block" />
          )}

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5">
            <InlineName value={category.name} muted={!category.isActive} onCommit={onRename} />
            <span className="type-caption tabular shrink-0 text-fg-muted">{productCount} ürün</span>
            {!category.isActive && <Badge className="shrink-0">Gizli</Badge>}
          </div>

          <label className="type-caption flex shrink-0 cursor-pointer items-center gap-2 text-fg-muted select-none">
            <span className="hidden sm:inline">Menüde</span>
            <Switch
              checked={category.isActive}
              onCheckedChange={onToggleActive}
              aria-label={`${category.name} menüde göster`}
            />
          </label>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`${category.name} işlemleri`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil aria-hidden="true" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={onDelete}>
                <Trash2 aria-hidden="true" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <SortableContext items={productIds} strategy={verticalListSortingStrategy} disabled={dragDisabled}>
          <ul aria-label={`${category.name} ürünleri`} className="m-0 flex list-none flex-col p-0">
            {children}
          </ul>
        </SortableContext>

        {productCount === 0 && !hideAdd && (
          <p className="flex items-center gap-2 border-t border-border px-4 py-4 text-sm text-fg-muted">
            <ImageIcon aria-hidden="true" className="size-4" />
            Bu kategoride henüz ürün yok.
          </p>
        )}

        {!hideAdd && (
          <button
            type="button"
            onClick={onAddProduct}
            className="type-body flex min-h-12 w-full items-center gap-2 border-t border-border px-4 text-left font-medium text-accent-text transition-colors hover:bg-surface-muted/60"
          >
            <Plus aria-hidden="true" className="size-4" />
            Ürün ekle
          </button>
        )}
      </Card>
    </section>
  );
}

/** Category name that becomes an input on click: Enter saves, Esc cancels, blur saves. */
function InlineName({ value, muted, onCommit }: { value: string; muted: boolean; onCommit: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  // Enter/Esc end the edit before the input unmounts and blurs; the flag keeps blur from saving again.
  const doneRef = useRef(false);

  function start() {
    setDraft(value);
    doneRef.current = false;
    setEditing(true);
  }

  function commit() {
    if (doneRef.current) return;
    doneRef.current = true;
    setEditing(false);
    const next = draft.trim();
    if (next && next !== value) onCommit(next);
  }

  function cancel() {
    doneRef.current = true;
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        aria-label="Kategori adı"
        value={draft}
        maxLength={CATEGORY_NAME_MAX}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape") {
            // Keep Esc from reaching a surrounding dialog.
            event.stopPropagation();
            cancel();
          }
        }}
        className="h-9 w-56 max-w-full rounded-sm border border-accent bg-surface px-2 text-[17px] font-semibold tracking-tight outline-none ring-3 ring-accent/25"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      title="Adı değiştirmek için tıklayın"
      className={cn(
        "-mx-1 min-h-9 max-w-full truncate rounded-sm px-1 text-left text-[17px] font-semibold tracking-tight hover:bg-surface-muted",
        muted && "text-fg-muted",
      )}
    >
      {value}
    </button>
  );
}
