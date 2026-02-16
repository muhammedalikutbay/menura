"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface QRGeneratorProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  logo?: string;
  fgColor?: string;
}

export function QRGenerator({
  value,
  size = 256,
  level = "H",
  logo,
  fgColor = "#0d7ff2",
}: QRGeneratorProps) {
  const downloadQR = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `menura-qr-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="p-6 bg-white rounded-[24px] shadow-2xl border border-divider/50 flex items-center justify-center aspect-square w-fit">
        <QRCodeCanvas
          value={value}
          size={size}
          level={level}
          fgColor={fgColor}
          imageSettings={
            logo
              ? {
                  src: logo,
                  x: undefined,
                  y: undefined,
                  height: size * 0.2, // Logo takes ~20% of QR size
                  width: size * 0.2,
                  excavate: true,
                }
              : undefined
          }
        />
      </div>

      <div className="flex gap-2 w-full max-w-[320px]">
        <Button onClick={downloadQR} className="flex-1 shadow-md">
          Download PNG
        </Button>
      </div>
    </div>
  );
}
