"use client";

import { cn } from "@/lib/utils";

interface QRPreviewProps {
  children: React.ReactNode;
  title?: string;
}

export function QRPreview({ children, title = "CHECK OUT OUR MENU" }: QRPreviewProps) {
  return (
    <div className="relative group perspective-1000 w-full flex justify-center">
      <div className="w-full max-w-[320px] aspect-[1/1.4] bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-divider/50 overflow-hidden transition-all duration-500 hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.18)]">
        {/* Top Header */}
        <div className="h-1/4 bg-primary flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]" />
          <h3 className="text-body font-black tracking-[0.2em] relative z-10 text-center uppercase">{title}</h3>
        </div>

        {/* QR Core */}
        <div className="p-8 flex items-center justify-center aspect-square">
          <div className="w-full h-full transform transition-transform duration-500">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center mt-auto">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-50 mb-2">Scan the QR Code</p>
          <div className="flex items-center justify-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span className="text-[12px] font-black text-primary tracking-tight">menura.app</span>
            <span className="h-1 w-1 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* Shadow mockup */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/5 blur-xl rounded-full" />
    </div>
  );
}
