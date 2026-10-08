"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, QrCode, Settings, Tags, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = { href: Route; label: string; icon: LucideIcon; exact?: boolean };

// Cast to Route: not every target page exists yet while the dashboard is being built.
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard" as Route, label: "Genel bakış", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/categories" as Route, label: "Kategoriler", icon: Tags },
  { href: "/dashboard/products" as Route, label: "Ürünler", icon: UtensilsCrossed },
  { href: "/dashboard/qr" as Route, label: "QR kod", icon: QrCode },
  { href: "/dashboard/settings" as Route, label: "Ayarlar", icon: Settings },
];

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Ana menü">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 text-[15px] font-medium transition-colors",
                  active ? "bg-accent-soft text-accent-text" : "text-fg-muted hover:bg-surface-muted hover:text-fg",
                )}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
