"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/features/media/components/image-upload";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { cn } from "@/lib/cn";
import { ALLERGENS, DIETARY_TAGS } from "@/lib/menu-attributes";
import { toMoneyInput } from "@/lib/money";
import { createProduct, updateProduct } from "../actions";
import type { CategoryOption, ProductListItem } from "../queries";
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

export function emptyProductValues(categoryId: string): ProductFormValues {
  return {
    name: "",
    categoryId,
    description: "",
    price: "",
    discountPrice: "",
    imageMediaId: null,
    isAvailable: true,
    isFeatured: false,
    prepTime: "",
    calories: "",
    allergens: [],
    tags: [],
  };
}

export function valuesFromProduct(item: ProductListItem): ProductFormValues {
  return {
    name: item.name,
    categoryId: item.categoryId,
    description: item.description ?? "",
    price: toMoneyInput(item.priceMinor),
    discountPrice: toMoneyInput(item.discountPriceMinor),
    imageMediaId: item.imageMediaId,
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    prepTime: item.prepTime ?? "",
    calories: item.calories === null ? "" : String(item.calories),
    allergens: item.allergens,
    tags: item.tags,
  };
}

function currencySymbol(currency: string): string {
  try {
    const part = new Intl.NumberFormat("tr-TR", { style: "currency", currency }).formatToParts(0);
    return part.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

type UseProductFormOptions = {
  /** Present when editing. */
  productId?: string;
  initialValues: ProductFormValues;
  /** Called after the server accepted the product, with the row as the builder shows it. */
  onSaved: (item: ProductListItem) => void;
};

/** State and submit logic of the product form; the sheet owns the footer buttons, so it owns this hook. */
export function useProductForm({ productId, initialValues, onSaved }: UseProductFormOptions) {
  const formRef = useRef<HTMLFormElement>(null);
  // The values the form started with; later prop refreshes must not make it look dirty.
  const [initial] = useState(initialValues);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isDirty = !isSaved && JSON.stringify(values) !== JSON.stringify(initial);

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

  function submit() {
    const input: unknown = values;
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      showErrors(fromZodError(parsed.error).fieldErrors);
      return;
    }
    const data = parsed.data;
    setErrors({});
    startTransition(async () => {
      let id = productId ?? "";
      let failure: { error: string; fieldErrors?: FieldErrors } | null = null;
      if (productId) {
        const result = await updateProduct(productId, input);
        if (!result.ok) failure = result;
      } else {
        const result = await createProduct(input);
        if (result.ok) id = result.data.id;
        else failure = result;
      }
      if (failure) {
        showErrors(failure.fieldErrors ?? {});
        toast.error(failure.error);
        return;
      }
      setIsSaved(true);
      toast.success(productId ? "Ürün güncellendi." : "Ürün eklendi.");
      onSaved({
        id,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        imageMediaId: data.imageMediaId,
        priceMinor: data.price,
        discountPriceMinor: data.discountPrice,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        prepTime: data.prepTime,
        calories: data.calories,
        allergens: data.allergens,
        tags: data.tags,
      });
    });
  }

  return { formRef, values, errors, isPending, isDirty, set, toggle, submit };
}

export type ProductFormState = ReturnType<typeof useProductForm>;

type ProductFormProps = {
  form: ProductFormState;
  /** Id of the `<form>`, so a footer button outside it can submit with `form={formId}`. */
  formId: string;
  categories: CategoryOption[];
  /** ISO currency code of the restaurant; only used for the input suffix. */
  currency: string;
};

/** The product fields in five groups. Rendered inside the editor sheet. */
export function ProductForm({ form, formId, categories, currency }: ProductFormProps) {
  const { formRef, values, errors, isPending, set, toggle, submit } = form;
  const symbol = currencySymbol(currency);
  const noCategories = categories.length === 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  // Enter in a single-line field saves, like a submit button inside the form would.
  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    const target = event.target;
    if (target instanceof HTMLInputElement && target.type === "text") {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      id={formId}
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      noValidate
      className="flex flex-col gap-8"
    >
      <FormSection title="Temel bilgiler">
        <Field label="Ürün adı" required error={errors.name}>
          <Input
            value={values.name}
            onChange={(event) => set("name", event.target.value)}
            autoComplete="off"
            placeholder="Örn. Mercimek çorbası"
            disabled={isPending}
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
      </FormSection>

      <FormSection title="Fiyat">
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
      </FormSection>

      <FormSection title="Görsel">
        <ImageUpload
          value={values.imageMediaId}
          onChange={(id) => set("imageMediaId", id)}
          label="Ürün görseli"
          aspect="wide"
          disabled={isPending}
        />
        {errors.imageMediaId?.[0] && (
          <p role="alert" className="text-sm font-medium text-danger-text">
            {errors.imageMediaId[0]}
          </p>
        )}
      </FormSection>

      <FormSection
        title="Alerjen ve etiketler"
        description="Alerjen bilgisi yasal bir beyandır. Üründe bulunan tüm alerjenleri eksiksiz işaretlediğinizden emin olun."
      >
        <div role="group" aria-label="Üründe bulunan alerjenler" className="flex flex-wrap gap-2">
          {ALLERGENS.map((allergen) => (
            <ToggleChip
              key={allergen.code}
              id={`allergen-${allergen.code}`}
              pressed={values.allergens.includes(allergen.code)}
              disabled={isPending}
              onToggle={(on) => toggle("allergens", allergen.code, on)}
            >
              {allergen.label}
            </ToggleChip>
          ))}
        </div>
        {errors.allergens?.[0] && (
          <p role="alert" className="text-sm font-medium text-danger-text">
            {errors.allergens[0]}
          </p>
        )}
        <p className="type-caption mt-2 text-fg-muted">Etiketler — misafirlerin menüde görebileceği özellikler</p>
        <div role="group" aria-label="Ürün etiketleri" className="flex flex-wrap gap-2">
          {DIETARY_TAGS.map((tag) => (
            <ToggleChip
              key={tag.code}
              id={`tag-${tag.code}`}
              pressed={values.tags.includes(tag.code)}
              disabled={isPending}
              onToggle={(on) => toggle("tags", tag.code, on)}
            >
              {tag.label}
            </ToggleChip>
          ))}
        </div>
      </FormSection>

      <FormSection title="Detaylar">
        <SwitchRow
          id={`${formId}-available`}
          label="Stokta var"
          description="Kapalıysa menüde “Tükendi” olarak görünür."
          checked={values.isAvailable}
          onCheckedChange={(checked) => set("isAvailable", checked)}
          disabled={isPending}
        />
        <SwitchRow
          id={`${formId}-featured`}
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
      </FormSection>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  // No accessible name on the section on purpose: five landmarks inside a dialog are noise.
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="type-body font-semibold">{title}</h3>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ToggleChip({
  id,
  pressed,
  disabled,
  onToggle,
  children,
}: {
  id: string;
  pressed: boolean;
  disabled: boolean;
  onToggle: (on: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={() => onToggle(!pressed)}
      className={cn(
        "type-caption inline-flex min-h-10 items-center rounded-full px-3.5 ring-1 ring-inset transition-colors disabled:opacity-50",
        pressed
          ? "bg-ink text-ink-fg ring-ink"
          : "bg-surface text-fg ring-border-strong hover:bg-surface-muted",
      )}
    >
      {children}
    </button>
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
