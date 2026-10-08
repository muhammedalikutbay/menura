"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, GENERIC_AUTH_ERROR } from "../errors";
import { PASSWORD_MIN, registerSchema } from "../schema";
import { FormError } from "./auth-card";
import { PasswordInput } from "./password-input";
import { useFocusInvalid } from "./use-focus-invalid";

const linkClass = "font-medium text-accent-text underline-offset-4 hover:underline";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { formRef, requestFocus } = useFocusInvalid();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      password: data.get("password"),
      passwordConfirm: data.get("passwordConfirm"),
      consent,
    });
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
        const { name, email, password } = parsed.data;
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) {
          if (error.code === "USER_ALREADY_EXISTS" || error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
            setErrors({ email: [authErrorMessage(error)] });
            requestFocus();
          } else {
            setFormError(authErrorMessage(error, GENERIC_AUTH_ERROR));
          }
          return;
        }
        setRedirecting(true);
        router.replace("/onboarding" as Route);
        router.refresh();
      } catch {
        setFormError(GENERIC_AUTH_ERROR);
      }
    });
  }

  const consentError = errors.consent?.[0];

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormError>{formError}</FormError>

      <Field label="Ad soyad" error={errors.name} required>
        <Input name="name" autoComplete="name" autoFocus />
      </Field>

      <Field label="E-posta" error={errors.email} required>
        <Input name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} />
      </Field>

      <Field label="Şifre" hint={`En az ${PASSWORD_MIN} karakter.`} error={errors.password} required>
        <PasswordInput name="password" autoComplete="new-password" />
      </Field>

      <Field label="Şifre (tekrar)" error={errors.passwordConfirm} required>
        <PasswordInput name="passwordConfirm" autoComplete="new-password" />
      </Field>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(value) => setConsent(value === true)}
            aria-invalid={consentError ? true : undefined}
            aria-required="true"
            // Links inside the label are dropped from the computed name of a role="checkbox" button.
            aria-label="Gizlilik Politikası'nı ve Kullanım Koşulları'nı okudum; kişisel verilerimin KVKK kapsamında işlenmesini kabul ediyorum."
            aria-describedby={consentError ? "consent-error" : undefined}
            className="mt-0.5"
          />
          <Label htmlFor="consent" className="text-sm leading-6 font-normal text-fg-muted">
            <Link href={"/privacy" as Route} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Gizlilik Politikası
              <span className="sr-only"> (yeni sekmede açılır)</span>
            </Link>
            &apos;nı ve{" "}
            <Link href={"/terms" as Route} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Kullanım Koşulları
              <span className="sr-only"> (yeni sekmede açılır)</span>
            </Link>
            &apos;nı okudum; kişisel verilerimin KVKK kapsamında işlenmesini kabul ediyorum.
          </Label>
        </div>
        {consentError && (
          <p id="consent-error" role="alert" className="text-sm font-medium text-danger">
            {consentError}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" loading={isPending || redirecting}>
        Hesap oluştur
      </Button>
    </form>
  );
}
