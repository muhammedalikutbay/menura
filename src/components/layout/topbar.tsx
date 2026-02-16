"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  "categories": "Categories",
  "products": "Products",
  "qr": "QR Code Management",
};

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-[49px] w-full items-center justify-between border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md px-6 shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0071E3] transition-transform group-hover:scale-110">
            <path d="M7.5 4.5V7.5H4.5V4.5H7.5V4.5M9 3H3V9H9V3V3M7.5 12.4688V15.4688H4.5V12.4688H7.5V12.4688M9 10.9688H3V16.9688H9V10.9688V10.9688M15.4688 4.5V7.5H12.4688V4.5H15.4688V4.5M16.9688 3H10.9688V9H16.9688V3V3M10.9688 10.9688H12.4688V12.4688H10.9688V10.9688V10.9688M12.4688 12.4688H13.9688V13.9688H12.4688V12.4688V12.4688M13.9688 10.9688H15.4688V12.4688H13.9688V10.9688V10.9688M10.9688 13.9688H12.4688V15.4688H10.9688V13.9688V13.9688M12.4688 15.4688H13.9688V16.9688H12.4688V15.4688V15.4688M13.9688 13.9688H15.4688V15.4688H13.9688V13.9688V13.9688M15.4688 12.4688H16.9688V13.9688H15.4688V12.4688V12.4688M15.4688 15.4688H16.9688V16.9688H15.4688V15.4688V15.4688M18.9844 4.96875C18.4219 4.96875 18 4.54688 18 3.98438V1.96875H15.9844C15.4219 1.96875 15 1.54688 15 0.984375C15 0.421875 15.4219 0 15.9844 0H18.9844C19.5469 0 19.9688 0.421875 19.9688 0.984375V3.98438C19.9688 4.54688 19.5469 4.96875 18.9844 4.96875V4.96875M19.9688 18.9844V15.9844C19.9688 15.4219 19.5469 15 18.9844 15C18.4219 15 18 15.4219 18 15.9844V18H15.9844C15.4219 18 15 18.4219 15 18.9844C15 19.5469 15.4219 19.9688 15.9844 19.9688H18.9844C19.5469 19.9688 19.9688 19.5469 19.9688 18.9844V18.9844M0.984375 19.9688H3.98438C4.54688 19.9688 4.96875 19.5469 4.96875 18.9844C4.96875 18.4219 4.54688 18 3.98438 18H1.96875V15.9844C1.96875 15.4219 1.54688 15 0.984375 15C0.421875 15 0 15.4219 0 15.9844V18.9844C0 19.5469 0.421875 19.9688 0.984375 19.9688V19.9688M0 0.984375V3.98438C0 4.54688 0.421875 4.96875 0.984375 4.96875C1.54688 4.96875 1.96875 4.54688 1.96875 3.98438V1.96875H3.98438C4.54688 1.96875 4.96875 1.54688 4.96875 0.984375C4.96875 0.421875 4.54688 0 3.98438 0H0.984375C0.421875 0 0 0.421875 0 0.984375V0.984375" fill="currentColor" />
          </svg>
          <span className="text-lg font-bold text-[#1D1D1F] tracking-tight">Menura</span>
        </Link>
      </div>

      {/* Navigation - Centered */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-8">
        {[
          { label: "Dashboard", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: "Products", href: "/products" },
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
                  ? "!text-[#0071E3]"
                  : "text-[#86868B] hover:!text-[#0071E3]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <a
          href="https://github.com/muhammedalikutbay/menura"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#86868B] hover:text-[#0071E3] transition-colors"
          title="Project info"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        </a>

        <div className="h-4 w-[1px] bg-[#E5E7EB]" />

        <Link
          href="https://github.com/muhammedalikutbay"
          target="_blank"
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-8 w-8 rounded-full bg-[#0071E3] flex items-center justify-center text-white text-[12px] font-bold shadow-sm shadow-[#0071E3]/20 transition-transform group-hover:scale-110">
            MA
          </div>
        </Link>
      </div>
    </header>
  );
}
