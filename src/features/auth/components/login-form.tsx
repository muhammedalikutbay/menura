"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, GENERIC_AUTH_ERROR } from "../errors";
import { loginSchema } from "../schema";
import { FormError } from "./auth-card";
import { PasswordInput } from "./password-input";
import { useFocusInvalid } from "./use-focus-invalid";

type LoginFormProps = {
  /** Already sanitized by the page (see safeNextPath). */
  next: string;
  /** "Şifremi unuttum" is only useful when the server can send e-mail. */
  showForgotLink: boolean;
};

export function LoginForm({ next, showForgotLink }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { formRef, requestFocus } = useFocusInvalid();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({ email: data.get("email"), password: data.get("password") });
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
        const { error } = await authClient.signIn.email(parsed.data);
        if (error) {
          setFormError(authErrorMessage(error, GENERIC_AUTH_ERROR));
          return;
        }
        setRedirecting(true);
        router.replace(next as Route);
        router.refresh();
      } catch {
        setFormError(GENERIC_AUTH_ERROR);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormError>{formError}</FormError>

      <Field label="E-posta" error={errors.email} required>
        <Input name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} autoFocus />
      </Field>

      <div className="flex flex-col gap-2">
        <Field label="Şifre" error={errors.password} required>
          <PasswordInput name="password" autoComplete="current-password" />
        </Field>
        {showForgotLink && (
          <Link
            href={"/forgot-password" as Route}
            className="inline-flex min-h-8 items-center self-end rounded-sm text-sm font-medium text-accent-text hover:underline"
          >
            Şifremi unuttum
          </Link>
        )}
      </div>

      <Button type="submit" size="lg" loading={isPending || redirecting}>
        Giriş yap
      </Button>
    </form>
  );
}
