import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// latin-ext carries the Turkish glyphs (ç ğ ı ö ş ü İ).
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

// Display accent: one italic word or phrase per headline, never body text.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
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
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
