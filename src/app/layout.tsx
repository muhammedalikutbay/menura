import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Menura - Smart QR Menu",
  description: "Next-gen QR Menu System",
};

import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/shared/Footer";
import { DataInitializer } from "@/components/shared/DataInitializer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DataInitializer />
        <div className="flex min-h-screen bg-bg-primary">
          <div className="flex flex-1 flex-col">
            <div className="print:hidden">
              <Topbar />
            </div>
            <main className="flex-1 bg-bg-secondary/50">
              {children}
            </main>
            <div className="print:hidden">
              <Footer />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
