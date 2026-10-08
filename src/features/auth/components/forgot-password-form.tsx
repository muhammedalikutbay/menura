"use client";

import { MailCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { authClient } from "@/lib/auth-client";
import { GENERIC_AUTH_ERROR, RATE_LIMIT_MESSAGE } from "../errors";
import { forgotPasswordSchema } from "../schema";
import { FormError } from "./auth-card";
import { useFocusInvalid } from "./use-focus-invalid";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { formRef, requestFocus } = useFocusInvalid();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({ email: data.get("email") });
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
        const { error } = await authClient.requestPasswordReset({
          email: parsed.data.email,
          redirectTo: "/reset-password",
        });
        // Never reveal whether the address belongs to an account: every answer except
        // rate limiting looks like success.
        if (error?.status === 429) {
          setFormError(RATE_LIMIT_MESSAGE);
          return;
        }
        setSent(true);
      } catch {
        setFormError(GENERIC_AUTH_ERROR);
      }
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center" role="status">
        <div aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent-text">
          <MailCheck className="size-6" />
        </div>
        <p className="text-base">
          Bu e-posta adresiyle kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderdik. Gelen kutunuzu ve
          gereksiz e-posta klasörünü kontrol edin.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormError>{formError}</FormError>

      <Field label="E-posta" error={errors.email} required>
        <Input name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} autoFocus />
      </Field>

      <Button type="submit" size="lg" loading={isPending}>
        Sıfırlama bağlantısı gönder
      </Button>
    </form>
  );
}
