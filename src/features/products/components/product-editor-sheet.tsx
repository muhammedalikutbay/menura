"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Sheet } from "@/components/ui/sheet";
import type { CategoryOption, ProductListItem } from "../queries";
import { ProductForm, useProductForm, type ProductFormValues } from "./product-form";

type ProductEditorSheetProps = {
  open: boolean;
  /** Asks the owner to close: cancel, Esc, outside click or after a save. The parent updates the URL. */
  onClose: () => void;
  /** Present when editing. */
  productId?: string;
  initialValues: ProductFormValues;
  categories: CategoryOption[];
  currency: string;
  onSaved: (item: ProductListItem) => void;
};

/**
 * The product editor: a floating right panel with the form and a sticky "Vazgeç" / "Kaydet" footer.
 * Closing with unsaved changes asks first. Mount it with a `key` that changes per opening so the
 * form restarts from the saved values.
 */
export function ProductEditorSheet({
  open,
  onClose,
  productId,
  initialValues,
  categories,
  currency,
  onSaved,
}: ProductEditorSheetProps) {
  const formId = useId();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const form = useProductForm({
    productId,
    initialValues,
    onSaved: (item) => {
      onSaved(item);
      onClose();
    },
  });

  function requestClose() {
    if (form.isPending) return;
    if (form.isDirty) setConfirmOpen(true);
    else onClose();
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => !next && requestClose()}
        title={productId ? initialValues.name || "Ürünü düzenle" : "Yeni ürün"}
        description={productId ? "Ürün bilgilerini güncelleyin." : "Kaydedince ürün kategorisinin sonuna eklenir."}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={requestClose} disabled={form.isPending}>
              Vazgeç
            </Button>
            <Button type="submit" form={formId} loading={form.isPending} disabled={categories.length === 0}>
              Kaydet
            </Button>
          </>
        }
      >
        <ProductForm form={form} formId={formId} categories={categories} currency={currency} />
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Değişiklikler kaydedilmedi"
        description="Kapatırsanız yaptığınız değişiklikler kaybolur."
        confirmLabel="Değişiklikleri at"
        cancelLabel="Düzenlemeye devam et"
        destructive
        onConfirm={() => onClose()}
      />
    </>
  );
}
