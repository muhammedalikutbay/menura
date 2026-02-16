"use client";

import { CheckCircle2, AlertCircle, ShoppingBag, PlusCircle, QrCode, Utensils, Download, Printer, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { QRGenerator } from "../../qr/_components/QRGenerator";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";

interface QRConfig {
  menuUrl: string;
  fgColor: string;
  includeLogo: boolean;
  logoUrl?: string;
  cornerStyle: "Square" | "Round" | "Extra Round";
}

export function RecentActivity() {
  const activities = [
    { id: 1, type: 'success', label: 'New product added', time: '2 mins ago', icon: <PlusCircle size={14} /> },
    { id: 2, type: 'info', label: 'QR Code colors updated', time: '1 hour ago', icon: <QrCode size={14} /> },
    { id: 3, type: 'success', label: 'Category "Breakfast" active', time: '4 hours ago', icon: <CheckCircle2 size={14} /> },
    { id: 4, type: 'warning', label: 'Low stock: Burger Bun', time: 'Yesterday', icon: <AlertCircle size={14} /> },
  ];

  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-[#E8E8ED] h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">Recent Activity</h3>
        <p className="text-[13px] text-[#86868B] font-medium">Monitoring your menu updates</p>
      </div>

      <div className="space-y-6">
        {activities.map((item) => (
          <div key={item.id} className="flex gap-4 items-start group">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              item.type === 'success' ? "bg-[#34C759]/10 text-[#34C759]" :
                item.type === 'warning' ? "bg-[#FF9500]/10 text-[#FF9500]" :
                  "bg-[#0071E3]/10 text-[#0071E3]"
            )}>
              {item.icon}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[14px] font-bold text-[#1D1D1F] leading-tight group-hover:text-[#0071E3] transition-colors">{item.label}</p>
              <p className="text-[12px] text-[#86868B] font-medium uppercase tracking-tight">{item.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-auto w-full py-3 text-[13px] font-bold text-[#0071E3] hover:bg-[#EFF6FF] rounded-xl transition-colors uppercase tracking-wide border border-transparent hover:border-[#0071E3]/20">
        All Activities
      </button>
    </div>
  );
}

export function MenuQR() {
  const [menuUrl, setMenuUrl] = useState("");
  const [config, setConfig] = useState<QRConfig>({
    menuUrl: "",
    fgColor: "#0071E3",
    includeLogo: false,
    cornerStyle: "Round",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setMenuUrl(origin);

      const savedConfig = storage.get<QRConfig>("QR_CONFIG", {
        menuUrl: origin,
        fgColor: "#0071E3",
        includeLogo: false,
        cornerStyle: "Round",
      });
      setConfig(savedConfig);
    }
  }, []);

  const handleDownload = () => {
    // Target the high-res hidden canvas
    const canvas = document.getElementById("print-qr-code-dash") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `menura-qr-highres-${Date.now()}.png`;
      link.href = url;
      link.click();
    } else {
      // Fallback
      const anyCanvas = document.querySelector('canvas');
      if (anyCanvas) {
        const url = anyCanvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = 'menu-qr.png';
        link.href = url;
        link.click();
      }
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F2F2F7] p-8 flex flex-col items-center text-center">
      <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-1">Your Menu QR</h2>
      <p className="text-[14px] text-[#86868B] font-medium mb-8 opacity-80">Scan to preview your live menu</p>

      {/* QR Container - Background removed and styling cleaned */}
      <div className="w-full max-w-[240px] aspect-square rounded-[40px] flex items-center justify-center mb-10 relative">
        {/* Soft Inner Shadow/Gradient for Depth */}
        <div className="absolute inset-0 bg-black/5 opacity-10 pointer-events-none" />

        {/* White QR Wrapper */}
        <div className="bg-white p-5 rounded-[32px]  border border-white/50 transform transition-transform duration-500 hover:scale-110">
          <div className="flex items-center justify-center">
            <QRGenerator
              value={config?.menuUrl || menuUrl}
              size={220}
              fgColor={config?.fgColor}
              includeLogo={config?.includeLogo}
              logoUrl={config?.logoUrl}
              cornerStyle={config?.cornerStyle}
              plain={true}
            />
          </div>
        </div>
      </div>

      {/* Hidden High-Res QR for Download */}
      <div className="hidden pointer-events-none fixed -top-[9999px] -left-[9999px]">
        <QRGenerator
          id="print-qr-code-dash"
          value={config?.menuUrl || menuUrl}
          fgColor={config?.fgColor}
          includeLogo={config?.includeLogo}
          logoUrl={config?.logoUrl}
          cornerStyle={config?.cornerStyle}
          size={2048}
          plain={true}
        />
      </div>

      <div className="flex w-full gap-4 mt-8">
        <button
          onClick={() => (window.location.href = "/qr")}
          className="flex-1 py-4 px-6 rounded-2xl font-bold transition-all active:scale-95"
          style={{
            border: "2px solid #0071E3",
            backgroundColor: "transparent",
            color: "#0071E3"
          }}
        >
          Edit
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 py-4 px-6 rounded-2xl font-bold transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,113,227,0.3)]"
          style={{
            backgroundColor: "#0071E3",
            color: "white"
          }}
        >
          Download
        </button>
      </div>
    </div>
  );
}

interface QuickActionsProps {
  onAddCategory?: () => void;
  onAddItem?: () => void;
}

export function QuickActions({ onAddCategory, onAddItem }: QuickActionsProps) {
  const actions = [
    { label: 'Add Category', icon: <PlusCircle size={20} />, action: onAddCategory },
    { label: 'Add Item', icon: <PlusCircle size={20} />, action: onAddItem },
  ];

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F2F2F7] p-8">
      <h2 className="text-[20px] font-bold text-[#1D1D1F] mb-8">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.action}
            className="w-full flex items-center justify-between p-4 px-6 rounded-full transition-all group active:scale-[0.98]"
            style={{
              border: "2px dashed #86868B",
              backgroundColor: "#F5F4F6",
              color: "#86868B",
            }}
          >
            <div className="text-[#86868B] group-hover:text-[#0071E3] transition-colors">
              {action.icon}
            </div>
            <span className="text-sm font-semibold group-hover:text-[#0071E3] transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
