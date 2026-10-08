"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, GENERIC_AUTH_ERROR } from "../errors";
import { PASSWORD_MIN, resetPasswordSchema } from "../schema";
import { FormError } from "./auth-card";
import { PasswordInput } from "./password-input";
import { useFocusInvalid } from "./use-focus-invalid";

type ResetPasswordFormProps = {
  token: string;
  /** Link target for requesting a new reset link; null when e-mail is not configured. */
  newLinkHref: string | null;
};

export function ResetPasswordForm({ token, newLinkHref }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<{ message: string; tokenProblem: boolean } | null>(null);
  const { formRef, requestFocus } = useFocusInvalid();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: data.get("password"),
      passwordConfirm: data.get("passwordConfirm"),
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
        const { error } = await authClient.resetPassword({ newPassword: parsed.data.password, token });
        if (error) {
          setFormError({
            message: authErrorMessage(error, GENERIC_AUTH_ERROR),
            tokenProblem: error.code === "INVALID_TOKEN" || error.code === "TOKEN_EXPIRED",
          });
          return;
        }
        setDone(true);
        toast.success("Şifreniz güncellendi. Şimdi giriş yapabilirsiniz.");
        router.replace("/login" as Route);
      } catch {
        setFormError({ message: GENERIC_AUTH_ERROR, tokenProblem: false });
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormError>{formError?.message}</FormError>
      {formError?.tokenProblem && newLinkHref && (
        <Link
          href={newLinkHref as Route}
          className="-mt-2 text-sm font-medium text-accent-text underline-offset-4 hover:underline"
        >
          Yeni bağlantı iste
        </Link>
      )}

      <Field label="Yeni şifre" hint={`En az ${PASSWORD_MIN} karakter.`} error={errors.password} required>
        <PasswordInput name="password" autoComplete="new-password" autoFocus />
      </Field>

      <Field label="Yeni şifre (tekrar)" error={errors.passwordConfirm} required>
        <PasswordInput name="passwordConfirm" autoComplete="new-password" />
      </Field>

      <Button type="submit" size="lg" loading={isPending || done}>
        Şifreyi güncelle
      </Button>
    </form>
  );
}
