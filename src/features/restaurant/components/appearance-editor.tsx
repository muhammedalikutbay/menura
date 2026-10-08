"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MenuPhonePreview } from "@/features/menu/preview/menu-phone-preview";
import type { PublicMenu } from "@/features/menu/types";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { cn } from "@/lib/cn";
import { SUPPORTED_CURRENCIES, type Currency } from "@/lib/money";
import { updateAppearance } from "../actions";
import { updateAppearanceSchema } from "../schema";
import { PublishCard } from "./publish-card";
import { SlugCard } from "./slug-card";
import { ThemeColorPicker } from "./theme-color-picker";

export type AppearanceValues = {
  themeColor: string;
  currency: Currency;
  showVatNote: boolean;
  hideUnavailable: boolean;
};

const CURRENCY_LABELS: Record<Currency, string> = {
  TRY: "Türk lirası (₺)",
  EUR: "Euro (€)",
  USD: "ABD doları ($)",
  GBP: "İngiliz sterlini (£)",
};

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <label htmlFor={id} className="text-sm leading-5 font-medium">
          {label}
        </label>
        <p id={`${id}-description`} className="text-sm text-fg-muted">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={`${id}-description`}
      />
    </div>
  );
}

/** The saved menu with the unsaved appearance values applied, so the preview reacts instantly. */
function withAppearance(
  menu: PublicMenu,
  values: AppearanceValues,
): PublicMenu {
  const categories = values.hideUnavailable
    ? menu.categories
        .map((category) => ({
          ...category,
          products: category.products.filter((product) => product.isAvailable),
        }))
        .filter((category) => category.products.length > 0)
    : menu.categories;
  return { ...menu, restaurant: { ...menu.restaurant, ...values }, categories };
}

type AppearanceEditorProps = {
  slug: string;
  host: string;
  isPublished: boolean;
  initial: AppearanceValues;
  menu: PublicMenu;
};

export function AppearanceEditor({
  slug,
  host,
  isPublished,
  initial,
  menu,
}: AppearanceEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<AppearanceValues>(initial);
  const [baseline, setBaseline] = useState<AppearanceValues>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewId = useId();

  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);

  function set<K extends keyof AppearanceValues>(
    key: K,
    value: AppearanceValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;
    const parsed = updateAppearanceSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fromZodError(parsed.error).fieldErrors);
      return;
    }
    setErrors({});

    startTransition(async () => {
      try {
        const result = await updateAppearance(values);
        if (!result.ok) {
          setErrors(result.fieldErrors ?? {});
          toast.error(result.error);
          return;
        }
        setBaseline(values);
        toast.success("Görünüm ayarları kaydedildi.");
        router.refresh();
      } catch {
        toast.error("Kaydedilemedi. Lütfen tekrar deneyin.");
      }
    });
  }

  const saveButton = (
    <Button
      type="submit"
      loading={isPending}
      disabled={!dirty}
      className="w-full sm:w-auto"
    >
      Değişiklikleri kaydet
    </Button>
  );
  const previewMenu = withAppearance(menu, values);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex min-w-0 flex-col gap-6">
        <PublishCard isPublished={isPublished} slug={slug} />
        <SlugCard slug={slug} host={host} />

        {/* One form for both cards: they save the same four values together. */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>
                Menünüzün rengini seçin; önizleme anında değişir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeColorPicker
                value={values.themeColor}
                onChange={(color) => set("themeColor", color)}
                error={errors.themeColor}
                disabled={isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fiyat ve içerik</CardTitle>
              <CardDescription>
                Fiyatların nasıl gösterileceğini ve hangi ürünlerin
                listeleneceğini belirleyin.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field label="Para birimi" error={errors.currency}>
                {(controlProps) => (
                  <Select
                    value={values.currency}
                    onValueChange={(value) =>
                      set("currency", value as Currency)
                    }
                  >
                    <SelectTrigger {...controlProps} aria-required={undefined}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {CURRENCY_LABELS[currency]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <SwitchRow
                label="Fiyatlara KDV dahildir notunu göster"
                description="Menünün altında “Fiyatlara KDV dahildir” notu görünür."
                checked={values.showVatNote}
                onCheckedChange={(checked) => set("showVatNote", checked)}
                disabled={isPending}
              />
              <SwitchRow
                label="Tükenen ürünleri gizle"
                description="Kapalıyken tükenen ürünler “Tükendi” etiketiyle listelenir."
                checked={values.hideUnavailable}
                onCheckedChange={(checked) => set("hideUnavailable", checked)}
                disabled={isPending}
              />
            </CardContent>
            <CardFooter className="justify-end">{saveButton}</CardFooter>
          </Card>
        </form>
      </div>

      <aside
        aria-label="Menü önizlemesi"
        className="flex min-w-0 flex-col items-center gap-4 lg:sticky lg:top-6"
      >
        <Button
          variant="secondary"
          className="w-full lg:hidden"
          aria-expanded={previewOpen}
          aria-controls={previewId}
          onClick={() => setPreviewOpen((open) => !open)}
        >
          {previewOpen ? (
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
          {previewOpen ? "Önizlemeyi gizle" : "Önizlemeyi göster"}
        </Button>
        <div
          id={previewId}
          className={cn(
            "w-full justify-center",
            previewOpen ? "flex" : "hidden",
            "lg:flex",
          )}
        >
          {menu.categories.length === 0 ? (
            <Card className="w-full items-center px-6 py-10 text-center">
              <p className="type-title">Henüz ürün yok</p>
              <p className="text-sm text-fg-muted">
                Menünüze ürün ekledikçe burada görünür.
              </p>
            </Card>
          ) : (
            <MenuPhonePreview menu={previewMenu} size="md" tilt={false} />
          )}
        </div>
      </aside>
    </div>
  );
}
