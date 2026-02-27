"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { QRStyleCustomizer } from "./_components/QRStyleCustomizer";
import { QRActionCards } from "./_components/QRActionCards";
import { QRGenerator } from "./_components/QRGenerator";
import { storage } from "@/lib/storage";
import { SectionHeader } from "@/components/shared/SectionHeader";

interface QRConfig {
  menuUrl: string;
  fgColor: string;
  includeLogo: boolean;
  logoUrl?: string;
  cornerStyle: "Square" | "Round" | "Extra Round";
}

export default function QRPage() {
  const [menuUrl, setMenuUrl] = useState("https://menura.app/restoran-id");
  const [fgColor, setFgColor] = useState("#0071E3");
  const [includeLogo, setIncludeLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [cornerStyle, setCornerStyle] = useState<"Square" | "Round" | "Extra Round">("Round");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persistence
  useEffect(() => {
    const config = storage.get<QRConfig>("QR_CONFIG", {
      menuUrl: "https://menura.app/restoran-id",
      fgColor: "#0071E3",
      includeLogo: false,
      cornerStyle: "Round",
    });
    setMenuUrl(config.menuUrl);
    setFgColor(config.fgColor);
    setIncludeLogo(config.includeLogo);
    setLogoUrl(config.logoUrl);
    setCornerStyle(config.cornerStyle || "Round");
    setIsLoaded(true);
  }, []);

  // Save persistence
  useEffect(() => {
    if (!isLoaded) return;
    storage.set("QR_CONFIG", { menuUrl, fgColor, includeLogo, logoUrl, cornerStyle });
  }, [menuUrl, fgColor, includeLogo, logoUrl, cornerStyle, isLoaded]);

  return (
    <div className="min-h-screen bg-[#FBFBFD] pb-32 print:bg-white print:pb-0 font-sans">
      {/* Dashboard UI - Hidden during print */}
      <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-20 print:hidden transition-all duration-300">
        <SectionHeader
          title="QR Code Management"
          description="Create and customize digital menu access codes for your customers."
        />

        <div className="mt-16 space-y-12">
          {/* Main Customizer */}
          <QRStyleCustomizer
            value={menuUrl}
            fgColor={fgColor}
            setFgColor={setFgColor}
            includeLogo={includeLogo}
            setIncludeLogo={setIncludeLogo}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            cornerStyle={cornerStyle}
            setCornerStyle={setCornerStyle}
          />

          {/* Action Cards */}
          <QRActionCards />
        </div>
      </div>

      {/* Print-Only Template - Visible only during print */}
      <div className="printable-qr-wrapper">
        <QRGenerator
          id="print-qr-code"
          value={menuUrl}
          fgColor={fgColor}
          includeLogo={includeLogo}
          logoUrl={logoUrl}
          cornerStyle={cornerStyle}
          size={2048}
          plain={true}
        />
      </div>
    </div>
  );
}
