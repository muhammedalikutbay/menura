"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DashboardNav } from "./dashboard-nav";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";

type DashboardShellProps = {
  restaurant: { name: string; slug: string; isPublished: boolean };
  user: { name: string; email: string };
  children: React.ReactNode;
};

function SidebarBody({
  restaurant,
  user,
  onNavigate,
}: Omit<DashboardShellProps, "children"> & { onNavigate?: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-md bg-surface-muted p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-semibold">{restaurant.name}</p>
          <Badge variant={restaurant.isPublished ? "success" : "neutral"}>
            {restaurant.isPublished ? "Yayında" : "Taslak"}
          </Badge>
        </div>
        <Link
          href={`/m/${restaurant.slug}` as Route}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-sm text-sm font-medium text-accent-text hover:underline"
        >
          Menüyü görüntüle
          <ExternalLink aria-hidden="true" className="size-3.5" />
          <span className="sr-only">(yeni sekmede açılır)</span>
        </Link>
      </div>

      <DashboardNav onNavigate={onNavigate} />

      <div className="mt-auto border-t border-border pt-3">
        <UserMenu user={user} />
      </div>
    </div>
  );
}

export function DashboardShell({ restaurant, user, children }: DashboardShellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-surface px-4 py-2 text-sm font-medium shadow-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        İçeriğe geç
      </a>

      {/* Desktop sidebar */}
      <aside className="print:hidden fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r border-border bg-surface p-4 lg:flex">
        <Link href={"/dashboard" as Route} className="rounded-sm px-2 pt-1" aria-label="Menura — Genel bakış">
          <Logo />
        </Link>
        <SidebarBody restaurant={restaurant} user={user} />
      </aside>

      {/* Mobile top bar */}
      <header className="print:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/85 px-4 backdrop-blur lg:hidden">
        <Link href={"/dashboard" as Route} className="rounded-sm" aria-label="Menura — Genel bakış">
          <Logo />
        </Link>
        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menüyü aç">
              <Menu aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <DialogContent title="Menü" className="gap-5">
            <SidebarBody restaurant={restaurant} user={user} onNavigate={() => setSheetOpen(false)} />
          </DialogContent>
        </Dialog>
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none lg:pl-64 print:p-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
