"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, GENERIC_AUTH_ERROR } from "../errors";
import { changePasswordSchema, PASSWORD_MIN } from "../schema";
import { FormError } from "./auth-card";
import { PasswordInput } from "./password-input";
import { ProfileCard } from "./profile-card";
import { useFocusInvalid } from "./use-focus-invalid";

function ChangePasswordCard() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { formRef, requestFocus } = useFocusInvalid();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const parsed = changePasswordSchema.safeParse({
      currentPassword: data.get("currentPassword"),
      newPassword: data.get("newPassword"),
      newPasswordConfirm: data.get("newPasswordConfirm"),
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
        const { error } = await authClient.changePassword({
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.newPassword,
          revokeOtherSessions: true,
        });
        if (error) {
          if (error.code === "INVALID_PASSWORD") {
            setErrors({ currentPassword: ["Mevcut şifre hatalı."] });
            requestFocus();
          } else {
            setFormError(authErrorMessage(error, GENERIC_AUTH_ERROR));
          }
          return;
        }
        form.reset();
        toast.success("Şifreniz değiştirildi. Diğer cihazlardaki oturumlar kapatıldı.");
      } catch {
        setFormError(GENERIC_AUTH_ERROR);
      }
    });
  }

  return (
    <Card>
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <CardHeader>
          <CardTitle>Şifre</CardTitle>
          <CardDescription>Şifrenizi değiştirdiğinizde diğer cihazlardaki oturumlarınız kapatılır.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormError>{formError}</FormError>
          <Field label="Mevcut şifre" error={errors.currentPassword} required>
            <PasswordInput name="currentPassword" autoComplete="current-password" />
          </Field>
          <Field label="Yeni şifre" hint={`En az ${PASSWORD_MIN} karakter.`} error={errors.newPassword} required>
            <PasswordInput name="newPassword" autoComplete="new-password" />
          </Field>
          <Field label="Yeni şifre (tekrar)" error={errors.newPasswordConfirm} required>
            <PasswordInput name="newPasswordConfirm" autoComplete="new-password" />
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={isPending} className="w-full sm:w-auto">
            Şifreyi değiştir
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function DeleteAccountCard({ restaurantName }: { restaurantName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [typedName, setTypedName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const nameMatches = typedName.trim() === restaurantName.trim();

  function handleOpenChange(next: boolean) {
    if (isPending) return;
    setOpen(next);
    if (!next) {
      setTypedName("");
      setPassword("");
      setPasswordError(null);
      setFormError(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nameMatches || !password) return;
    setPasswordError(null);
    setFormError(null);

    startTransition(async () => {
      try {
        const { error } = await authClient.deleteUser({ password });
        if (error) {
          if (error.code === "INVALID_PASSWORD") setPasswordError("Şifre hatalı.");
          else setFormError(authErrorMessage(error, "Hesap silinemedi. Lütfen tekrar deneyin."));
          return;
        }
        toast.success("Hesabınız silindi.");
        router.replace("/" as Route);
        router.refresh();
      } catch {
        setFormError("Hesap silinemedi. Lütfen tekrar deneyin.");
      }
    });
  }

  return (
    <Card className="border-danger/40">
      <CardHeader>
        <CardTitle className="text-danger">Tehlikeli bölge</CardTitle>
        <CardDescription>
          Hesabınız, restoranınız, tüm kategoriler, ürünler ve görseller kalıcı olarak silinir. QR kodlarınız
          çalışmaz. Bu işlem geri alınamaz.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <Button variant="destructive" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
          Hesabı sil
        </Button>
      </CardFooter>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          title="Hesabı silmek istediğinize emin misiniz?"
          description="Tüm verileriniz kalıcı olarak silinir ve geri getirilemez."
          showClose={!isPending}
        >
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <FormError>{formError}</FormError>
            <Field
              label={`Onaylamak için “${restaurantName}” yazın`}
              required
            >
              <Input
                value={typedName}
                onChange={(event) => setTypedName(event.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
            </Field>
            <Field label="Şifreniz" error={passwordError ?? undefined} required>
              <PasswordInput
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <DialogFooter>
              <Button variant="secondary" disabled={isPending} onClick={() => handleOpenChange(false)}>
                Vazgeç
              </Button>
              <Button type="submit" variant="destructive" loading={isPending} disabled={!nameMatches || !password}>
                Hesabı kalıcı olarak sil
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function AccountSection({
  restaurantName,
  userName,
  userEmail,
}: {
  restaurantName: string;
  userName: string;
  userEmail: string;
}) {
  return (
    <>
      <ProfileCard name={userName} email={userEmail} />
      <ChangePasswordCard />
      <DeleteAccountCard restaurantName={restaurantName} />
    </>
  );
}
