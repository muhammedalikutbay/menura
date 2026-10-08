"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFocusInvalid } from "@/features/auth/components/use-focus-invalid";
import { ImageUpload } from "@/features/media/components/image-upload";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { SUPPORTED_CURRENCIES, type Currency } from "@/lib/money";
import { updateRestaurantProfile } from "../actions";
import { updateRestaurantProfileSchema } from "../schema";
import { ThemeColorPicker } from "./theme-color-picker";

export type ProfileValues = {
  name: string;
  description: string;
  phone: string;
  address: string;
  instagram: string;
  website: string;
  wifiName: string;
  wifiPassword: string;
  logoMediaId: string | null;
  coverMediaId: string | null;
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

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const headingId = useId();
  return (
    <section
      role="group"
      aria-labelledby={headingId}
      className="flex flex-col gap-4 border-t border-border pt-5 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-col gap-0.5">
        <h3 id={headingId} className="text-sm font-semibold">
          {title}
        </h3>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  description?: string;
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
        {description && (
          <p id={`${id}-description`} className="text-sm text-fg-muted">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? `${id}-description` : undefined}
      />
    </div>
  );
}

export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<ProfileValues>(initial);
  const [baseline, setBaseline] = useState<ProfileValues>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { formRef, requestFocus } = useFocusInvalid();

  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);

  function set<K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = updateRestaurantProfileSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fromZodError(parsed.error).fieldErrors);
      requestFocus();
      return;
    }
    setErrors({});

    startTransition(async () => {
      try {
        const result = await updateRestaurantProfile(values);
        if (!result.ok) {
          setErrors(result.fieldErrors ?? {});
          toast.error(result.error);
          if (result.fieldErrors) requestFocus();
          return;
        }
        setBaseline(values);
        toast.success("Restoran profili kaydedildi.");
        router.refresh();
      } catch {
        toast.error("Kaydedilemedi. Lütfen tekrar deneyin.");
      }
    });
  }

  return (
    <Card>
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>Restoran profili</CardTitle>
          <CardDescription>Bu bilgiler misafirlerin gördüğü menüde yer alır.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <Section title="Temel bilgiler">
            <Field label="Restoran adı" error={errors.name} required>
              <Input
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                autoComplete="organization"
                maxLength={80}
              />
            </Field>
            <Field label="Açıklama" error={errors.description} optional hint="Menünüzün üst kısmında kısa bir tanıtım olarak görünür.">
              <Textarea
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
                maxLength={300}
                rows={3}
              />
            </Field>
          </Section>

          <Section title="Görseller">
            <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
              <div className="flex flex-col gap-2">
                <p className="text-sm leading-5 font-medium">Logo</p>
                <ImageUpload
                  label="Logo"
                  aspect="square"
                  value={values.logoMediaId}
                  onChange={(id) => set("logoMediaId", id)}
                  disabled={isPending}
                />
                {errors.logoMediaId && (
                  <p role="alert" className="text-sm font-medium text-danger">
                    {errors.logoMediaId[0]}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm leading-5 font-medium">Kapak görseli</p>
                <ImageUpload
                  label="Kapak görseli"
                  aspect="wide"
                  value={values.coverMediaId}
                  onChange={(id) => set("coverMediaId", id)}
                  disabled={isPending}
                />
                {errors.coverMediaId && (
                  <p role="alert" className="text-sm font-medium text-danger">
                    {errors.coverMediaId[0]}
                  </p>
                )}
              </div>
            </div>
          </Section>

          <Section title="İletişim">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Telefon" error={errors.phone} optional>
                <Input
                  type="tel"
                  inputMode="tel"
                  value={values.phone}
                  onChange={(event) => set("phone", event.target.value)}
                  autoComplete="tel"
                  maxLength={30}
                />
              </Field>
              <Field label="Instagram" error={errors.instagram} optional hint="Kullanıcı adınız, örn. menura">
                <Input
                  value={values.instagram}
                  onChange={(event) => set("instagram", event.target.value)}
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </Field>
            </div>
            <Field label="Adres" error={errors.address} optional>
              <Input
                value={values.address}
                onChange={(event) => set("address", event.target.value)}
                autoComplete="street-address"
                maxLength={200}
              />
            </Field>
            <Field label="Web sitesi" error={errors.website} optional>
              <Input
                type="url"
                inputMode="url"
                placeholder="https://"
                value={values.website}
                onChange={(event) => set("website", event.target.value)}
                autoCapitalize="none"
                spellCheck={false}
              />
            </Field>
          </Section>

          <Section title="Wi-Fi" description="Misafirleriniz bu bilgileri menüde görür.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ağ adı" error={errors.wifiName} optional>
                <Input
                  value={values.wifiName}
                  onChange={(event) => set("wifiName", event.target.value)}
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={64}
                />
              </Field>
              <Field label="Wi-Fi şifresi" error={errors.wifiPassword} optional>
                <Input
                  value={values.wifiPassword}
                  onChange={(event) => set("wifiPassword", event.target.value)}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={64}
                />
              </Field>
            </div>
          </Section>

          <Section title="Görünüm">
            <ThemeColorPicker
              value={values.themeColor}
              onChange={(color) => set("themeColor", color)}
              error={errors.themeColor}
              disabled={isPending}
            />
            <Field label="Para birimi" error={errors.currency}>
              {(controlProps) => (
                <Select value={values.currency} onValueChange={(value) => set("currency", value as Currency)}>
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
          </Section>

          <Section title="Menü tercihleri">
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
          </Section>
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="submit" loading={isPending} disabled={!dirty} className="w-full sm:w-auto">
            Değişiklikleri kaydet
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
