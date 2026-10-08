"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink, LogOut, Menu, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DashboardNav } from "./dashboard-nav";
import { Logo, LogoMark } from "./logo";
import { UserMenu, useSignOut } from "./user-menu";

type DashboardShellProps = {
  restaurant: { name: string; slug: string; isPublished: boolean };
  user: { name: string; email: string };
  children: React.ReactNode;
};

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <Link
      href={"/dashboard/appearance" as Route}
      className="shrink-0 rounded-full"
      aria-label={`Menü durumu: ${isPublished ? "Yayında" : "Taslak"}. Görünüm ayarlarına git`}
    >
      <Badge variant={isPublished ? "success" : "neutral"}>{isPublished ? "Yayında" : "Taslak"}</Badge>
    </Link>
  );
}

function ViewMenuLink({ slug, iconOnly = false }: { slug: string; iconOnly?: boolean }) {
  return (
    <Link
      href={`/m/${slug}` as Route}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant: "outline", size: iconOnly ? "icon" : "sm", className: "shrink-0" })}
    >
      <ExternalLink aria-hidden="true" />
      <span className={iconOnly ? "sr-only" : undefined}>Menüyü gör</span>
      <span className="sr-only">(yeni sekmede açılır)</span>
    </Link>
  );
}

function MobileSheet({ restaurant, user }: Omit<DashboardShellProps, "children">) {
  const [open, setOpen] = useState(false);
  const { pending, signOut } = useSignOut();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Gezinme menüsünü aç">
          <Menu aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent title="Menü" className="gap-4">
        <p className="-mt-2 truncate text-sm text-fg-muted">{restaurant.name}</p>
        <DashboardNav orientation="vertical" onNavigate={() => setOpen(false)} />
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <div className="px-3 pb-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-fg-muted">{user.email}</p>
          </div>
          <Link
            href={"/dashboard/account" as Route}
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-[15px] font-medium text-fg-muted hover:bg-surface-muted hover:text-fg"
          >
            <Settings aria-hidden="true" className="size-5" />
            Hesap ayarları
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={() => void signOut()}
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-left text-[15px] font-medium text-fg-muted hover:bg-surface-muted hover:text-fg disabled:opacity-60"
          >
            <LogOut aria-hidden="true" className="size-5" />
            Çıkış yap
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DashboardShell({ restaurant, user, children }: DashboardShellProps) {
  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-surface px-4 py-2 text-sm font-medium shadow-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        İçeriğe geç
      </a>

      <header className="print:hidden sticky top-3 z-30 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-3 rounded-full border border-border bg-surface/80 pr-3 pl-5 shadow-float backdrop-blur">
          {/* Left: logo, restaurant, status */}
          <div className="flex min-w-0 items-center gap-3">
            <Link href={"/dashboard" as Route} className="shrink-0 rounded-sm" aria-label="Menura — Genel bakış">
              <Logo className="max-lg:hidden" />
              <LogoMark className="lg:hidden" />
            </Link>
            <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border max-sm:hidden" />
            <p className="min-w-0 truncate text-sm font-medium max-sm:hidden">{restaurant.name}</p>
            <StatusBadge isPublished={restaurant.isPublished} />
          </div>

          {/* Center: nav (desktop) */}
          <div className="max-lg:hidden">
            <DashboardNav />
          </div>

          {/* Right */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="max-lg:hidden">
              <ViewMenuLink slug={restaurant.slug} />
            </div>
            <div className="lg:hidden">
              <ViewMenuLink slug={restaurant.slug} iconOnly />
            </div>
            <div className="max-lg:hidden">
              <UserMenu user={user} />
            </div>
            <div className="lg:hidden">
              <MobileSheet restaurant={restaurant} user={user} />
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none print:p-0">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
