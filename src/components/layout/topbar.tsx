"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  "categories": "Kategoriler",
  "products": "Ürünler",
  "qr": "QR Kod Yönetimi",
};

export function Topbar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-divider bg-white/80 backdrop-blur-default px-6">
      <nav className="flex items-center space-x-2 text-callout">
        <Link 
          href="/" 
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          Menura
        </Link>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = routeLabels[segment] || segment;

          return (
            <div key={href} className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-border"><path d="m9 18 6-6-6-6"/></svg>
              {isLast ? (
                <span className="font-semibold text-text-primary">{label}</span>
              ) : (
                <Link 
                  href={href} 
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <button className="p-2 text-text-secondary hover:text-text-primary transition-colors hover:bg-bg-secondary rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <button className="p-2 text-text-secondary hover:text-text-primary transition-colors hover:bg-bg-secondary rounded-md relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
}
