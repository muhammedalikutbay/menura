import type { Metadata, Route } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { safeNextPath } from "@/features/auth/redirect";
import { redirectIfSignedIn } from "@/features/auth/server";
import { env } from "@/server/env";

export const metadata: Metadata = { title: "Giriş yap" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  await redirectIfSignedIn();
  const { next } = await searchParams;

  return (
    <AuthCard
      title="Tekrar hoş geldiniz"
      description="Menünüzü yönetmek için hesabınıza giriş yapın."
      footer={
        <>
          Hesabınız yok mu?
          <Link href={"/register" as Route} className="font-medium text-accent-text hover:underline">
            Kayıt olun
          </Link>
        </>
      }
    >
      <LoginForm next={safeNextPath(next)} showForgotLink={env.isEmailEnabled} />
    </AuthCard>
  );
}
