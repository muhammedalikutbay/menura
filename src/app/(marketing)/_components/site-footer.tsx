import type { Route } from "next";
import Link from "next/link";
import { Logo } from "@/components/app-shell/logo";
import { NAV_LINKS } from "./site-header";

type FooterLink = { href: string; label: string };

const LEGAL_LINKS: FooterLink[] = [
  { href: "/privacy", label: "KVKK aydınlatma metni" },
  { href: "/terms", label: "Kullanım koşulları" },
];

const ACCOUNT_LINKS: FooterLink[] = [
  { href: "/login", label: "Giriş yap" },
  { href: "/register", label: "Kayıt ol" },
];

const WORDMARK_GRADIENT =
  "linear-gradient(to bottom, color-mix(in oklab, var(--color-ink-fg) 12%, transparent), var(--color-ink-fg))";

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<FooterLink> }) {
  return (
    <div>
      <h2 className="type-caption text-ink-fg/70">{title}</h2>
      <ul className="mt-3 flex flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href as Route}
              className="type-body inline-flex min-h-10 items-center rounded-sm text-ink-fg/90 transition-colors hover:text-ink-fg"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Ink footer with rounded top corners and a giant gradient wordmark cropped at the bottom edge. */
export function SiteFooter({ showDemo }: { showDemo: boolean }) {
  const productLinks: FooterLink[] = [...NAV_LINKS, ...(showDemo ? [{ href: "/m/demo", label: "Demo menü" }] : [])];

  return (
    <footer className="overflow-hidden rounded-t-xl bg-ink text-ink-fg">
      <div className="mx-auto w-full max-w-[1120px] px-4 pt-16 sm:px-6 md:pt-20 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr] md:gap-16">
          <div className="flex flex-col items-start gap-5">
            <Logo />
            <p className="type-title max-w-[16ch] text-ink-fg/90">Daha iyi menüler, daha az baskı.</p>
          </div>
          <nav aria-label="Alt bilgi" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            <FooterColumn title="Ürün" links={productLinks} />
            <FooterColumn title="Yasal" links={LEGAL_LINKS} />
            <FooterColumn title="Hesap" links={ACCOUNT_LINKS} />
          </nav>
        </div>

        <p className="type-caption mt-14 border-t border-ink-fg/12 pt-6 text-ink-fg/70">
          &copy; {new Date().getFullYear()} Menura. Tüm hakları saklıdır.
        </p>
      </div>

      {/* Decorative wordmark: fades in from the top and is cut off by the bottom edge. */}
      <div aria-hidden="true" className="mt-6 overflow-hidden select-none">
        <p
          style={{ backgroundImage: WORDMARK_GRADIENT }}
          className="translate-y-[0.12em] bg-clip-text text-center text-[clamp(80px,19vw,220px)] leading-[0.78] font-semibold tracking-[-0.05em] text-transparent"
        >
          Menura
        </p>
      </div>
    </footer>
  );
}
