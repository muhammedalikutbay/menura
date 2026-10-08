"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { SortableList } from "@/components/ui/sortable";
import { cn } from "@/lib/cn";

export type IndexEntry = { id: string; name: string; count: number; isActive: boolean };

type IndexProps = {
  entries: IndexEntry[];
  /** Category whose card is currently in view. */
  activeId: string | null;
  /** Reordering is off while a search or filter hides rows. */
  dragDisabled: boolean;
  addDisabled: boolean;
  onJump: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onAdd: () => void;
  className?: string;
};

/** Sticky category list (>= 1024px): counts, click scrolls to the card, drag reorders categories. */
export function CategoryIndex({
  entries,
  activeId,
  dragDisabled,
  addDisabled,
  onJump,
  onReorder,
  onAdd,
  className,
}: IndexProps) {
  const rows = entries.map((entry) =>
    dragDisabled ? (
      <li key={entry.id}>
        <IndexRow entry={entry} active={entry.id === activeId} onJump={onJump} />
      </li>
    ) : (
      <SortableIndexRow key={entry.id} entry={entry} active={entry.id === activeId} onJump={onJump} />
    ),
  );

  return (
    <nav aria-label="Kategori dizini" className={cn("rounded-lg bg-surface p-2 shadow-hairline", className)}>
      <p className="type-overline px-2.5 pt-1.5 pb-1 text-fg-muted">Kategoriler</p>
      {dragDisabled ? (
        <ul className="flex flex-col gap-0.5">{rows}</ul>
      ) : (
        <SortableList
          aria-label="Kategori sırası"
          className="flex flex-col gap-0.5"
          items={entries.map((entry) => ({ id: entry.id, label: entry.name }))}
          onReorder={onReorder}
        >
          {rows}
        </SortableList>
      )}
      <button
        type="button"
        onClick={onAdd}
        disabled={addDisabled}
        className="type-body mt-1 flex min-h-10 w-full items-center gap-2 rounded-sm px-2.5 text-left font-medium text-accent-text transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <Plus aria-hidden="true" className="size-4" />
        Kategori ekle
      </button>
    </nav>
  );
}

function SortableIndexRow(props: { entry: IndexEntry; active: boolean; onJump: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: props.entry.id,
  });
  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      aria-label={`${props.entry.name} sırasını değiştir`}
      className="relative flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-fg-subtle opacity-0 transition-opacity group-focus-within/idx:opacity-100 group-hover/idx:opacity-100 pointer-coarse:opacity-100 after:absolute after:-inset-1 after:content-[''] hover:text-fg active:cursor-grabbing"
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
      className={cn(isDragging && "relative z-10 rounded-sm bg-surface shadow-float")}
    >
      <IndexRow {...props} handle={handle} />
    </li>
  );
}

function IndexRow({
  entry,
  active,
  onJump,
  handle,
}: {
  entry: IndexEntry;
  active: boolean;
  onJump: (id: string) => void;
  handle?: React.ReactNode;
}) {
  return (
    <div className={cn("group/idx flex items-center rounded-sm", active && "bg-surface-muted")}>
      {handle ?? <span aria-hidden="true" className="size-6 shrink-0" />}
      <button
        type="button"
        onClick={() => onJump(entry.id)}
        aria-current={active ? "location" : undefined}
        className={cn(
          "type-body flex min-h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-sm py-1.5 pr-2.5 pl-1 text-left",
          active ? "font-medium text-fg" : "text-fg-muted hover:text-fg",
          !entry.isActive && "opacity-70",
        )}
      >
        <span className="truncate">{entry.name}</span>
        <span className="tabular shrink-0 text-sm text-fg-subtle">{entry.count}</span>
      </button>
    </div>
  );
}

type ChipsProps = Pick<IndexProps, "entries" | "activeId" | "onJump" | "onAdd" | "addDisabled" | "className">;

/** Horizontal chip scroller used below 1024px instead of the index. */
export function CategoryChips({ entries, activeId, onJump, onAdd, addDisabled, className }: ChipsProps) {
  return (
    <nav aria-label="Kategori dizini" className={cn("-mx-4 px-4 sm:-mx-6 sm:px-6", className)}>
      <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {entries.map((entry) => {
          const active = entry.id === activeId;
          return (
            <li key={entry.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onJump(entry.id)}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "type-caption inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 ring-1 ring-inset transition-colors",
                  active ? "bg-ink text-ink-fg ring-ink" : "bg-surface text-fg ring-border-strong hover:bg-surface-muted",
                )}
              >
                {entry.name}
                <span className={cn("tabular", active ? "text-ink-fg/70" : "text-fg-subtle")}>{entry.count}</span>
              </button>
            </li>
          );
        })}
        <li className="shrink-0">
          <button
            type="button"
            onClick={onAdd}
            disabled={addDisabled}
            className="type-caption inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-accent-text ring-1 ring-inset ring-border-strong hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus aria-hidden="true" className="size-4" />
            Kategori
          </button>
        </li>
      </ul>
    </nav>
  );
}
