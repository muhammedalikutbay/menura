import Link from "next/link";

export function MenuFooter({ showVatNote }: { showVatNote: boolean }) {
  return (
    <footer className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-2 border-t border-border px-4 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-sm text-fg-muted">
      {showVatNote && <p>Fiyatlarımıza KDV dahildir.</p>}
      <p>Alerjen bilgisi için lütfen personelimize danışın.</p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-11 items-center rounded-md px-3 text-xs underline-offset-4 hover:text-fg hover:underline"
      >
        Menura ile hazırlandı
      </Link>
    </footer>
  );
}
