"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type NavItem = { href: Route; label: string; exact?: boolean };

// Cast to Route: typed routes are generated at build time.
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard" as Route, label: "Genel bakış", exact: true },
  { href: "/dashboard/menu" as Route, label: "Menü" },
  { href: "/dashboard/restaurant" as Route, label: "Restoran" },
  { href: "/dashboard/appearance" as Route, label: "Görünüm" },
  { href: "/dashboard/qr" as Route, label: "QR kod" },
];

export function isNavActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Horizontal pill links (desktop header) or a vertical list (bottom sheet). */
export function DashboardNav({
  orientation = "horizontal",
  onNavigate,
}: {
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const vertical = orientation === "vertical";

  return (
    <nav aria-label="Ana menü">
      <ul className={cn("flex", vertical ? "flex-col gap-1" : "items-center gap-1")}>
        {NAV_ITEMS.map(({ href, label, exact }) => {
          const active = isNavActive(pathname, href, exact);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center text-[15px] font-medium transition-colors",
                  vertical ? "min-h-11 w-full rounded-md px-3" : "h-10 rounded-full px-3.5",
                  active ? "text-fg" : "text-fg-muted hover:text-fg",
                  vertical && active && "bg-surface-muted",
                  !vertical &&
                    active &&
                    "after:absolute after:inset-x-3.5 after:bottom-1 after:h-0.5 after:rounded-full after:bg-fg",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
