import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/app-shell/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-4 py-6 sm:py-10">
      <header className="mx-auto flex w-full max-w-md justify-center">
        <Link href={"/" as Route} aria-label="Menura ana sayfa" className="rounded-sm">
          <Logo />
        </Link>
      </header>

      <main id="main-content" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
        {children}
      </main>

      <footer className="mx-auto flex w-full max-w-md justify-center">
        <Link
          href={"/" as Route}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Ana sayfaya dön
        </Link>
      </footer>
    </div>
  );
}
