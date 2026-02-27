"use client";

import { useEffect, useRef } from "react";

interface QRGeneratorProps {
  value: string;
  size?: number;
  includeLogo?: boolean;
  logoUrl?: string;
  fgColor?: string;
  plain?: boolean;
  id?: string;
  cornerStyle?: "Square" | "Round" | "Extra Round";
}

export function QRGenerator({
  value,
  size = 256,
  includeLogo = false,
  logoUrl,
  fgColor = "#000000",
  plain = false,
  id = "qr-code-canvas",
  cornerStyle = "Square",
}: QRGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<any>(null);

  useEffect(() => {
    // Only import on client
    import("qr-code-styling").then((QRCodeStyling) => {
      if (!qrCodeRef.current) {
        qrCodeRef.current = new QRCodeStyling.default({
          width: size,
          height: size,
          data: value,
          image: includeLogo ? logoUrl || "/favicon.ico" : undefined,
          dotsOptions: {
            color: fgColor,
            type: cornerStyle === "Square" ? "square" : cornerStyle === "Round" ? "rounded" : "extra-rounded",
          },
          cornersSquareOptions: {
            color: fgColor,
            type: cornerStyle === "Square" ? "square" : "extra-rounded",
          },
          cornersDotOptions: {
            color: fgColor,
            type: cornerStyle === "Square" ? "square" : "dot",
          },
          backgroundOptions: {
            color: "transparent",
          },
          imageOptions: {
            crossOrigin: "anonymous",
            margin: 10,
          },
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          qrCodeRef.current.append(containerRef.current);

          // Add the ID to the canvas for our download logic
          const canvas = containerRef.current.querySelector("canvas");
          if (canvas) canvas.id = id;
        }
      } else {
        qrCodeRef.current.update({
          width: size,
          height: size,
          data: value,
          image: includeLogo ? logoUrl || "/favicon.ico" : undefined,
          dotsOptions: {
            color: fgColor,
            type: cornerStyle === "Square" ? "square" : cornerStyle === "Round" ? "rounded" : "extra-rounded",
          },
          cornersSquareOptions: {
            color: fgColor,
            type: cornerStyle === "Square" ? "square" : "extra-rounded",
          },
          cornersDotOptions: {
            color: fgColor,
            type: cornerStyle === "Square" ? "square" : "dot",
          },
        });

        // Re-apply ID if it changed or was lost
        const canvas = containerRef.current?.querySelector("canvas");
        if (canvas) canvas.id = id;
      }
    });
  }, [value, size, includeLogo, logoUrl, fgColor, cornerStyle, id]);

  const content = <div ref={containerRef} className="flex items-center justify-center overflow-hidden" />;

  if (plain) return content;

  return (
    <div className="flex items-center justify-center bg-white p-4 rounded-xl shadow-inner border border-[#F2F2F7]">
      {content}
    </div>
  );
}
