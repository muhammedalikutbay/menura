"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Logo } from "@/components/app-shell/logo";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-bg px-4 py-16 text-center">
      <Link href="/" aria-label="Menura — Ana sayfa" className="rounded-sm">
        <Logo />
      </Link>
      <div role="alert" className="flex max-w-md flex-col items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Bir şeyler ters gitti</h1>
        <p className="text-base text-fg-muted">
          Beklenmedik bir hata oluştu. Sayfayı yeniden yüklemeyi deneyin; sorun sürerse biraz sonra tekrar gelin.
        </p>
        {error.digest && <p className="text-sm text-fg-muted">Hata kodu: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>
          <RefreshCw aria-hidden="true" />
          Tekrar dene
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Ana sayfaya dön
        </Link>
      </div>
    </main>
  );
}
