"use client";

import { useRef } from "react";
import { Check, Plus, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { QRGenerator } from "./QRGenerator";
import { TabNav } from "@/components/shared/TabNav";

interface QRStyleCustomizerProps {
    value: string;
    fgColor: string;
    setFgColor: (color: string) => void;
    includeLogo: boolean;
    setIncludeLogo: (include: boolean) => void;
    logoUrl?: string;
    setLogoUrl: (url: string) => void;
    cornerStyle: "Square" | "Round" | "Extra Round";
    setCornerStyle: (style: "Square" | "Round" | "Extra Round") => void;
}

const PRESET_COLORS = [
    "#000000",
    "#0071E3",
    "#5E5CE6",
    "#009B72",
    "#FF6B6B",
];

export function QRStyleCustomizer({
    value,
    fgColor,
    setFgColor,
    includeLogo,
    setIncludeLogo,
    logoUrl,
    setLogoUrl,
    cornerStyle,
    setCornerStyle,
}: QRStyleCustomizerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
                setIncludeLogo(true);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white rounded-[40px] border border-[#E5E7EB] p-10 md:p-14 mb-8">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
                {/* Left: Preview Area */}
                <div className="w-full lg:w-1/2 flex justify-center">
                    <div className="relative group">
                        {/* Simplified, Flat Preview Area */}
                        <div className="w-64 h-64 md:w-80 md:h-80 bg-[#F5F5F7] rounded-[48px] flex items-center justify-center p-8 transition-all duration-300">
                            <QRGenerator
                                value={value}
                                fgColor={fgColor}
                                includeLogo={includeLogo}
                                logoUrl={logoUrl}
                                cornerStyle={cornerStyle}
                                size={220}
                                plain={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Controls Area */}
                <div className="w-full lg:w-1/2 space-y-12">
                    <div>
                        <h2 className="text-[32px] font-bold text-[#1D1D1F] tracking-tight mb-2">QR Style</h2>
                        <p className="text-[17px] text-[#86868B] font-medium leading-relaxed">
                            Customize the look to match your brand.
                        </p>
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-4">
                        <h3 className="text-[13px] font-bold text-[#86868B] uppercase tracking-widest">Color</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setFgColor(color)}
                                    className={cn(
                                        "w-10 h-10 rounded-full transition-all flex items-center justify-center border-2",
                                        fgColor === color ? "scale-110 !border-[#0071E3]" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: color }}
                                >
                                    {fgColor === color && (
                                        <Check size={16} className={cn(color === "#FFFFFF" ? "text-black" : "text-white")} />
                                    )}
                                </button>
                            ))}
                            <div className="relative">
                                <input
                                    type="color"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <button className="w-10 h-10 rounded-full bg-white border border-[#E8E8ED] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Brand Logo */}
                    <div className="space-y-4">
                        <h3 className="text-[13px] font-bold text-[#86868B] uppercase tracking-widest">Brand Logo</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-6">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "flex items-center gap-3 px-8 py-3.5 rounded-2xl border-2 transition-all font-semibold active:scale-[0.98]",
                                        logoUrl && includeLogo
                                            ? "!bg-[#F5F5F7] !border-[#0071E3] !text-[#0071E3]"
                                            : "!bg-[#F5F5F7] border-transparent !text-[#1D1D1F] hover:!border-[#D2D2D7]"
                                    )}
                                >
                                    <UploadCloud size={20} />
                                    <span>{logoUrl && includeLogo ? "Logo Updated" : "Upload Logo"}</span>
                                </button>
                                {logoUrl && (
                                    <button
                                        onClick={() => setIncludeLogo(!includeLogo)}
                                        className={cn(
                                            "p-3.5 rounded-2xl border-2 transition-all active:scale-[0.95]",
                                            includeLogo ? "!bg-[#0071E3] !border-[#0071E3] !text-white" : "!bg-[#F5F5F7] border-transparent !text-[#1D1D1F]"
                                        )}
                                        title={includeLogo ? "Hide Logo" : "Show Logo"}
                                    >
                                        {includeLogo ? <Check size={20} /> : <Plus size={20} />}
                                    </button>
                                )}
                            </div>
                            <span className="text-[13px] text-[#86868B] font-medium">Supported formats: PNG, SVG (Max 1MB recommended)</span>
                        </div>
                    </div>

                    {/* Corner Style */}
                    <div className="space-y-4">
                        <h3 className="text-[13px] font-bold text-[#86868B] uppercase tracking-widest">Corner Style</h3>
                        <TabNav
                            tabs={[
                                { value: "Square", label: "Square" },
                                { value: "Round", label: "Round" },
                                { value: "Extra Round", label: "Extra Round" }
                            ]}
                            activeTab={cornerStyle}
                            onTabChange={setCornerStyle}
                            className="!p-1.5 !bg-[#F5F5F7] !border-transparent !rounded-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
