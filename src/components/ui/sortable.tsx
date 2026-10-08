"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";

export type SortableEntry = { id: string; label: string };

type SortableListProps = {
  /** Items in their current order. */
  items: SortableEntry[];
  /** Called with the full new id order after a drop that changed the order. */
  onReorder: (orderedIds: string[]) => void;
  /** Rendered inside a `<ul>`; use `SortableItem` for each row. */
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

const SCREEN_READER_INSTRUCTIONS = {
  draggable:
    "Sırayı değiştirmek için boşluk veya Enter tuşuna basın. Yukarı ve aşağı ok tuşlarıyla taşıyın, " +
    "boşluk veya Enter ile bırakın, Escape ile vazgeçin.",
};

/** Vertical drag-and-drop list with pointer + keyboard support and Turkish screen reader announcements. */
export function SortableList({ items, onReorder, children, className, ...rest }: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const labelOf = (id: string | number) => items.find((item) => item.id === id)?.label ?? "Öğe";
  const positionOf = (id: string | number) => items.findIndex((item) => item.id === id) + 1;
  const total = items.length;

  const announcements: Announcements = {
    onDragStart: ({ active }) => `${labelOf(active.id)} seçildi. Şu an ${positionOf(active.id)} / ${total}. sırada.`,
    onDragOver: ({ active, over }) =>
      over ? `${labelOf(active.id)}, ${positionOf(over.id)} / ${total}. sıranın üzerinde.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${labelOf(active.id)}, ${positionOf(over.id)} / ${total}. sıraya bırakıldı.`
        : `${labelOf(active.id)} bırakıldı, sıra değişmedi.`,
    onDragCancel: ({ active }) => `Taşıma iptal edildi. ${labelOf(active.id)} yerinde kaldı.`,
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const ids = items.map((item) => item.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(ids, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{ announcements, screenReaderInstructions: SCREEN_READER_INSTRUCTIONS }}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ul className={className} {...rest}>
          {children}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

type SortableItemProps = {
  id: string;
  /** Accessible name of the drag handle, e.g. the item name. */
  label: string;
  className?: string;
  /** Receives the drag handle button; place it wherever the row needs it. */
  children: (handle: React.ReactNode) => React.ReactNode;
};

export function SortableItem({ id, label, className, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      aria-label={`${label} sırasını değiştir`}
      className="flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical aria-hidden="true" className="size-5" />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null), transition }}
      className={cn(className, isDragging && "relative z-10 opacity-95 shadow-float")}
    >
      {children(handle)}
    </li>
  );
}
