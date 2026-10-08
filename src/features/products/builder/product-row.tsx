"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, ImageIcon, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { tagLabel } from "@/lib/menu-attributes";
import { formatMoney } from "@/lib/money";
import type { ProductListItem } from "../queries";

const MAX_VISIBLE_TAGS = 2;

type ProductRowProps = {
  item: ProductListItem;
  currency: string;
  selected: boolean;
  /** True while any row is selected: every checkbox stays visible then. */
  selectionActive: boolean;
  /** Drag and drop is off while a search or filter is active. */
  dragDisabled: boolean;
  onSelect: (checked: boolean) => void;
  onOpen: () => void;
  onToggleAvailability: (isAvailable: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

/** One product row (64px) inside a category card; sortable across categories. */
export function ProductRow(props: ProductRowProps) {
  const { item, dragDisabled } = props;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: dragDisabled,
    data: { type: "product" },
  });

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      disabled={dragDisabled}
      aria-label={`${item.name} sırasını değiştir`}
      className="relative flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-fg-subtle after:absolute after:-inset-1 after:content-[''] hover:bg-surface-muted hover:text-fg active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      {...attributes}
      {...listeners}
    >
      <GripVertical aria-hidden="true" className="size-4" />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("group/row relative list-none", isDragging && "z-10 opacity-40")}
    >
      <ProductRowContent {...props} handle={handle} />
    </li>
  );
}

type ProductRowContentProps = Partial<Omit<ProductRowProps, "item" | "currency">> &
  Pick<ProductRowProps, "item" | "currency"> & {
    handle?: React.ReactNode;
    /** Static copy shown under the pointer while dragging. */
    overlay?: boolean;
  };

/** The visual row, shared by the sortable row and the drag overlay. */
export function ProductRowContent({
  item,
  currency,
  handle,
  overlay = false,
  selected = false,
  selectionActive = false,
  onSelect,
  onOpen,
  onToggleAvailability,
  onDuplicate,
  onDelete,
}: ProductRowContentProps) {
  const src = mediaUrl(item.imageMediaId);
  const hasDiscount = item.discountPriceMinor !== null;
  const visibleTags = item.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTags = item.tags.length - visibleTags.length;

  const price = (
    <>
      <span className="font-medium text-fg">{formatMoney(hasDiscount ? item.discountPriceMinor! : item.priceMinor, currency)}</span>
      {hasDiscount && <s className="ml-1.5 text-sm font-normal text-fg-subtle">{formatMoney(item.priceMinor, currency)}</s>}
    </>
  );

  function handleRowClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!onOpen) return;
    const target = event.target;
    // Clicks on the row's own controls (checkbox, switch, menu, name) are handled by those controls.
    if (target instanceof Element && target.closest("button, a, input, [role='checkbox'], [role='switch'], [role='menu']")) {
      return;
    }
    onOpen();
  }

  return (
    <div
      onClick={handleRowClick}
      className={cn(
        "flex min-h-16 items-center gap-2 border-t border-border px-3 py-2 transition-colors sm:gap-3 sm:px-4",
        onOpen && "cursor-pointer",
        selected ? "bg-accent/[0.07]" : "hover:bg-surface-muted/60",
        overlay && "rounded-lg border bg-surface shadow-float",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center transition-opacity",
          selectionActive || selected
            ? "opacity-100"
            : "opacity-0 group-focus-within/row:opacity-100 group-hover/row:opacity-100 pointer-coarse:opacity-100",
        )}
      >
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect?.(checked === true)}
          aria-label={`${item.name} seç`}
          disabled={overlay}
        />
      </div>
      {handle ?? (
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center text-fg-subtle">
          <GripVertical className="size-4" />
        </span>
      )}
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-muted text-fg-subtle">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- media is already resized and immutable
          <img src={src} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <ImageIcon aria-hidden="true" className="size-5" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <button
          type="button"
          onClick={onOpen}
          disabled={!onOpen}
          className={cn(
            "type-body w-fit max-w-full truncate rounded-sm text-left font-medium hover:underline",
            !item.isAvailable && "text-fg-muted",
          )}
        >
          {item.name}
        </button>
        {item.description && <p className="hidden truncate text-sm text-fg-muted sm:block">{item.description}</p>}
        <p className="tabular text-sm sm:hidden">{price}</p>
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 md:flex">
        {!item.isAvailable && <Badge variant="warning">Tükendi</Badge>}
        {item.isFeatured && (
          <Badge variant="accent">
            <Star aria-hidden="true" className="size-3" />
            Öne çıkan
          </Badge>
        )}
        {visibleTags.map((code) => (
          <Badge key={code}>{tagLabel(code)}</Badge>
        ))}
        {extraTags > 0 && <Badge>+{extraTags}</Badge>}
      </div>

      <p className="tabular type-body hidden w-32 shrink-0 text-right sm:block">{price}</p>

      <Switch
        checked={item.isAvailable}
        onCheckedChange={onToggleAvailability}
        disabled={!onToggleAvailability}
        aria-label={`${item.name} stokta`}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`${item.name} işlemleri`} disabled={overlay}>
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onOpen}>
            <Pencil aria-hidden="true" />
            Düzenle
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDuplicate}>
            <Copy aria-hidden="true" />
            Kopyala
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={onDelete}>
            <Trash2 aria-hidden="true" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
