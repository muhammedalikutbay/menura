"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { StatsCard } from "@/components/ui/StatsCard";
import { cn } from "@/lib/utils";
import { LayoutGrid, Utensils, QrCode } from "lucide-react";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

export function MenuStats() {
  const [stats, setStats] = useState({
    categories: 0,
    activeCategories: 0,
    products: 0,
    activeProducts: 0,
    qrScans: 2465
  });

  useEffect(() => {
    const rawCategories = storage.get<Category[]>("CATEGORIES", []);
    const rawProducts = storage.get<Product[]>("PRODUCTS", []);

    // Robust calculation to avoid NaN/Undefined
    const totalCat = rawCategories.length;
    const activeCat = rawCategories.filter((c: Category) => c.isActive).length;
    const totalProd = rawProducts.length;
    const activeProd = rawProducts.filter((p: Product) => p.isAvailable).length;

    setStats({
      categories: totalCat,
      activeCategories: activeCat,
      products: totalProd,
      activeProducts: activeProd,
      qrScans: 2465
    });
  }, []);

  const StatusBadge = ({ count, label, variant }: { count: number, label: string, variant: 'active' | 'draft' }) => (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-md font-bold tracking-tight",
      variant === 'active'
        ? " text-green-700  dark:text-green-400"
        : "text-orange-700  dark:text-orange-400"
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0",
        variant === 'active' ? "bg-green-500" : "bg-orange-500"
      )}></span>
      <span>{label}: {Number(count) || 0}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <StatsCard
        label="Total Categories"
        value={stats.categories}
        icon={<LayoutGrid size={24} />}
        variant="primary"
        subtext={
          <div className="flex items-center gap-2">
            <StatusBadge count={stats.activeCategories} label="Active" variant="active" />
            <StatusBadge count={Math.max(0, stats.categories - stats.activeCategories)} label="Draft" variant="draft" />
          </div>
        }
      />
      <StatsCard
        label="Total Menu Items"
        value={stats.products}
        icon={<Utensils size={24} />}
        variant="purple"
        subtext={
          <div className="flex items-center gap-2">
            <StatusBadge count={stats.activeProducts} label="Active" variant="active" />
            <StatusBadge count={Math.max(0, stats.products - stats.activeProducts)} label="Draft" variant="draft" />
          </div>
        }
      />
      <StatsCard
        label="QR Scans"
        value={stats.qrScans.toLocaleString()}
        icon={<QrCode size={24} />}
        variant="orange"
        subtext={<span className="font-semibold tracking-wider  opacity-100">Total all time</span>}
      />
    </div>
  );
}
