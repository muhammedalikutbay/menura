"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, GENERIC_AUTH_ERROR } from "../errors";
import { FormError } from "./auth-card";
import { useFocusInvalid } from "./use-focus-invalid";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Adınızı girin.").max(80, "Ad en fazla 80 karakter olabilir."),
});

export function ProfileCard({ name: initialName, email }: { name: string; email: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [savedName, setSavedName] = useState(initialName);
  const [name, setName] = useState(initialName);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { formRef, requestFocus } = useFocusInvalid();

  const dirty = name.trim() !== savedName;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = profileSchema.safeParse({ name });
    if (!parsed.success) {
      setErrors(fromZodError(parsed.error).fieldErrors);
      setFormError(null);
      requestFocus();
      return;
    }
    setErrors({});
    setFormError(null);

    startTransition(async () => {
      try {
        const { error } = await authClient.updateUser({ name: parsed.data.name });
        if (error) {
          setFormError(authErrorMessage(error, GENERIC_AUTH_ERROR));
          return;
        }
        setSavedName(parsed.data.name);
        setName(parsed.data.name);
        toast.success("Profiliniz güncellendi.");
        router.refresh();
      } catch {
        setFormError(GENERIC_AUTH_ERROR);
      }
    });
  }

  return (
    <Card>
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Panelde görünen adınız ve giriş yaptığınız e-posta adresi.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormError>{formError}</FormError>
          <Field label="Ad" error={errors.name} required>
            <Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={80} />
          </Field>
          <Field label="E-posta" hint="E-posta adresi şimdilik değiştirilemez.">
            <Input value={email} readOnly type="email" autoComplete="email" />
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={isPending} disabled={!dirty} className="w-full sm:w-auto">
            Kaydet
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
