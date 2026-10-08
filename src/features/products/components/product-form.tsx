"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/features/media/components/image-upload";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { cn } from "@/lib/cn";
import { ALLERGENS, DIETARY_TAGS } from "@/lib/menu-attributes";
import { createProduct, updateProduct } from "../actions";
import type { CategoryOption } from "../queries";
import { PRODUCT_DESCRIPTION_MAX, productSchema } from "../schema";

/** Form state; money fields are text exactly as typed. */
export type ProductFormValues = {
  name: string;
  categoryId: string;
  description: string;
  price: string;
  discountPrice: string;
  imageMediaId: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  prepTime: string;
  calories: string;
  allergens: string[];
  tags: string[];
};

type ProductFormProps = {
  categories: CategoryOption[];
  /** ISO currency code of the restaurant; only used for the input suffix. */
  currency: string;
  /** Present when editing. */
  productId?: string;
  initialValues: ProductFormValues;
  /** Where to go after saving or cancelling (the product list, keeping the category filter). */
  returnHref: string;
};

function currencySymbol(currency: string): string {
  try {
    const part = new Intl.NumberFormat("tr-TR", { style: "currency", currency }).formatToParts(0);
    return part.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

export function ProductForm({ categories, currency, productId, initialValues, returnHref }: ProductFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const symbol = currencySymbol(currency);
  const isDirty = !isSaved && JSON.stringify(values) !== JSON.stringify(initialValues);

  // Warn before a reload or tab close discards edits.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function toggle(key: "allergens" | "tags", code: string, on: boolean) {
    setValues((current) => ({
      ...current,
      [key]: on ? [...current[key], code] : current[key].filter((item) => item !== code),
    }));
  }

  function showErrors(next: FieldErrors) {
    setErrors(next);
    // Move focus to the first invalid control once it has rendered its error state.
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: unknown = values;
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      showErrors(fromZodError(parsed.error).fieldErrors);
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = productId ? await updateProduct(productId, input) : await createProduct(input);
      if (result.ok) {
        setIsSaved(true);
        toast.success(productId ? "Ürün güncellendi." : "Ürün eklendi.");
        router.push(returnHref as Route);
      } else {
        showErrors(result.fieldErrors ?? {});
        toast.error(result.error);
      }
    });
  }

  const noCategories = categories.length === 0;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Temel bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="Ürün adı" required error={errors.name}>
            <Input
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
              autoComplete="off"
              placeholder="Örn. Mercimek çorbası"
              disabled={isPending}
              autoFocus={!productId}
            />
          </Field>

          <Field label="Kategori" required error={errors.categoryId}>
            {(controlProps) => (
              <Select
                value={values.categoryId}
                onValueChange={(value) => set("categoryId", value)}
                disabled={isPending || noCategories}
              >
                <SelectTrigger {...controlProps}>
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
            )}
          </Field>

          <Field
            label="Açıklama"
            optional
            error={errors.description}
            hint={`${values.description.trim().length}/${PRODUCT_DESCRIPTION_MAX}`}
          >
            <Textarea
              value={values.description}
              onChange={(event) => set("description", event.target.value)}
              rows={3}
              placeholder="İçindekiler, porsiyon bilgisi, servis şekli…"
              disabled={isPending}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fiyat" required error={errors.price}>
              {(controlProps) => (
                <PriceInput
                  {...controlProps}
                  symbol={symbol}
                  value={values.price}
                  onChange={(value) => set("price", value)}
                  disabled={isPending}
                  placeholder="0"
                />
              )}
            </Field>
            <Field
              label="İndirimli fiyat"
              optional
              error={errors.discountPrice}
              hint="Doluysa fiyat üstü çizili gösterilir."
            >
              {(controlProps) => (
                <PriceInput
                  {...controlProps}
                  symbol={symbol}
                  value={values.discountPrice}
                  onChange={(value) => set("discountPrice", value)}
                  disabled={isPending}
                  placeholder="0"
                />
              )}
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Görsel</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <ImageUpload
            className="max-w-md"
            value={values.imageMediaId}
            onChange={(id) => set("imageMediaId", id)}
            label="Ürün görseli"
            aspect="wide"
            disabled={isPending}
          />
          {errors.imageMediaId?.[0] && (
            <p role="alert" className="text-sm font-medium text-danger">
              {errors.imageMediaId[0]}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Durum ve detaylar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SwitchRow
            id="product-available"
            label="Stokta var"
            description="Kapalıysa menüde “Tükendi” olarak görünür."
            checked={values.isAvailable}
            onCheckedChange={(checked) => set("isAvailable", checked)}
            disabled={isPending}
          />
          <SwitchRow
            id="product-featured"
            label="Öne çıkan ürün"
            description="Menüde öne çıkarılır."
            checked={values.isFeatured}
            onCheckedChange={(checked) => set("isFeatured", checked)}
            disabled={isPending}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hazırlık süresi" optional error={errors.prepTime}>
              <Input
                value={values.prepTime}
                onChange={(event) => set("prepTime", event.target.value)}
                placeholder="15-20 dk"
                autoComplete="off"
                disabled={isPending}
              />
            </Field>
            <Field label="Kalori (kcal)" optional error={errors.calories}>
              <Input
                value={values.calories}
                onChange={(event) => set("calories", event.target.value)}
                inputMode="numeric"
                placeholder="0"
                autoComplete="off"
                disabled={isPending}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alerjenler</CardTitle>
          <CardDescription>
            Alerjen bilgisi yasal bir beyandır. Üründe bulunan tüm alerjenleri eksiksiz işaretlediğinizden emin olun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset className="grid gap-x-4 sm:grid-cols-2" disabled={isPending}>
            <legend className="sr-only">Üründe bulunan alerjenler</legend>
            {ALLERGENS.map((allergen) => {
              const id = `allergen-${allergen.code}`;
              return (
                <div key={allergen.code} className="flex min-h-11 items-center gap-3">
                  <Checkbox
                    id={id}
                    checked={values.allergens.includes(allergen.code)}
                    onCheckedChange={(checked) => toggle("allergens", allergen.code, checked === true)}
                  />
                  <label htmlFor={id} className="flex-1 cursor-pointer py-2 text-base select-none">
                    {allergen.label}
                  </label>
                </div>
              );
            })}
          </fieldset>
          {errors.allergens?.[0] && (
            <p role="alert" className="mt-2 text-sm font-medium text-danger">
              {errors.allergens[0]}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etiketler</CardTitle>
          <CardDescription>Misafirlerin menüde filtreleyip görebileceği özellikler.</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="group" aria-label="Ürün etiketleri" className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => {
              const pressed = values.tags.includes(tag.code);
              return (
                <button
                  key={tag.code}
                  type="button"
                  aria-pressed={pressed}
                  disabled={isPending}
                  onClick={() => toggle("tags", tag.code, !pressed)}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors disabled:opacity-50",
                    pressed
                      ? "border-accent bg-accent-soft text-accent-text"
                      : "border-border-strong bg-surface text-fg hover:bg-surface-muted",
                  )}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-2 border-t border-border bg-surface/90 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:rounded-lg sm:border sm:px-5">
        <Link href={returnHref as Route} className={buttonVariants({ variant: "secondary" })}>
          Vazgeç
        </Link>
        <Button type="submit" loading={isPending} disabled={noCategories}>
          {productId ? "Değişiklikleri kaydet" : "Ürünü ekle"}
        </Button>
      </div>
    </form>
  );
}

function PriceInput({
  symbol,
  value,
  onChange,
  ...rest
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  symbol: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Input
        {...rest}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        autoComplete="off"
        className="pr-12"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-fg-muted">
        {symbol}
      </span>
    </div>
  );
}

function SwitchRow({
  id,
  label,
  description,
  ...props
}: { id: string; label: string; description: string } & React.ComponentProps<typeof Switch>) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-surface-muted px-4 py-3">
      <div className="flex min-w-0 flex-col">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="text-sm text-fg-muted">{description}</span>
      </div>
      <Switch id={id} {...props} />
    </div>
  );
}
