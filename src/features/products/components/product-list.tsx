"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  Copy,
  FolderInput,
  ImageIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SearchX,
  Star,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortableItem, SortableList } from "@/components/ui/sortable";
import { Switch } from "@/components/ui/switch";
import { mediaUrl } from "@/features/media/url";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import { normalizeForSearch } from "@/lib/text";
import {
  deleteProduct,
  deleteProducts,
  duplicateProduct,
  moveProducts,
  reorderProducts,
  setProductAvailability,
  setProductsAvailability,
} from "../actions";
import type { CategoryOption, ProductListItem } from "../queries";

type AvailabilityFilter = "all" | "available" | "unavailable";

const ALL = "all";

type ProductListProps = {
  products: ProductListItem[];
  categories: CategoryOption[];
  currency: string;
  /** Category id from `?category=`; ignored when it does not exist. */
  initialCategoryId: string | null;
};

export function ProductList({ products, categories, currency, initialCategoryId }: ProductListProps) {
  // Local copy so toggles, drops and deletes feel instant; replaced whenever the server data changes.
  const [serverItems, setServerItems] = useState(products);
  const [items, setItems] = useState(products);
  if (products !== serverItems) {
    setServerItems(products);
    setItems(products);
  }

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState(
    initialCategoryId && categories.some((item) => item.id === initialCategoryId) ? initialCategoryId : ALL,
  );
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; label: string } | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [, startTransition] = useTransition();

  const categoryName = new Map(categories.map((item) => [item.id, item.name]));
  const normalizedQuery = normalizeForSearch(query);
  const filtered = items.filter(
    (item) =>
      (categoryId === ALL || item.categoryId === categoryId) &&
      (availability === "all" || item.isAvailable === (availability === "available")) &&
      (normalizedQuery === "" || normalizeForSearch(`${item.name} ${item.description ?? ""}`).includes(normalizedQuery)),
  );
  const hasFilters = categoryId !== ALL || availability !== "all" || normalizedQuery !== "";
  const canReorder = categoryId !== ALL && availability === "all" && normalizedQuery === "";

  const visibleSelectedIds = filtered.filter((item) => selected.has(item.id)).map((item) => item.id);
  const allSelected = filtered.length > 0 && visibleSelectedIds.length === filtered.length;

  function changeCategory(next: string) {
    setCategoryId(next);
    // Keep the filter in the URL so reloads and shared links land on the same view.
    const url = new URL(window.location.href);
    if (next === ALL) url.searchParams.delete("category");
    else url.searchParams.set("category", next);
    window.history.replaceState(window.history.state, "", url);
  }

  function clearFilters() {
    setQuery("");
    setAvailability("all");
    changeCategory(ALL);
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const item of filtered) {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });
  }

  function patchAvailability(ids: ReadonlySet<string>, isAvailable: boolean) {
    setItems((current) => current.map((item) => (ids.has(item.id) ? { ...item, isAvailable } : item)));
  }

  function handleToggleAvailability(item: ProductListItem, isAvailable: boolean) {
    patchAvailability(new Set([item.id]), isAvailable);
    startTransition(async () => {
      const result = await setProductAvailability(item.id, isAvailable);
      if (!result.ok) {
        patchAvailability(new Set([item.id]), !isAvailable);
        toast.error(result.error);
      }
    });
  }

  function handleBulkAvailability(isAvailable: boolean) {
    const ids = visibleSelectedIds;
    const previous = new Map(items.filter((item) => ids.includes(item.id)).map((item) => [item.id, item.isAvailable]));
    patchAvailability(new Set(ids), isAvailable);
    startTransition(async () => {
      const result = await setProductsAvailability(ids, isAvailable);
      if (result.ok) {
        toast.success(`${result.data.updated} ürün ${isAvailable ? "stokta" : "tükendi olarak"} işaretlendi.`);
        setSelected(new Set());
      } else {
        setItems((current) =>
          current.map((item) => (previous.has(item.id) ? { ...item, isAvailable: previous.get(item.id) ?? true } : item)),
        );
        toast.error(result.error);
      }
    });
  }

  async function handleMove(targetCategoryId: string) {
    const ids = visibleSelectedIds;
    const result = await moveProducts(ids, targetCategoryId);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    const idSet = new Set(ids);
    setItems((current) => current.map((item) => (idSet.has(item.id) ? { ...item, categoryId: targetCategoryId } : item)));
    setSelected(new Set());
    toast.success(`${result.data.moved} ürün “${categoryName.get(targetCategoryId) ?? "kategori"}” kategorisine taşındı.`);
  }

  async function handleDelete(target: { ids: string[] }) {
    const result = target.ids.length === 1 ? await deleteProduct(target.ids[0]!) : await deleteProducts(target.ids);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    const removed = new Set(target.ids);
    setItems((current) => current.filter((item) => !removed.has(item.id)));
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

  function handleReorder(orderedIds: string[]) {
    const previous = items;
    const byId = new Map(items.map((item) => [item.id, item]));
    const reordered = orderedIds.flatMap((id) => byId.get(id) ?? []);
    // Put the reordered products back into the slots this category occupies in the full list.
    let cursor = 0;
    setItems(items.map((item) => (item.categoryId === categoryId ? (reordered[cursor++] ?? item) : item)));
    startTransition(async () => {
      const result = await reorderProducts(categoryId, orderedIds);
      if (!result.ok) {
        setItems(previous);
        toast.error(result.error);
      }
    });
  }

  const newProductHref = (categoryId !== ALL
    ? `/dashboard/products/new?category=${categoryId}`
    : "/dashboard/products/new") as Route;
  const returnQuery = categoryId !== ALL ? `?category=${categoryId}` : "";

  const newProductButton = (
    <Link href={newProductHref} className={buttonVariants()}>
      <Plus aria-hidden="true" />
      Yeni ürün
    </Link>
  );

  function renderRow(item: ProductListItem, handle?: React.ReactNode) {
    return (
      <ProductRow
        item={item}
        currency={currency}
        categoryLabel={categoryId === ALL ? (categoryName.get(item.categoryId) ?? "") : null}
        handle={handle}
        selected={selected.has(item.id)}
        editHref={`/dashboard/products/${item.id}${returnQuery}` as Route}
        onSelect={(checked) => toggleSelected(item.id, checked)}
        onToggleAvailability={(value) => handleToggleAvailability(item, value)}
        onDuplicate={() => handleDuplicate(item)}
        onDelete={() => setPendingDelete({ ids: [item.id], label: item.name })}
      />
    );
  }

  const rowClass = "rounded-lg border border-border bg-surface shadow-xs";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ürünler"
        description="Menünüzdeki ürünleri ekleyin, düzenleyin ve stok durumunu yönetin."
        actions={items.length > 0 ? newProductButton : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed />}
          title="Henüz ürün yok"
          description="İlk ürününüzü ekleyin; fiyat, görsel ve alerjen bilgileriyle birlikte menünüzde görünür."
          action={newProductButton}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-muted"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ürün adı veya açıklama ara"
                aria-label="Ürünlerde ara"
                autoComplete="off"
                className="pl-10"
              />
            </div>
            <Select value={categoryId} onValueChange={changeCategory}>
              <SelectTrigger aria-label="Kategoriye göre filtrele" className="sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tüm kategoriler</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availability} onValueChange={(value) => setAvailability(value as AvailabilityFilter)}>
              <SelectTrigger aria-label="Stok durumuna göre filtrele" className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm durumlar</SelectItem>
                <SelectItem value="available">Stokta</SelectItem>
                <SelectItem value="unavailable">Tükendi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-3">
              <Checkbox
                id="select-all-products"
                checked={allSelected ? true : visibleSelectedIds.length > 0 ? "indeterminate" : false}
                onCheckedChange={(checked) => toggleAll(checked === true)}
                disabled={filtered.length === 0}
              />
              <label htmlFor="select-all-products" className="cursor-pointer text-sm text-fg-muted select-none" aria-live="polite">
                {visibleSelectedIds.length > 0
                  ? `${visibleSelectedIds.length} ürün seçili`
                  : `${filtered.length} ürün${hasFilters ? ` (toplam ${items.length})` : ""}`}
              </label>
            </div>

            {visibleSelectedIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAvailability(true)}>
                  Stokta yap
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAvailability(false)}>
                  Tükendi yap
                </Button>
                <Button size="sm" variant="outline" onClick={() => setMoveOpen(true)}>
                  <FolderInput aria-hidden="true" />
                  Taşı
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-danger"
                  onClick={() =>
                    setPendingDelete({ ids: visibleSelectedIds, label: `${visibleSelectedIds.length} ürün` })
                  }
                >
                  <Trash2 aria-hidden="true" />
                  Sil
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                  <X aria-hidden="true" />
                  Seçimi kaldır
                </Button>
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<SearchX />}
              title="Eşleşen ürün yok"
              description="Arama veya filtreleri değiştirmeyi deneyin."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Filtreleri temizle
                </Button>
              }
            />
          ) : canReorder ? (
            <>
              <SortableList
                aria-label="Ürünler"
                className="flex flex-col gap-2"
                items={filtered.map((item) => ({ id: item.id, label: item.name }))}
                onReorder={handleReorder}
              >
                {filtered.map((item) => (
                  <SortableItem key={item.id} id={item.id} label={item.name} className={rowClass}>
                    {(handle) => renderRow(item, handle)}
                  </SortableItem>
                ))}
              </SortableList>
              <p className="text-sm text-fg-muted">Ürünleri tutacaktan sürükleyerek bu kategorideki sırayı değiştirebilirsiniz.</p>
            </>
          ) : (
            <>
              <ul aria-label="Ürünler" className="flex flex-col gap-2">
                {filtered.map((item) => (
                  <li key={item.id} className={rowClass}>
                    {renderRow(item)}
                  </li>
                ))}
              </ul>
              {categoryId === ALL && (
                <p className="text-sm text-fg-muted">Sıralamak için bir kategori seçin.</p>
              )}
            </>
          )}
        </>
      )}

      <MoveDialog
        key={moveOpen ? "open" : "closed"}
        open={moveOpen}
        onOpenChange={setMoveOpen}
        count={visibleSelectedIds.length}
        categories={categories}
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
    </div>
  );
}

type ProductRowProps = {
  item: ProductListItem;
  currency: string;
  /** Category name to show under the product name, or null when the list is filtered by category. */
  categoryLabel: string | null;
  handle?: React.ReactNode;
  selected: boolean;
  editHref: Route;
  onSelect: (checked: boolean) => void;
  onToggleAvailability: (isAvailable: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

function ProductRow({
  item,
  currency,
  categoryLabel,
  handle,
  selected,
  editHref,
  onSelect,
  onToggleAvailability,
  onDuplicate,
  onDelete,
}: ProductRowProps) {
  const src = mediaUrl(item.imageMediaId);
  const hasDiscount = item.discountPriceMinor !== null;

  return (
    <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-3">
      {handle}
      <Checkbox checked={selected} onCheckedChange={(checked) => onSelect(checked === true)} aria-label={`${item.name} seç`} />
      <Link href={editHref} tabIndex={-1} aria-hidden="true" className="shrink-0">
        <div className="flex size-12 items-center justify-center overflow-hidden rounded-md bg-surface-muted text-fg-muted sm:size-14">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element -- media is already resized and immutable
            <img src={src} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <ImageIcon aria-hidden="true" className="size-5" />
          )}
        </div>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Link
          href={editHref}
          className={cn("line-clamp-2 rounded-sm font-medium break-words hover:underline", !item.isAvailable && "text-fg-muted")}
        >
          {item.name}
        </Link>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-fg-muted">
          <span className="whitespace-nowrap">
            {hasDiscount ? (
              <>
                <span className="font-medium text-fg">{formatMoney(item.discountPriceMinor!, currency)}</span>{" "}
                <s>{formatMoney(item.priceMinor, currency)}</s>
              </>
            ) : (
              <span className="font-medium text-fg">{formatMoney(item.priceMinor, currency)}</span>
            )}
          </span>
          {categoryLabel && <span className="min-w-0 truncate">{categoryLabel}</span>}
        </p>
        {(!item.isAvailable || item.isFeatured) && (
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            {!item.isAvailable && <Badge variant="warning">Tükendi</Badge>}
            {item.isFeatured && (
              <Badge variant="accent">
                <Star aria-hidden="true" className="size-3" />
                Öne çıkan
              </Badge>
            )}
          </div>
        )}
      </div>
      <Switch
        checked={item.isAvailable}
        onCheckedChange={onToggleAvailability}
        aria-label={`${item.name} stokta`}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`${item.name} işlemleri`}>
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={editHref}>
              <Pencil aria-hidden="true" />
              Düzenle
            </Link>
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

type MoveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  categories: CategoryOption[];
  onConfirm: (categoryId: string) => Promise<false | void>;
};

function MoveDialog({ open, onOpenChange, count, categories, onConfirm }: MoveDialogProps) {
  const [target, setTarget] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!target) return;
    startTransition(async () => {
      const result = await onConfirm(target);
      if (result !== false) onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent title="Kategoriye taşı" description={`${count} ürün seçilen kategorinin sonuna taşınır.`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger aria-label="Hedef kategori">
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
              Vazgeç
            </Button>
            <Button type="submit" loading={isPending} disabled={!target}>
              Taşı
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
