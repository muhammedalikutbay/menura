"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Last-resort boundary: it replaces the root layout, so it brings its own document and styles.
 * Plain elements only (no router or providers are guaranteed to work here).
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="tr">
      <body>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg px-4 py-16 text-center">
          <title>Bir şeyler ters gitti · Menura</title>
          <div role="alert" className="flex max-w-md flex-col items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Bir şeyler ters gitti</h1>
            <p className="text-base text-fg-muted">
              Uygulama beklenmedik bir hatayla karşılaştı. Sayfayı yeniden yüklemeyi deneyin; sorun sürerse biraz sonra
              tekrar gelin.
            </p>
            {error.digest && <p className="text-sm text-fg-muted">Hata kodu: {error.digest}</p>}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-base font-medium text-accent-fg hover:bg-accent-hover"
            >
              Tekrar dene
            </button>
            {/* A full page load is intended here: the React tree above is broken. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border-strong bg-surface px-5 text-base font-medium text-fg hover:bg-surface-muted"
            >
              Ana sayfaya dön
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
