"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { QRGenerator } from "./_components/QRGenerator";
import { QRPreview } from "./_components/QRPreview";

export default function QRPage() {
  const [menuUrl, setMenuUrl] = useState("https://menura.app/restoran-id");
  const [fgColor, setFgColor] = useState("#0d7ff2");
  const [includeLogo, setIncludeLogo] = useState(true);

  return (
    <div className="space-y-8 pb-20">
      <PageHeader 
        title="QR Code Management" 
        description="Create and customize digital menu access codes for your customers."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border border-divider shadow-sm space-y-6">
            <h3 className="text-callout font-black text-text-primary uppercase tracking-widest border-b border-divider pb-4">SETTINGS</h3>
            
            <FormField label="Menu Link (URL)">
              <Input 
                value={menuUrl}
                onChange={(e) => setMenuUrl(e.target.value)}
                placeholder="https://..."
                className="h-12"
              />
            </FormField>

            <FormField label="QR Color">
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-divider cursor-pointer p-1 bg-white"
                />
                <Input 
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="font-mono h-12"
                />
              </div>
            </FormField>

            <div className="flex items-center gap-3 p-4 bg-bg-secondary/20 rounded-xl border border-divider/50">
              <Checkbox 
                id="logo"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
              />
              <label htmlFor="logo" className="text-caption font-black text-text-primary cursor-pointer select-none">ADD LOGO</label>
            </div>
          </Card>

          <Card className="p-6 border border-divider shadow-sm bg-primary/5 border-dashed">
             <div className="flex flex-col gap-2">
                <h4 className="text-caption font-black text-primary uppercase tracking-widest">Tip</h4>
                <p className="text-caption text-text-secondary leading-relaxed font-medium">
                  We use **H (High)** error correction level for high print quality. This way your QR code remains scannable even if damaged up to 30%.
                </p>
             </div>
          </Card>
        </div>

        {/* Generator View */}
        <div className="lg:col-span-1">
          <Card className="p-8 border border-divider shadow-sm flex flex-col items-center justify-center h-full gap-8">
             <div className="text-center space-y-1">
                <h3 className="text-callout font-black text-text-primary uppercase tracking-widest">DIGITAL QR</h3>
                <p className="text-caption text-text-secondary font-medium italic">For image or web use</p>
             </div>
             <QRGenerator 
                value={menuUrl} 
                fgColor={fgColor}
                includeLogo={includeLogo}
             />
          </Card>
        </div>

        {/* Mockup Preview */}
        <div className="lg:col-span-1">
           <Card className="p-8 border border-divider shadow-sm flex flex-col items-center gap-8 bg-bg-secondary/10">
              <div className="text-center space-y-1">
                 <h3 className="text-callout font-black text-text-primary uppercase tracking-widest">TABLE PREVIEW</h3>
                 <p className="text-caption text-text-secondary font-medium italic">Real world view</p>
              </div>
              <QRPreview>
                 <QRGenerator 
                    value={menuUrl} 
                    fgColor={fgColor}
                    includeLogo={includeLogo}
                    size={160}
                 />
              </QRPreview>
           </Card>
        </div>
      </div>
    </div>
  );
}
