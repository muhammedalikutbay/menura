import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/app-shell/logo";
import { AuthGlow } from "@/features/auth/components/auth-card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-canvas px-4 py-6 sm:py-10">
      <AuthGlow />

      <header className="relative mx-auto flex w-full max-w-md justify-center">
        <Link
          href={"/" as Route}
          aria-label="Menura ana sayfa"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Logo />
        </Link>
      </header>

      <main id="main-content" className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
        {children}
      </main>

      <footer className="relative mx-auto flex w-full max-w-md justify-center">
        <Link
          href={"/" as Route}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-medium text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Ana sayfaya dön
        </Link>
      </footer>
    </div>
  );
}
