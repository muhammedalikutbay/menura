"use client";

import Link from "next/link";
import type { Route } from "next";
import { ImageIcon, MoreHorizontal, Pencil, Plus, Tags, Trash2, UtensilsCrossed } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SortableItem, SortableList } from "@/components/ui/sortable";
import { Switch } from "@/components/ui/switch";
import { mediaUrl } from "@/features/media/url";
import { cn } from "@/lib/cn";
import { deleteCategory, reorderCategories, setCategoryActive } from "../actions";
import type { CategoryListItem } from "../queries";
import { MAX_CATEGORIES } from "../schema";
import { CategoryFormDialog } from "./category-form-dialog";

type FormState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; category: CategoryListItem };

export function CategoryManager({ categories }: { categories: CategoryListItem[] }) {
  // Local copy so toggles and drops feel instant; it is replaced whenever the server data changes.
  const [serverItems, setServerItems] = useState(categories);
  const [items, setItems] = useState(categories);
  if (categories !== serverItems) {
    setServerItems(categories);
    setItems(categories);
  }

  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [pendingDelete, setPendingDelete] = useState<CategoryListItem | null>(null);
  const [, startTransition] = useTransition();

  const atLimit = items.length >= MAX_CATEGORIES;

  function handleReorder(orderedIds: string[]) {
    const previous = items;
    const byId = new Map(items.map((item) => [item.id, item]));
    setItems(orderedIds.flatMap((id) => byId.get(id) ?? []));
    startTransition(async () => {
      const result = await reorderCategories(orderedIds);
      if (!result.ok) {
        setItems(previous);
        toast.error(result.error);
      }
    });
  }

  function handleToggle(item: CategoryListItem, isActive: boolean) {
    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, isActive } : row)));
    startTransition(async () => {
      const result = await setCategoryActive(item.id, isActive);
      if (!result.ok) {
        setItems((current) => current.map((row) => (row.id === item.id ? { ...row, isActive: !isActive } : row)));
        toast.error(result.error);
      }
    });
  }

  async function handleDelete(item: CategoryListItem) {
    const result = await deleteCategory(item.id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    setItems((current) => current.filter((row) => row.id !== item.id));
    toast.success(
      result.data.deletedProducts > 0
        ? `“${item.name}” ve ${result.data.deletedProducts} ürün silindi.`
        : `“${item.name}” silindi.`,
    );
  }

  const newCategoryButton = (
    <Button onClick={() => setForm({ mode: "create" })} disabled={atLimit}>
      <Plus aria-hidden="true" />
      Yeni kategori
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kategoriler"
        description="Menünüzün bölümlerini oluşturun. Sıralamak için tutacaktan sürükleyin."
        actions={items.length > 0 ? newCategoryButton : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Tags />}
          title="Henüz kategori yok"
          description="Ürünlerinizi gruplamak için ilk kategorinizi ekleyin; örneğin “Başlangıçlar” veya “İçecekler”."
          action={newCategoryButton}
        />
      ) : (
        <>
          <SortableList
            aria-label="Kategoriler"
            className="flex flex-col gap-2"
            items={items.map((item) => ({ id: item.id, label: item.name }))}
            onReorder={handleReorder}
          >
            {items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                label={item.name}
                className="rounded-lg border border-border bg-surface shadow-xs"
              >
                {(handle) => (
                  <div className="flex items-center gap-1 p-2 sm:gap-2 sm:p-3">
                    {handle}
                    <Thumb mediaId={item.imageMediaId} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className={cn("truncate font-medium", !item.isActive && "text-fg-muted")}>{item.name}</p>
                        {!item.isActive && <Badge className="shrink-0">Gizli</Badge>}
                      </div>
                      <p className="truncate text-sm text-fg-muted">
                        {item.productCount} ürün{item.description ? ` · ${item.description}` : ""}
                      </p>
                    </div>
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={(checked) => handleToggle(item, checked)}
                      aria-label={`${item.name} menüde göster`}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`${item.name} işlemleri`}>
                          <MoreHorizontal aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setForm({ mode: "edit", category: item })}>
                          <Pencil aria-hidden="true" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/menu?category=${item.id}` as Route}>
                            <UtensilsCrossed aria-hidden="true" />
                            Ürünleri gör
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onSelect={() => setPendingDelete(item)}>
                          <Trash2 aria-hidden="true" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </SortableItem>
            ))}
          </SortableList>
          <p className="text-sm text-fg-muted">
            {items.length} / {MAX_CATEGORIES} kategori
            {atLimit && " · Sınıra ulaştınız, yeni kategori eklemek için birini silin."}
          </p>
        </>
      )}

      <CategoryFormDialog
        open={form.mode !== "closed"}
        onOpenChange={(open) => !open && setForm({ mode: "closed" })}
        category={form.mode === "edit" ? form.category : null}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDelete ? `“${pendingDelete.name}” silinsin mi?` : "Kategori silinsin mi?"}
        description={
          pendingDelete
            ? pendingDelete.productCount > 0
              ? `Bu kategorideki ${pendingDelete.productCount} ürün de kalıcı olarak silinecek. Bu işlem geri alınamaz.`
              : "Bu kategori kalıcı olarak silinecek. Bu işlem geri alınamaz."
            : undefined
        }
        confirmLabel={
          pendingDelete && pendingDelete.productCount > 0 ? `Kategoriyi ve ${pendingDelete.productCount} ürünü sil` : "Sil"
        }
        destructive
        onConfirm={() => (pendingDelete ? handleDelete(pendingDelete) : undefined)}
      />
    </div>
  );
}

function Thumb({ mediaId }: { mediaId: string | null }) {
  const src = mediaUrl(mediaId);
  return (
    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-muted text-fg-muted sm:size-14">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- media is already resized and immutable
        <img src={src} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <ImageIcon aria-hidden="true" className="size-5" />
      )}
    </div>
  );
}
