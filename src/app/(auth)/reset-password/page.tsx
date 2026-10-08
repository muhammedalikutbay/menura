import type { Metadata, Route } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { env } from "@/server/env";

export const metadata: Metadata = { title: "Yeni şifre belirle" };

type SearchParams = Promise<{ token?: string | string[]; error?: string | string[] }>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// No signed-in redirect here: whoever holds a valid reset link may use it.
export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const token = first(params.token);
  const newLinkHref = env.isEmailEnabled ? "/forgot-password" : null;

  // Better Auth redirects here with ?error=INVALID_TOKEN for unknown or expired links.
  if (!token || first(params.error)) {
    return (
      <AuthCard
        title="Bağlantı geçersiz"
        description="Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Güvenliğiniz için bağlantılar 1 saat geçerlidir."
      >
        <Link
          href={(newLinkHref ?? "/login") as Route}
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          {newLinkHref ? "Yeni bağlantı iste" : "Girişe dön"}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Yeni şifre belirleyin" description="Hesabınız için yeni bir şifre seçin.">
      <ResetPasswordForm token={token} newLinkHref={newLinkHref} />
    </AuthCard>
  );
}
