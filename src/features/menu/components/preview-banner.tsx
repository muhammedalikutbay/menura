import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

/** Shown only to the owner while the menu is not published yet. */
export function PreviewBanner() {
  return (
    <div className="bg-fg text-bg">
      <div className="mx-auto flex min-h-11 max-w-2xl items-center justify-between gap-3 px-4 py-2 text-sm">
        <p className="font-medium">Önizleme: menünüz henüz yayında değil</p>
        <Link
          href={"/dashboard/appearance" as Route}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md px-1 font-semibold underline-offset-4 hover:underline"
        >
          Ayarlara git
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </div>
  );
}
