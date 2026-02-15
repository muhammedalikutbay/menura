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

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-inter`}>
        <div className="flex h-screen bg-bg-primary overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto bg-bg-secondary/50">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
