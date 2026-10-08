import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// latin-ext carries the Turkish glyphs (ç ğ ı ö ş ü İ).
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Menura — Akıllı QR Menü",
    template: "%s · Menura",
  },
  description:
    "Restoranınız için dakikalar içinde şık bir dijital menü oluşturun, QR kodla misafirlerinizle paylaşın ve menünüzü anında güncelleyin.",
  applicationName: "Menura",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
