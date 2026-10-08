"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFocusInvalid } from "@/features/auth/components/use-focus-invalid";
import { ImageUpload } from "@/features/media/components/image-upload";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { updateRestaurantProfile } from "../actions";
import { updateRestaurantProfileSchema } from "../schema";

export type RestaurantValues = {
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
};

function ImageError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-sm font-medium text-danger">
      {messages[0]}
    </p>
  );
}

export function RestaurantForm({ initial }: { initial: RestaurantValues }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<RestaurantValues>(initial);
  const [baseline, setBaseline] = useState<RestaurantValues>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { formRef, requestFocus } = useFocusInvalid();

  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);

  function set<K extends keyof RestaurantValues>(key: K, value: RestaurantValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleReset() {
    setValues(baseline);
    setErrors({});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;
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
        toast.success("Restoran bilgileri kaydedildi.");
        router.refresh();
      } catch {
        toast.error("Kaydedilemedi. Lütfen tekrar deneyin.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Kimlik</CardTitle>
          <CardDescription>Menünüzün en üstünde misafirlerinizi bunlar karşılar.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Field label="Restoran adı" error={errors.name} required>
            <Input
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
              autoComplete="organization"
              maxLength={80}
            />
          </Field>
          <Field
            label="Açıklama"
            error={errors.description}
            optional
            hint="Menünüzün üst kısmında kısa bir tanıtım olarak görünür."
          >
            <Textarea
              value={values.description}
              onChange={(event) => set("description", event.target.value)}
              maxLength={300}
              rows={3}
            />
          </Field>
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
              <ImageError messages={errors.logoMediaId} />
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
              <ImageError messages={errors.coverMediaId} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>İletişim</CardTitle>
          <CardDescription>
            Misafirler menüden sizi arayabilir, yol tarifi alabilir ve sosyal hesaplarınıza ulaşabilir.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wi-Fi</CardTitle>
          <CardDescription>Misafirleriniz bu bilgileri menüde görür.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Ağ adı" error={errors.wifiName} optional>
            <Input
              value={values.wifiName}
              onChange={(event) => set("wifiName", event.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              maxLength={64}
            />
          </Field>
          <Field
            label="Wi-Fi şifresi"
            hint="Menüyü açan herkes görebilir; yalnız misafir ağının şifresini girin."
            error={errors.wifiPassword}
            optional
          >
            <Input
              value={values.wifiPassword}
              onChange={(event) => set("wifiPassword", event.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={64}
            />
          </Field>
        </CardContent>
      </Card>

      {dirty && (
        <div className="sticky bottom-4 z-20 flex justify-center">
          <div
            role="region"
            aria-label="Kaydedilmemiş değişiklikler"
            className="flex w-full items-center justify-between gap-3 rounded-full bg-surface py-2 pr-2 pl-5 shadow-float sm:w-auto sm:justify-start sm:gap-5"
          >
            <p className="text-sm font-medium">Kaydedilmemiş değişiklikler</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={isPending}>
                Vazgeç
              </Button>
              <Button type="submit" size="sm" loading={isPending}>
                Değişiklikleri kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
