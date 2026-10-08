import type { Route } from "next";
import Link from "next/link";
import { Logo } from "@/components/app-shell/logo";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/server/session";

const NAV_LINKS = [
  { href: "/#ozellikler", label: "Özellikler" },
  { href: "/#nasil-calisir", label: "Nasıl çalışır?" },
  { href: "/#sss", label: "Sık sorulanlar" },
] as const;

export async function SiteHeader() {
  const session = await getSession().catch(() => null);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Menura — Ana sayfa" className="rounded-sm">
          <Logo />
        </Link>

        <nav aria-label="Site menüsü" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href as Route}
              className="rounded-md px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {session ? (
            <Link href={"/dashboard" as Route} className={buttonVariants({ size: "sm" })}>
              Panele git
            </Link>
          ) : (
            <>
              <Link href={"/login" as Route} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Giriş yap
              </Link>
              <Link href={"/register" as Route} className={buttonVariants({ size: "sm" })}>
                <span className="sm:hidden">Başla</span>
                <span className="hidden sm:inline">Ücretsiz başla</span>
                <span className="sr-only sm:hidden"> (ücretsiz)</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
