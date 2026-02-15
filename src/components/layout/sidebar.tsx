"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Kategoriler", href: "/categories" },
  { name: "Ürünler", href: "/products" },
  { name: "QR Kod", href: "/qr" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-divider bg-white">
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold text-text-primary tracking-tight">Menura</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-callout font-medium transition-colors",
                isActive
                  ? "bg-bg-secondary text-action"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-divider p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-bg-secondary" />
          <div className="flex flex-col">
            <span className="text-caption font-medium text-text-primary">Admin User</span>
            <span className="text-[10px] text-text-secondary">Premium Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
