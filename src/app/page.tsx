"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from "@/lib/storage";

export default function Home() {
  const [stats, setStats] = useState({ categories: 0, products: 0 });

  useEffect(() => {
    setStats({
      categories: storage.get("CATEGORIES").length,
      products: storage.get("PRODUCTS").length,
    });
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-h2 font-bold text-text-primary">Panel Özeti</h1>
        <p className="text-callout text-text-secondary">Menura Smart QR Menu operasyonlarınıza hoş geldiniz.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Toplam Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h1 font-bold text-action">{stats.categories}</div>
            <p className="text-caption text-text-secondary mt-1">Aktif menü kategorileri</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Toplam Ürün</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h1 font-bold text-action">{stats.products}</div>
            <p className="text-caption text-text-secondary mt-1">Tanımlı ürün sayısı</p>
          </CardContent>
        </Card>

        <Card className="bg-action/5 border-action/20">
          <CardHeader>
            <CardTitle className="text-action">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <button className="text-callout text-left text-action hover:underline">Yeni Kategori Ekle</button>
            <button className="text-callout text-left text-action hover:underline">QR Kod Oluştur</button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
