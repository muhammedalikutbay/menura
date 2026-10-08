import type { Metadata, Route } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";
import { redirectIfSignedIn } from "@/features/auth/server";
import { env } from "@/server/env";

export const metadata: Metadata = { title: "Kayıt ol" };

export default async function RegisterPage() {
  await redirectIfSignedIn();

  return (
    <AuthCard
      title="Hesabınızı oluşturun"
      description="Dakikalar içinde dijital menünüzü hazırlamaya başlayın."
      footer={
        <>
          Zaten hesabınız var mı?
          <Link href={"/login" as Route} className="font-medium text-accent-text hover:underline">
            Giriş yapın
          </Link>
        </>
      }
    >
      <RegisterForm requiresVerification={env.isEmailEnabled} />
    </AuthCard>
  );
}
