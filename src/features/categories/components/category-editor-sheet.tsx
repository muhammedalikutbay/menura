"use client";

import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/features/media/components/image-upload";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { createCategory, updateCategory } from "../actions";
import type { CategoryListItem } from "../queries";
import { CATEGORY_DESCRIPTION_MAX, CATEGORY_NAME_MAX, categorySchema } from "../schema";

/** The category fields the editor works with. */
export type EditableCategory = Pick<CategoryListItem, "id" | "name" | "description" | "imageMediaId" | "isActive">;

type CategoryEditorSheetProps = {
  open: boolean;
  /** Called after the sheet asks to close (cancel, Esc, outside click, successful save). */
  onClose: () => void;
  /** The category being edited, or null to create a new one. */
  category: EditableCategory | null;
  /** Called after a successful save, with the saved category (new ones carry their fresh id). */
  onSaved?: (saved: EditableCategory) => void;
};

/**
 * Floating panel for a category's name, description and image. Mount it with a `key` that changes
 * per opening so the form starts from the saved values every time.
 */
export function CategoryEditorSheet({ open, onClose, category, onSaved }: CategoryEditorSheetProps) {
  const formId = useId();
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [imageMediaId, setImageMediaId] = useState<string | null>(category?.imageMediaId ?? null);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isDirty =
    name !== (category?.name ?? "") ||
    description !== (category?.description ?? "") ||
    imageMediaId !== (category?.imageMediaId ?? null) ||
    isActive !== (category?.isActive ?? true);

  function requestClose() {
    if (isPending) return;
    if (isDirty) setConfirmOpen(true);
    else onClose();
  }

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
      let id = category?.id ?? "";
      let failure: { error: string; fieldErrors?: FieldErrors } | null = null;
      if (category) {
        const result = await updateCategory(category.id, input);
        if (!result.ok) failure = result;
      } else {
        const result = await createCategory(input);
        if (result.ok) id = result.data.id;
        else failure = result;
      }
      if (failure) {
        setErrors(failure.fieldErrors ?? {});
        toast.error(failure.error);
        return;
      }
      toast.success(category ? "Kategori güncellendi." : "Kategori eklendi.");
      onSaved?.({
        id,
        name: parsed.data.name,
        description: parsed.data.description,
        imageMediaId: parsed.data.imageMediaId,
        isActive: parsed.data.isActive,
      });
      onClose();
    });
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => !next && requestClose()}
        title={category ? "Kategoriyi düzenle" : "Yeni kategori"}
        description={category ? undefined : "Yeni kategori menünüzün sonuna eklenir."}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={requestClose} disabled={isPending}>
              Vazgeç
            </Button>
            <Button type="submit" form={formId} loading={isPending}>
              Kaydet
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Field label="Kategori adı" required error={errors.name}>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={CATEGORY_NAME_MAX + 20}
              autoComplete="off"
              placeholder="Örn. Ana yemekler"
              disabled={isPending}
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
              <p role="alert" className="text-sm font-medium text-danger-text">
                {errors.imageMediaId[0]}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md bg-surface-muted px-4 py-3">
            <div className="flex flex-col">
              <label htmlFor={`${formId}-active`} className="text-sm font-medium">
                Menüde göster
              </label>
              <span className="text-sm text-fg-muted">Kapalıysa kategori misafirlere görünmez.</span>
            </div>
            <Switch id={`${formId}-active`} checked={isActive} onCheckedChange={setIsActive} disabled={isPending} />
          </div>
        </form>
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
