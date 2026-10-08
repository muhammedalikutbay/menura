"use client";

import type { Route } from "next";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { IconButton, buttonVariants } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

/** Below 768px the header collapses to logo + CTA + this menu button, which opens a bottom sheet. */
export function MobileMenu({
  links,
  signedIn,
}: {
  links: ReadonlyArray<{ href: string; label: string }>;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <IconButton aria-label="Menüyü aç" aria-haspopup="dialog" className="md:hidden" onClick={() => setOpen(true)}>
        <Menu aria-hidden="true" />
      </IconButton>
      <Sheet open={open} onOpenChange={setOpen} title="Menü" hideTitle>
        <nav aria-label="Mobil menü" className="flex flex-col">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href} className="border-b border-border last:border-b-0">
                <Link
                  href={link.href as Route}
                  onClick={close}
                  className="type-title flex min-h-14 items-center rounded-md text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            {signedIn ? (
              <Link href={"/dashboard" as Route} onClick={close} className={buttonVariants({ size: "lg" })}>
                Panele git
              </Link>
            ) : (
              <>
                <Link href={"/register" as Route} onClick={close} className={buttonVariants({ size: "lg" })}>
                  Ücretsiz başla
                </Link>
                <Link
                  href={"/login" as Route}
                  onClick={close}
                  className={buttonVariants({ variant: "secondary", size: "lg" })}
                >
                  Giriş yap
                </Link>
              </>
            )}
          </div>
        </nav>
      </Sheet>
    </>
  );
}
