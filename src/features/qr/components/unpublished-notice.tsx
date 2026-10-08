import type { Route } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

/** Shown while the menu is a draft: a scanned QR code leads to "Menü bulunamadı". */
export function UnpublishedQrNotice() {
  return (
    <div role="status" className="flex gap-3 rounded-lg bg-warning-soft p-4 text-warning print:hidden">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-semibold">Menünüz henüz yayında değil</p>
        <p>
          Menünüzü yayınlayana kadar bu QR kodu okutan misafirler &ldquo;Menü bulunamadı&rdquo; sayfasını görür.{" "}
          <Link href={"/dashboard/settings" as Route} className="font-medium underline underline-offset-4">
            Ayarlardan yayınlayın
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
