import type { Metadata, Route } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { redirectIfSignedIn } from "@/features/auth/server";
import { env } from "@/server/env";

export const metadata: Metadata = { title: "Şifremi unuttum" };

export default async function ForgotPasswordPage() {
  await redirectIfSignedIn();

  if (!env.isEmailEnabled) {
    return (
      <AuthCard
        title="Şifre sıfırlama kullanılamıyor"
        description="Bu kurulumda e-posta gönderimi yapılandırılmamış, bu yüzden şifre sıfırlama bağlantısı gönderemiyoruz. Lütfen site yöneticisiyle iletişime geçin."
      >
        <Link href={"/login" as Route} className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}>
          Girişe dön
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Şifrenizi mi unuttunuz?"
      description="E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim."
      footer={
        <Link href={"/login" as Route} className="font-medium text-accent-text hover:underline">
          Girişe dön
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
