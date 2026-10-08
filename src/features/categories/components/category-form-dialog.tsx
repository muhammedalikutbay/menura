"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { ImageUpload } from "@/features/media/components/image-upload";
import { createCategory, updateCategory } from "../actions";
import type { CategoryListItem } from "../queries";
import { CATEGORY_DESCRIPTION_MAX, CATEGORY_NAME_MAX, categorySchema } from "../schema";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The category being edited, or null to create a new one. */
  category: CategoryListItem | null;
};

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={category ? "Kategoriyi düzenle" : "Yeni kategori"}
        description={category ? undefined : "Yeni kategori menünüzün sonuna eklenir."}
      >
        {/* Mounted only while open, so the form state resets every time. */}
        <CategoryForm category={category} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({ category, onDone }: { category: CategoryListItem | null; onDone: () => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [imageMediaId, setImageMediaId] = useState<string | null>(category?.imageMediaId ?? null);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = { name, description, imageMediaId, isActive };
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) {
      setErrors(fromZodError(parsed.error).fieldErrors);
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = category ? await updateCategory(category.id, input) : await createCategory(input);
      if (result.ok) {
        toast.success(category ? "Kategori güncellendi." : "Kategori eklendi.");
        onDone();
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field label="Kategori adı" required error={errors.name}>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={CATEGORY_NAME_MAX + 20}
          autoComplete="off"
          placeholder="Örn. Ana yemekler"
          disabled={isPending}
          autoFocus
        />
      </Field>
      <Field
        label="Açıklama"
        optional
        error={errors.description}
        hint={`${description.trim().length}/${CATEGORY_DESCRIPTION_MAX}`}
      >
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          disabled={isPending}
        />
      </Field>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium leading-5">
          Görsel<span className="ml-1.5 font-normal text-fg-muted">İsteğe bağlı</span>
        </span>
        <ImageUpload
          value={imageMediaId}
          onChange={setImageMediaId}
          label="Kategori görseli"
          aspect="wide"
          disabled={isPending}
        />
        {errors.imageMediaId?.[0] && (
          <p role="alert" className="text-sm font-medium text-danger">
            {errors.imageMediaId[0]}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 rounded-md bg-surface-muted px-4 py-3">
        <div className="flex flex-col">
          <label htmlFor="category-active" className="text-sm font-medium">
            Menüde göster
          </label>
          <span className="text-sm text-fg-muted">Kapalıysa kategori misafirlere görünmez.</span>
        </div>
        <Switch id="category-active" checked={isActive} onCheckedChange={setIsActive} disabled={isPending} />
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onDone} disabled={isPending}>
          Vazgeç
        </Button>
        <Button type="submit" loading={isPending}>
          {category ? "Kaydet" : "Kategori ekle"}
        </Button>
      </DialogFooter>
    </form>
  );
}
