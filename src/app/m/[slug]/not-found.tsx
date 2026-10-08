import { UtensilsCrossed } from "lucide-react";

export default function MenuNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-full bg-surface-muted text-fg-muted"
      >
        <UtensilsCrossed className="size-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Menü bulunamadı</h1>
      <p className="text-base text-fg-muted text-pretty">
        Bu adreste yayında bir menü yok. QR kodu yeniden okutmayı veya adresi kontrol etmeyi deneyin; menü
        geçici olarak yayından kaldırılmış olabilir.
      </p>
    </main>
  );
}
