import type { Metadata, Route } from "next";
import Link from "next/link";
import { Logo } from "@/components/app-shell/logo";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sayfa bulunamadı" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-bg px-4 py-16 text-center">
      <Link href="/" aria-label="Menura — Ana sayfa" className="rounded-sm">
        <Logo />
      </Link>
      <div className="flex max-w-md flex-col items-center gap-3">
        <p className="text-sm font-semibold text-accent-text">404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Sayfa bulunamadı</h1>
        <p className="text-base text-fg-muted">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir. Adresi kontrol edin ya da ana sayfaya
          dönün.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants()}>
          Ana sayfaya dön
        </Link>
        <Link href={"/dashboard" as Route} className={buttonVariants({ variant: "outline" })}>
          Panele git
        </Link>
      </div>
    </main>
  );
}
