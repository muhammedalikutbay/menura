import Link from "next/link";
import type { MenuMode } from "./menu-mode";

const platformLinkClass =
  "type-caption mt-2 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-fg-muted underline-offset-4 hover:text-fg hover:underline";

function PlatformMark() {
  return <i aria-hidden="true" className="gradient-brand size-4 rounded-[5px]" />;
}

export function MenuFooter({ showVatNote, mode = "page" }: { showVatNote: boolean; mode?: MenuMode }) {
  return (
    <footer className="type-caption mx-auto mt-12 flex max-w-2xl flex-col items-center gap-1 border-t border-border px-4 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-fg-muted">
      {showVatNote && <p>Fiyatlarımıza KDV dahildir.</p>}
      <p>Alerjen bilgisi için lütfen personelimize danışın.</p>
      {mode === "embedded" ? (
        <span className={platformLinkClass}>
          <PlatformMark />
          Menura ile hazırlandı
        </span>
      ) : (
        <Link href="/" className={platformLinkClass}>
          <PlatformMark />
          Menura ile hazırlandı
        </Link>
      )}
    </footer>
  );
}
