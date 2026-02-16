"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { QRGenerator } from "./_components/qr/QRGenerator";
import { ImageUpload } from "@/components/shared/ImageUpload";

export default function Home() {
  const [stats, setStats] = useState({ categories: 0, products: 0 });
  const [menuUrl, setMenuUrl] = useState("");
  const [fgColor, setFgColor] = useState("#0d7ff2");
  const [logo, setLogo] = useState<string | undefined>("/favicon.ico");

  useEffect(() => {
    setStats({
      categories: storage.get("CATEGORIES").length,
      products: storage.get("PRODUCTS").length,
    });
    
    // Set default menu URL to current domain
    if (typeof window !== "undefined") {
      setMenuUrl(window.location.origin);
    }
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-h2 font-bold text-text-primary tracking-tight">Panel Özeti</h1>
          <p className="text-callout text-text-secondary font-medium">Menura Smart QR Menu operasyonlarınıza hoş geldiniz.</p>
        </div>
        <div className="flex items-center gap-2 text-caption font-bold text-text-secondary bg-white px-4 py-2 rounded-full border border-divider shadow-sm">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          CANLI GÖRÜNÜM AKTİF
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-divider hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-caption font-black text-text-secondary uppercase tracking-widest text-[11px]">Toplam Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h1 font-black text-action">{stats.categories}</div>
            <p className="text-[12px] font-medium text-text-secondary mt-1">Aktif menü kategorileri</p>
          </CardContent>
        </Card>
        
        <Card className="border-divider hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-caption font-black text-text-secondary uppercase tracking-widest text-[11px]">Toplam Ürün</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h1 font-black text-action">{stats.products}</div>
            <p className="text-[12px] font-medium text-text-secondary mt-1">Tanımlı ürün sayısı</p>
          </CardContent>
        </Card>

        <Card className="bg-action/5 border-action/20 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-action"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-caption font-black text-action uppercase tracking-widest text-[11px]">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <button className="text-[13px] font-bold text-left text-action hover:underline flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-action" />
              Yeni Kategori Ekle
            </button>
            <button className="text-[13px] font-bold text-left text-action hover:underline flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-action" />
              Yeni Ürün Ekle
            </button>
          </CardContent>
        </Card>
      </div>

      {/* QR Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-action rounded-full" />
          <h2 className="text-h3 font-black text-text-primary tracking-tight uppercase">QR KOD YÖNETİMİ</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Controls */}
          <Card className="p-6 border border-divider shadow-sm space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest">Menü Bağlantısı (URL)</label>
                <p className="text-sm font-medium text-text-secondary break-all select-all pt-1">
                  {menuUrl}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest">QR Rengi</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-divider cursor-pointer p-1 bg-white shrink-0"
                  />
                  <Input 
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="font-mono h-12 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest">Özel Logo (PNG/SVG)</label>
                <ImageUpload 
                  value={logo}
                  onChange={setLogo}
                />
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                 <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
                   <strong className="text-primary font-black uppercase tracking-widest block mb-1">İpucu</strong>
                   Yüksek baskı kalitesi için **H (High)** hata düzeltme seviyesini kullanıyoruz. QR kodunuz %30 hasarda bile çalışır.
                 </p>
              </div>
            </div>
          </Card>

          {/* Generator Preview */}
          <Card className="p-8 border border-divider shadow-sm flex flex-col items-center justify-center gap-8 min-h-[400px]">
             <div className="text-center space-y-1">
                <h3 className="text-callout font-black text-text-primary uppercase tracking-widest">DİJİTAL QR</h3>
                <p className="text-caption text-text-secondary font-medium italic">Görsel veya Web kullanımı için</p>
             </div>
             <QRGenerator 
                value={menuUrl} 
                fgColor={fgColor}
                logo={logo}
             />
          </Card>

        </div>
      </div>
    </div>
  );
}
