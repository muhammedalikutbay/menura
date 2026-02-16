import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-inter`}>
        <div className="flex min-h-screen bg-bg-primary">
          <div className="flex flex-1 flex-col">
            <Topbar />
            <main className="flex-1 bg-bg-secondary/50">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
