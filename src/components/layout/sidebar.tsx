"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="15" rx="1"/></svg>
    )
  },
  { 
    name: "Kategoriler", 
    href: "/categories",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    )
  },
  { 
    name: "Ürünler", 
    href: "/products",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
    )
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-divider bg-white">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-action flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">Menura</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-callout font-medium transition-all duration-200",
                isActive
                  ? "bg-action/10 text-action shadow-sm"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <span className={cn(
                "transition-colors",
                isActive ? "text-action" : "text-text-secondary group-hover:text-text-primary"
              )}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-divider p-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-bg-secondary transition-colors cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-action/10 flex items-center justify-center text-action font-semibold text-sm">
            MA
          </div>
          <div className="flex flex-col flex-1 truncate">
            <span className="text-caption font-semibold text-text-primary truncate">Muhammed Ali</span>
            <span className="text-[11px] text-text-secondary">Premium Üye</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  );
}
