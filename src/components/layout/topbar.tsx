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
  
  return (
    <header className="sticky top-0 z-30 flex h-[49px] w-full items-center justify-between border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md px-6 shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0071E3]">
            <path d="M6.4682 13.117L8.8119 10.7342L3.6557 5.578C3.2651 5.1873 2.5619 5.3045 2.3276 5.8123C1.7416 7.0623 1.9369 8.5858 2.9526 9.6014L6.4682 13.117V13.117M12.0932 11.5936C13.3822 12.1795 15.1791 11.7498 16.5072 10.4608C18.1088 8.8592 18.4213 6.5545 17.1713 5.3436C15.9604 4.1326 13.6947 4.4451 12.0932 6.0076C10.7651 7.3358 10.3354 9.1326 10.9213 10.4217L3.3822 17.9608C3.0697 18.2733 3.0697 18.8201 3.3822 19.1326C3.6947 19.4451 4.2416 19.4451 4.5541 19.1326L9.7104 13.9764L14.8666 19.1326C15.1791 19.4842 15.726 19.4842 16.0385 19.1326C16.351 18.8201 16.351 18.2733 16.0385 17.9608L10.8822 12.8045L12.0932 11.5936V11.5936" fill="currentColor" transform="translate(6 6)"/>
          </svg>
          <span className="text-lg font-bold text-[#1D1D1F] tracking-tight">Menura</span>
        </Link>
      </div>

      {/* Navigation - Centered */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-8">
        {[
          { label: "Dashboard", href: "/" },
          { label: "Kategoriler", href: "/categories" },
          { label: "Ürünler", href: "/products" },
          { label: "QR Codes", href: "/qr" }
        ].map((item) => {
          const isActuallyActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "text-[14px] font-medium transition-colors",
                isActuallyActive 
                  ? "text-[#0071E3]" 
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <button className="text-[#86868B] hover:text-[#1D1D1F] transition-colors" title="Info">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </button>

        <div className="h-4 w-[1px] bg-[#E5E7EB]" />

        <div className="flex items-center gap-3 cursor-pointer group">
           <div className="h-8 w-8 rounded-full bg-[#E5E7EB] overflow-hidden border border-white shadow-sm relative group-hover:opacity-90 transition-opacity">
             <div className="w-full h-full bg-[#FFB088] flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             </div>
           </div>
        </div>
      </div>
    </header>
  );
}
