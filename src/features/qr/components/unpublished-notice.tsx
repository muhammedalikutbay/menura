import type { Route } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

/** Shown while the menu is a draft: a scanned QR code leads to "Menü bulunamadı". */
export function UnpublishedQrNotice() {
  return (
    <div role="status" className="flex gap-3 rounded-lg bg-warning-soft p-5 text-warning-text print:hidden sm:p-6">
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface/70">
        <TriangleAlert className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="type-title text-base">Menünüz henüz yayında değil</p>
        <p className="type-body">
          Menünüzü yayınlayana kadar bu QR kodu okutan misafirler &ldquo;Menü bulunamadı&rdquo; sayfasını görür.{" "}
          <Link href={"/dashboard/appearance" as Route} className="font-medium underline underline-offset-4">
            Ayarlardan yayınlayın
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
