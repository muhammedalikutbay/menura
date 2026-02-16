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
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-divider bg-white/90 backdrop-blur-default px-8 shadow-sm">
      {/* Branding & Navigation */}
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-action flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
            M
          </div>
          <span className="text-2xl font-black text-text-primary tracking-tighter uppercase italic">Menura</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Panel", href: "/" },
            { label: "Kategoriler", href: "/categories" },
            { label: "Ürünler", href: "/products" }
          ].map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "text-[13px] font-black uppercase tracking-[0.15em] transition-all",
                pathname === item.href 
                  ? "text-action border-b-2 border-action pb-1" 
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <button className="p-2 text-text-secondary hover:text-action transition-all hover:bg-action/5 rounded-xl border border-divider/40 group" title="Bilgi">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </button>

        <div className="h-8 w-[1px] bg-divider" />

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-black text-text-primary uppercase tracking-widest">M. Ali Kutbay</span>
            <span className="text-[9px] font-bold text-action/70 uppercase">PRO PLAN</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-action/10 flex items-center justify-center text-action font-black text-sm border-2 border-white shadow-md group-hover:scale-105 transition-transform">
            MA
          </div>
        </div>
      </div>
    </header>
  );
}
