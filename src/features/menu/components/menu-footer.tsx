import Link from "next/link";
import type { MenuMode } from "./menu-mode";

const platformLinkClass =
  "mt-2 inline-flex min-h-11 items-center rounded-md px-3 text-xs underline-offset-4 hover:text-fg hover:underline";

export function MenuFooter({ showVatNote, mode = "page" }: { showVatNote: boolean; mode?: MenuMode }) {
  return (
    <footer className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-2 border-t border-border px-4 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-sm text-fg-muted">
      {showVatNote && <p>Fiyatlarımıza KDV dahildir.</p>}
      <p>Alerjen bilgisi için lütfen personelimize danışın.</p>
      {mode === "embedded" ? (
        <span className={platformLinkClass}>Menura ile hazırlandı</span>
      ) : (
        <Link href="/" className={platformLinkClass}>
          Menura ile hazırlandı
        </Link>
      )}
    </footer>
  );
}
