import type { Route } from "next";
import Link from "next/link";
import { Logo } from "@/components/app-shell/logo";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/server/session";
import { MobileMenu } from "./mobile-menu";

export const NAV_LINKS = [
  { href: "/#ozellikler", label: "Özellikler" },
  { href: "/#nasil-calisir", label: "Nasıl çalışır" },
  { href: "/#sss", label: "SSS" },
] as const;

/** Floating pill header (design-language §4): sticky, 12px from the top, blurred surface. */
export async function SiteHeader() {
  const session = await getSession().catch(() => null);
  const signedIn = Boolean(session);

  return (
    <header className="pointer-events-none sticky top-0 z-30 px-3 pt-3 sm:px-6">
      <div className="pointer-events-auto mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-2 rounded-full bg-surface/80 pr-2.5 pl-5 shadow-float backdrop-blur-xl md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label="Menura — Ana sayfa" className="w-fit rounded-full">
          <Logo />
        </Link>

        <nav aria-label="Site menüsü" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href as Route}
              className="type-body rounded-full px-3.5 py-2 font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1.5">
          {signedIn ? (
            <Link href={"/dashboard" as Route} className={buttonVariants({ size: "sm" })}>
              Panele git
            </Link>
          ) : (
            <>
              <Link
                href={"/login" as Route}
                className={buttonVariants({ variant: "ghost", size: "sm", className: "hidden md:inline-flex" })}
              >
                Giriş yap
              </Link>
              <Link href={"/register" as Route} className={buttonVariants({ size: "sm" })}>
                <span className="sm:hidden">Başla</span>
                <span className="hidden sm:inline">Ücretsiz başla</span>
                <span className="sr-only sm:hidden"> (ücretsiz)</span>
              </Link>
            </>
          )}
          <MobileMenu links={NAV_LINKS} signedIn={signedIn} />
        </div>
      </div>
    </header>
  );
}
