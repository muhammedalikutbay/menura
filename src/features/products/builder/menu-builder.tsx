"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, Plus, Search, SearchX } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  deleteCategory,
  reorderCategories,
  setCategoryActive,
  updateCategory,
} from "@/features/categories/actions";
import { CategoryChips, CategoryIndex } from "@/features/categories/components/category-index";
import { CategoryEditorSheet, type EditableCategory } from "@/features/categories/components/category-editor-sheet";
import { categoryDomId, CategorySection } from "@/features/categories/components/category-section";
import { FirstCategoryCard } from "@/features/categories/components/first-category-card";
import type { CategoryListItem } from "@/features/categories/queries";
import { MAX_CATEGORIES } from "@/features/categories/schema";
import {
  deleteProduct,
  deleteProducts,
  duplicateProduct,
  moveProducts,
  moveProductToCategory,
  reorderProducts,
  setProductAvailability,
  setProductsAvailability,
} from "../actions";
import { emptyProductValues, valuesFromProduct } from "../components/product-form";
import { ProductEditorSheet } from "../components/product-editor-sheet";
import type { ProductListItem } from "../queries";
import { BulkBar } from "./bulk-bar";
import {
  buildModel,
  categoryProducts,
  containerOf,
  FILTER_LABELS,
  findProduct,
  isFiltering,
  moveProduct,
  moveProductsToEnd,
  patchCategory,
  patchProducts,
  removeCategory,
  removeProducts,
  upsertProduct,
  visibleSections,
  withCategoryOrder,
  type BuilderCategory,
  type BuilderFilter,
  type BuilderModel,
} from "./builder-model";
import { MoveDialog } from "./move-dialog";
import { ProductRow, ProductRowContent } from "./product-row";

type MenuBuilderProps = {
  categories: CategoryListItem[];
  products: ProductListItem[];
  /** ISO currency code of the restaurant. */
  currency: string;
};

type ProductTarget = { kind: "edit"; id: string } | { kind: "new"; categoryId: string };
type CategoryTarget = { kind: "create" } | { kind: "edit"; id: string };

const productTargetKey = (target: ProductTarget) => (target.kind === "edit" ? `edit:${target.id}` : `new:${target.categoryId}`);
const categoryTargetKey = (target: CategoryTarget) => (target.kind === "edit" ? `edit:${target.id}` : "create");

const SCREEN_READER_INSTRUCTIONS = {
  draggable:
    "Sırayı değiştirmek için boşluk veya Enter tuşuna basın. Ok tuşlarıyla taşıyın, boşluk veya Enter ile bırakın, " +
    "Escape ile vazgeçin.",
};

/**
 * Keeps the last non-null target around after it is cleared, so a sheet can play its exit
 * animation with its content, and bumps `nonce` for every opening so the form restarts fresh.
 */
function useHeldTarget<T>(target: T | null, keyOf: (target: T) => string) {
  const key = target ? keyOf(target) : null;
  const [held, setHeld] = useState<{ key: string | null; target: T | null; nonce: number }>({
    key: null,
    target: null,
    nonce: 0,
  });
  if (key !== held.key) {
    setHeld({ key, target: target ?? held.target, nonce: held.nonce + (key ? 1 : 0) });
  }
  return { target: held.target, nonce: held.nonce, open: key !== null };
}

export function MenuBuilder({ categories, products, currency }: MenuBuilderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local copy so toggles, drops and deletes feel instant; replaced whenever the server data changes.
  const [serverData, setServerData] = useState({ categories, products });
  const [model, setModel] = useState(() => buildModel(categories, products));
  if (serverData.categories !== categories || serverData.products !== products) {
    setServerData({ categories, products });
    setModel(buildModel(categories, products));
  }

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BuilderFilter>("all");
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; label: string } | null>(null);
  const [pendingCategoryDelete, setPendingCategoryDelete] = useState<BuilderCategory | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [categoryTarget, setCategoryTarget] = useState<CategoryTarget | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ type: "product" | "category"; id: string } | null>(null);
  const [, startTransition] = useTransition();

  const dragStartModel = useRef<BuilderModel | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);

  const filtering = isFiltering(query, filter);
  const dragDisabled = filtering;
  const sections = visibleSections(model, query, filter);
  const visibleProductIds = new Set(sections.flatMap((section) => section.products.map((row) => row.id)));
  const selectedIds = [...selected].filter((id) => visibleProductIds.has(id));
  const categoryOptions = model.categories.map((item) => ({ id: item.id, name: item.name, isActive: item.isActive }));
  const atCategoryLimit = model.categories.length >= MAX_CATEGORIES;

  // ---- URL state: ?product=<id>, ?new=product&category=<id>, ?category=<id> -------------------

  const productParam = searchParams.get("product");
  const newParam = searchParams.get("new") === "product";
  const categoryParam = searchParams.get("category");
  const knownCategory = categoryParam && model.categories.some((item) => item.id === categoryParam) ? categoryParam : null;

  let productTarget: ProductTarget | null = null;
  if (productParam && findProduct(model, productParam)) {
    productTarget = { kind: "edit", id: productParam };
  } else if (newParam && model.categories.length > 0) {
    productTarget = {
      kind: "new",
      categoryId: knownCategory ?? (model.categories.length === 1 ? model.categories[0]!.id : ""),
    };
  }
  const productSheetOpen = productTarget !== null;

  // True when this page pushed the history entry that holds the open sheet, so closing can go back.
  const pushedRef = useRef(false);
  useEffect(() => {
    if (!productSheetOpen) pushedRef.current = false;
  }, [productSheetOpen]);

  function pushUrl(search: string) {
    window.history.pushState(null, "", `${pathname}${search}`);
    pushedRef.current = true;
  }

  function openProduct(id: string) {
    pushUrl(`?product=${encodeURIComponent(id)}`);
  }

  function openNewProduct(categoryId: string) {
    pushUrl(`?new=product&category=${encodeURIComponent(categoryId)}`);
  }

  function closeProductSheet() {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", pathname);
    }
  }

  // A link to a product that no longer exists: say so and clean the URL.
  useEffect(() => {
    if (productParam && !findProduct(model, productParam)) {
      toast.error("Ürün bulunamadı.");
      window.history.replaceState(null, "", pathname);
    }
  }, [productParam, model, pathname]);

  // ?category=<id> scrolls to that category once.
  const scrolledToParam = useRef(false);
  useEffect(() => {
    if (scrolledToParam.current || !knownCategory || productParam || newParam) return;
    scrolledToParam.current = true;
    requestAnimationFrame(() => document.getElementById(categoryDomId(knownCategory))?.scrollIntoView({ block: "start" }));
  }, [knownCategory, productParam, newParam]);

  // Highlight the category card that is in view.
  const sectionIdsKey = sections.map((section) => section.category.id).join(",");
  useEffect(() => {
    const ids = sectionIdsKey ? sectionIdsKey.split(",") : [];
    let frame = 0;
    function update() {
      frame = 0;
      let current = ids[0] ?? null;
      for (const id of ids) {
        const element = document.getElementById(categoryDomId(id));
        if (element && element.getBoundingClientRect().top <= 150) current = id;
      }
      setActiveCategoryId(current);
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sectionIdsKey]);

  function jumpToCategory(id: string) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(categoryDomId(id))?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    setActiveCategoryId(id);
  }

  // ---- Sheets ---------------------------------------------------------------------------------

  const productSheet = useHeldTarget(productTarget, productTargetKey);
  const categorySheet = useHeldTarget(categoryTarget, categoryTargetKey);

  const heldProduct = productSheet.target;
  const heldProductItem = heldProduct?.kind === "edit" ? findProduct(model, heldProduct.id) : undefined;
  const heldCategory = categorySheet.target;
  const heldCategoryItem =
    heldCategory?.kind === "edit" ? model.categories.find((item) => item.id === heldCategory.id) : undefined;

  function handleProductSaved(item: ProductListItem) {
    setModel((current) => upsertProduct(current, item));
  }

  function handleCategorySaved(saved: EditableCategory) {
    setModel((current) =>
      current.categories.some((item) => item.id === saved.id)
        ? patchCategory(current, saved.id, saved)
        : { categories: [...current.categories, saved], products: { ...current.products, [saved.id]: [] } },
    );
  }

  // ---- Product actions ------------------------------------------------------------------------

  function toggleSelected(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleToggleAvailability(item: ProductListItem, isAvailable: boolean) {
    const ids = new Set([item.id]);
    setModel((current) => patchProducts(current, ids, { isAvailable }));
    startTransition(async () => {
      const result = await setProductAvailability(item.id, isAvailable);
      if (!result.ok) {
        setModel((current) => patchProducts(current, ids, { isAvailable: !isAvailable }));
        toast.error(result.error);
      }
    });
  }

  function handleBulkAvailability(isAvailable: boolean) {
    const ids = selectedIds;
    const changed = new Set(ids.filter((id) => findProduct(model, id)?.isAvailable !== isAvailable));
    setModel((current) => patchProducts(current, new Set(ids), { isAvailable }));
    startTransition(async () => {
      const result = await setProductsAvailability(ids, isAvailable);
      if (result.ok) {
        toast.success(`${result.data.updated} ürün ${isAvailable ? "stokta" : "tükendi olarak"} işaretlendi.`);
        setSelected(new Set());
      } else {
        setModel((current) => patchProducts(current, changed, { isAvailable: !isAvailable }));
        toast.error(result.error);
      }
    });
  }

  async function handleMove(targetCategoryId: string) {
    const ids = selectedIds;
    const result = await moveProducts(ids, targetCategoryId);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    setModel((current) => moveProductsToEnd(current, new Set(ids), targetCategoryId));
    setSelected(new Set());
    const name = model.categories.find((item) => item.id === targetCategoryId)?.name ?? "kategori";
    toast.success(`${result.data.moved} ürün “${name}” kategorisine taşındı.`);
  }

  async function handleDelete(target: { ids: string[] }) {
    const result = target.ids.length === 1 ? await deleteProduct(target.ids[0]!) : await deleteProducts(target.ids);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    const removed = new Set(target.ids);
    setModel((current) => removeProducts(current, removed));
    setSelected((current) => new Set([...current].filter((id) => !removed.has(id))));
    toast.success(target.ids.length === 1 ? "Ürün silindi." : `${target.ids.length} ürün silindi.`);
  }

  function handleDuplicate(item: ProductListItem) {
    startTransition(async () => {
      const result = await duplicateProduct(item.id);
      if (result.ok) toast.success(`“${item.name}” kopyalandı.`);
      else toast.error(result.error);
    });
  }

  // ---- Category actions -----------------------------------------------------------------------

  function handleRename(category: BuilderCategory, name: string) {
    const previous = category.name;
    setModel((current) => patchCategory(current, category.id, { name }));
    startTransition(async () => {
      const result = await updateCategory(category.id, {
        name,
        description: category.description,
        imageMediaId: category.imageMediaId,
        isActive: category.isActive,
      });
      if (!result.ok) {
        setModel((current) => patchCategory(current, category.id, { name: previous }));
        toast.error(result.fieldErrors?.name?.[0] ?? result.error);
      }
    });
  }

  function handleToggleCategory(category: BuilderCategory, isActive: boolean) {
    setModel((current) => patchCategory(current, category.id, { isActive }));
    startTransition(async () => {
      const result = await setCategoryActive(category.id, isActive);
      if (!result.ok) {
        setModel((current) => patchCategory(current, category.id, { isActive: !isActive }));
        toast.error(result.error);
      }
    });
  }

  async function handleDeleteCategory(category: BuilderCategory) {
    const result = await deleteCategory(category.id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    setModel((current) => removeCategory(current, category.id));
    toast.success(
      result.data.deletedProducts > 0
        ? `“${category.name}” ve ${result.data.deletedProducts} ürün silindi.`
        : `“${category.name}” silindi.`,
    );
  }

  function persistCategoryOrder(orderedIds: string[], revertTo: BuilderModel) {
    startTransition(async () => {
      const result = await reorderCategories(orderedIds);
      if (!result.ok) {
        setModel(revertTo);
        toast.error(result.error);
      }
    });
  }

  function handleIndexReorder(orderedIds: string[]) {
    const previous = model;
    setModel(withCategoryOrder(model, orderedIds));
    persistCategoryOrder(orderedIds, previous);
  }

  // ---- Drag and drop --------------------------------------------------------------------------

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** Categories only collide with categories; rows prefer the row under the pointer, then the card. */
  const collisionDetection: CollisionDetection = (args) => {
    if (args.active.data.current?.type === "category") {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter((container) => container.data.current?.type === "category"),
      });
    }

    const pointerHits = pointerWithin(args);
    const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args);
    let overId = getFirstCollision(hits, "id");
    if (overId != null) {
      const overContainer = args.droppableContainers.find((container) => container.id === overId);
      if (overContainer?.data.current?.type === "category") {
        const rows = categoryProducts(model, String(overId));
        if (rows.length > 0) {
          // Over the card itself: pick the closest row inside it.
          overId =
            closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => container.id !== overId && rows.some((row) => row.id === container.id),
              ),
            })[0]?.id ?? overId;
        }
      }
      lastOverId.current = overId;
      return [{ id: overId }];
    }
    return lastOverId.current != null ? [{ id: lastOverId.current }] : [];
  };

  function nameOf(id: UniqueIdentifier): string {
    const key = String(id);
    return findProduct(model, key)?.name ?? model.categories.find((item) => item.id === key)?.name ?? "Öğe";
  }

  function placeOf(id: UniqueIdentifier): string {
    const key = String(id);
    const categoryId = containerOf(model, key);
    if (categoryId) {
      const rows = categoryProducts(model, categoryId);
      const category = model.categories.find((item) => item.id === categoryId)?.name ?? "kategori";
      return `“${category}” kategorisinde ${rows.findIndex((row) => row.id === key) + 1} / ${rows.length}. sırada`;
    }
    const index = model.categories.findIndex((item) => item.id === key);
    return `${index + 1} / ${model.categories.length}. sırada`;
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `${nameOf(active.id)} seçildi. Şu an ${placeOf(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${nameOf(active.id)}, ${nameOf(over.id)} üzerinde.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `${nameOf(active.id)} bırakıldı. Şu an ${placeOf(active.id)}.` : `${nameOf(active.id)} bırakıldı, sıra değişmedi.`,
    onDragCancel: ({ active }) => `Taşıma iptal edildi. ${nameOf(active.id)} yerinde kaldı.`,
  };

  function handleDragStart({ active }: DragStartEvent) {
    const type = active.data.current?.type === "category" ? "category" : "product";
    dragStartModel.current = model;
    lastOverId.current = null;
    setDrag({ type, id: String(active.id) });
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || active.data.current?.type !== "product") return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const from = containerOf(model, activeId);
    const overIsCategory = over.data.current?.type === "category";
    const to = overIsCategory ? overId : containerOf(model, overId);
    if (!from || !to || from === to) return;

    let index: number;
    if (overIsCategory) {
      index = categoryProducts(model, to).length;
    } else {
      const overIndex = categoryProducts(model, to).findIndex((row) => row.id === overId);
      const translated = active.rect.current.translated;
      const isBelow = translated ? translated.top > over.rect.top + over.rect.height / 2 : false;
      index = overIndex + (isBelow ? 1 : 0);
    }
    // Live: the row jumps into the other card while it is dragged.
    setModel(moveProduct(model, activeId, to, index));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const startModel = dragStartModel.current;
    dragStartModel.current = null;
    lastOverId.current = null;
    setDrag(null);
    if (!startModel) return;

    if (active.data.current?.type === "category") {
      if (!over || active.id === over.id) return;
      // The keyboard sensor may report a row inside the target card; use that row's category.
      const overCategoryId = over.data.current?.type === "category" ? String(over.id) : containerOf(model, String(over.id));
      const ids = model.categories.map((item) => item.id);
      const from = ids.indexOf(String(active.id));
      const to = overCategoryId ? ids.indexOf(overCategoryId) : -1;
      if (from < 0 || to < 0) return;
      const ordered = arrayMove(ids, from, to);
      setModel(withCategoryOrder(model, ordered));
      persistCategoryOrder(ordered, startModel);
      return;
    }

    const activeId = String(active.id);
    let next = model;
    const current = containerOf(next, activeId);
    if (over && current && over.data.current?.type === "product" && over.id !== active.id) {
      const rows = categoryProducts(next, current);
      const from = rows.findIndex((row) => row.id === activeId);
      const to = rows.findIndex((row) => row.id === String(over.id));
      if (from >= 0 && to >= 0 && from !== to) next = moveProduct(next, activeId, current, to);
    }
    setModel(next);

    const origin = containerOf(startModel, activeId);
    const target = containerOf(next, activeId);
    if (!origin || !target) return;
    const finalIds = categoryProducts(next, target).map((row) => row.id);

    if (origin === target) {
      const before = categoryProducts(startModel, origin).map((row) => row.id);
      if (before.join() === finalIds.join()) return;
      startTransition(async () => {
        const result = await reorderProducts(target, finalIds);
        if (!result.ok) {
          setModel(startModel);
          toast.error(result.error);
        }
      });
      return;
    }

    startTransition(async () => {
      const result = await moveProductToCategory(activeId, target, finalIds);
      if (!result.ok) {
        setModel(startModel);
        toast.error(result.error);
      }
    });
  }

  function handleDragCancel() {
    if (dragStartModel.current) setModel(dragStartModel.current);
    dragStartModel.current = null;
    lastOverId.current = null;
    setDrag(null);
  }

  // ---- Render ---------------------------------------------------------------------------------

  const dragProduct = drag?.type === "product" ? findProduct(model, drag.id) : undefined;
  const dragCategory = drag?.type === "category" ? model.categories.find((item) => item.id === drag.id) : undefined;
  const entries = sections.map(({ category, products: rows }) => ({
    id: category.id,
    name: category.name,
    count: rows.length,
    isActive: category.isActive,
  }));

  if (model.categories.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Menü" description="Kategorileri ve ürünleri tek ekrandan yönetin." />
        <FirstCategoryCard
          onCreated={(created) => handleCategorySaved({ ...created, description: null, imageMediaId: null, isActive: true })}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Menü"
        description="Kategorileri ve ürünleri tek ekrandan yönetin."
        actions={
          <>
            <div className="relative w-full sm:w-64">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-muted"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ürünlerde ara"
                aria-label="Ürünlerde ara"
                autoComplete="off"
                className="h-10 rounded-full pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" aria-label={`Filtre: ${FILTER_LABELS[filter]}`}>
                  {FILTER_LABELS[filter]}
                  <ChevronDown aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(FILTER_LABELS) as BuilderFilter[]).map((key) => (
                  <DropdownMenuCheckboxItem key={key} checked={filter === key} onCheckedChange={() => setFilter(key)}>
                    {FILTER_LABELS[key]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={() => setCategoryTarget({ kind: "create" })} disabled={atCategoryLimit}>
              <Plus aria-hidden="true" />
              Kategori
            </Button>
          </>
        }
      />

      <p className="sr-only" role="status">
        {filtering ? `${visibleProductIds.size} ürün bulundu.` : ""}
      </p>

      <CategoryChips
        className="lg:hidden"
        entries={entries}
        activeId={activeCategoryId}
        addDisabled={atCategoryLimit}
        onJump={jumpToCategory}
        onAdd={() => setCategoryTarget({ kind: "create" })}
      />

      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <aside className="sticky top-24 hidden lg:block">
          <CategoryIndex
            entries={entries}
            activeId={activeCategoryId}
            dragDisabled={dragDisabled}
            addDisabled={atCategoryLimit}
            onJump={jumpToCategory}
            onReorder={handleIndexReorder}
            onAdd={() => setCategoryTarget({ kind: "create" })}
          />
        </aside>

        <div className="min-w-0">
          {sections.length === 0 ? (
            <EmptyState
              icon={<SearchX />}
              title="Eşleşen ürün yok"
              description="Arama veya filtreyi değiştirmeyi deneyin."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Filtreleri temizle
                </Button>
              }
            />
          ) : (
            <DndContext
              id="menu-builder"
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              accessibility={{ announcements, screenReaderInstructions: SCREEN_READER_INSTRUCTIONS }}
            >
              <SortableContext
                items={sections.map((section) => section.category.id)}
                strategy={verticalListSortingStrategy}
                disabled={dragDisabled}
              >
                <div className="flex flex-col gap-4">
                  {sections.map(({ category, products: rows }) => (
                    <CategorySection
                      key={category.id}
                      category={category}
                      productCount={categoryProducts(model, category.id).length}
                      productIds={rows.map((row) => row.id)}
                      dragDisabled={dragDisabled}
                      hideAdd={filtering}
                      onRename={(name) => handleRename(category, name)}
                      onToggleActive={(isActive) => handleToggleCategory(category, isActive)}
                      onEdit={() => setCategoryTarget({ kind: "edit", id: category.id })}
                      onDelete={() => setPendingCategoryDelete(category)}
                      onAddProduct={() => openNewProduct(category.id)}
                    >
                      {rows.map((item) => (
                        <ProductRow
                          key={item.id}
                          item={item}
                          currency={currency}
                          selected={selected.has(item.id)}
                          selectionActive={selectedIds.length > 0}
                          dragDisabled={dragDisabled}
                          onSelect={(checked) => toggleSelected(item.id, checked)}
                          onOpen={() => openProduct(item.id)}
                          onToggleAvailability={(value) => handleToggleAvailability(item, value)}
                          onDuplicate={() => handleDuplicate(item)}
                          onDelete={() => setPendingDelete({ ids: [item.id], label: `“${item.name}”` })}
                        />
                      ))}
                    </CategorySection>
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {dragProduct ? (
                  <ProductRowContent item={dragProduct} currency={currency} overlay />
                ) : dragCategory ? (
                  <div className="type-body flex items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3 font-semibold shadow-float">
                    {dragCategory.name}
                    <span className="type-caption tabular font-normal text-fg-muted">
                      {categoryProducts(model, dragCategory.id).length} ürün
                    </span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      <BulkBar
        count={selectedIds.length}
        onAvailable={() => handleBulkAvailability(true)}
        onUnavailable={() => handleBulkAvailability(false)}
        onMove={() => setMoveOpen(true)}
        onDelete={() => setPendingDelete({ ids: selectedIds, label: `${selectedIds.length} ürün` })}
        onClear={() => setSelected(new Set())}
      />

      {heldProduct && (heldProduct.kind === "new" || heldProductItem) && (
        <ProductEditorSheet
          key={productSheet.nonce}
          open={productSheet.open}
          onClose={closeProductSheet}
          productId={heldProductItem?.id}
          initialValues={heldProductItem ? valuesFromProduct(heldProductItem) : emptyProductValues(heldProduct.kind === "new" ? heldProduct.categoryId : "")}
          categories={categoryOptions}
          currency={currency}
          onSaved={handleProductSaved}
        />
      )}

      {heldCategory && (heldCategory.kind === "create" || heldCategoryItem) && (
        <CategoryEditorSheet
          key={categorySheet.nonce}
          open={categorySheet.open}
          onClose={() => setCategoryTarget(null)}
          category={heldCategoryItem ?? null}
          onSaved={handleCategorySaved}
        />
      )}

      <MoveDialog
        key={moveOpen ? "open" : "closed"}
        open={moveOpen}
        onOpenChange={setMoveOpen}
        count={selectedIds.length}
        categories={categoryOptions}
        onConfirm={handleMove}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDelete ? `${pendingDelete.label} silinsin mi?` : "Silinsin mi?"}
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        destructive
        onConfirm={() => (pendingDelete ? handleDelete(pendingDelete) : undefined)}
      />

      <ConfirmDialog
        open={pendingCategoryDelete !== null}
        onOpenChange={(open) => !open && setPendingCategoryDelete(null)}
        title={pendingCategoryDelete ? `“${pendingCategoryDelete.name}” silinsin mi?` : "Kategori silinsin mi?"}
        description={
          pendingCategoryDelete
            ? categoryProducts(model, pendingCategoryDelete.id).length > 0
              ? `Bu kategorideki ${categoryProducts(model, pendingCategoryDelete.id).length} ürün de kalıcı olarak silinecek. Bu işlem geri alınamaz.`
              : "Bu kategori kalıcı olarak silinecek. Bu işlem geri alınamaz."
            : undefined
        }
        confirmLabel={
          pendingCategoryDelete && categoryProducts(model, pendingCategoryDelete.id).length > 0
            ? `Kategoriyi ve ${categoryProducts(model, pendingCategoryDelete.id).length} ürünü sil`
            : "Sil"
        }
        destructive
        onConfirm={() => (pendingCategoryDelete ? handleDeleteCategory(pendingCategoryDelete) : undefined)}
      />
    </div>
  );
}
