"use client";

import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useFocusInvalid } from "@/features/auth/components/use-focus-invalid";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { updateSlug } from "../actions";
import { updateSlugSchema } from "../schema";
import { SlugField } from "./slug-field";

type SlugCardProps = { slug: string; host: string };

export function SlugCard({ slug: initialSlug, host }: SlugCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [savedSlug, setSavedSlug] = useState(initialSlug);
  const [slug, setSlug] = useState(initialSlug);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { formRef, requestFocus } = useFocusInvalid();

  const changed = slug !== savedSlug;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = updateSlugSchema.safeParse({ slug });
    if (!parsed.success) {
      setErrors(fromZodError(parsed.error).fieldErrors);
      requestFocus();
      return;
    }
    setErrors({});
    setConfirmOpen(true);
  }

  async function save() {
    const result = await updateSlug({ slug });
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      if (result.fieldErrors) requestFocus();
      else toast.error(result.error);
      return false;
    }
    setSavedSlug(result.data.slug);
    setSlug(result.data.slug);
    toast.success("Menü adresi güncellendi. QR kodunuzu yeniden indirin.");
    startTransition(() => router.refresh());
    return true;
  }

  return (
    <Card>
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <CardHeader>
          <CardTitle>Menü adresi</CardTitle>
          <CardDescription>Misafirlerin menünüze ulaştığı bağlantı.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SlugField value={slug} onChange={setSlug} host={host} error={errors.slug} disabled={isPending} />
          <div className="flex gap-3 rounded-md bg-warning-soft p-3.5 text-sm text-fg">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />
            <p>
              <strong className="font-semibold">Adresi değiştirirseniz basılı QR kodlarınız çalışmaz.</strong> Eski
              adres artık menünüzü göstermez; yeni QR kodu indirip yeniden basmanız gerekir.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={!changed} loading={isPending} className="w-full sm:w-auto">
            Adresi değiştir
          </Button>
        </CardFooter>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Menü adresi değiştirilsin mi?"
        description={`Eski adres (${host}/m/${savedSlug}) çalışmayı bırakır. Basılı QR kodlarınızı yenilerini indirip değiştirmeniz gerekir.`}
        confirmLabel="Adresi değiştir"
        destructive
        onConfirm={save}
      />
    </Card>
  );
}
