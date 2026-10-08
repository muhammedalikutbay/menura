import type { Route } from "next";
import Link from "next/link";
import { Logo } from "@/components/app-shell/logo";

const DEMO_LINK = { href: "/m/demo", label: "Demo menü" } as const;

const FOOTER_LINKS = [
  { href: "/privacy", label: "KVKK aydınlatma metni" },
  { href: "/terms", label: "Kullanım koşulları" },
  { href: "/login", label: "Giriş yap" },
] as const;

export function SiteFooter({ showDemo }: { showDemo: boolean }) {
  const links = showDemo ? [DEMO_LINK, ...FOOTER_LINKS] : FOOTER_LINKS;
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-xs flex-col gap-3">
            <Logo />
            <p className="text-sm text-fg-muted">
              Restoran ve kafeler için hızlı, şık ve her zaman güncel dijital menü.
            </p>
          </div>
          <nav aria-label="Alt bilgi">
            <ul className="flex flex-col gap-1 sm:items-end">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as Route}
                    className="inline-flex min-h-9 items-center rounded-sm text-sm text-fg-muted transition-colors hover:text-fg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="border-t border-border pt-6 text-sm text-fg-muted">
          &copy; {new Date().getFullYear()} Menura. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
