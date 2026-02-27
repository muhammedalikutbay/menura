"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { QRGenerator } from "../_components/QRGenerator";
import { storage } from "@/lib/storage";
import { useEffect, useState } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function QRPrintPage() {
    const [menuUrl, setMenuUrl] = useState("https://menura.app/restoran-id");

    // In a real app, we might fetch the actual URL from settings or storage
    // For now, staying consistent with the main QR page

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#FBFBFD] pb-32 print:bg-white print:pb-0">
            <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-20 print:p-0">
                <div className="flex items-center gap-4 mb-8 print:hidden">
                    <Link
                        href="/qr"
                        className="w-10 h-10 rounded-full bg-white border border-[#E8E8ED] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <PageHeader
                        title="QR Printer"
                        description="Prepare your QR codes for physical printing."
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Print Options */}
                    <div className="space-y-8 print:hidden">
                        <div className="bg-white rounded-[40px] shadow-[0_15px_60px_rgb(0,0,0,0.04)] border border-[#F2F2F7] p-10 space-y-8">
                            <h3 className="text-[24px] font-bold text-[#1D1D1F]">Print Settings</h3>

                            <div className="space-y-4">
                                <p className="text-[15px] text-[#86868B] font-medium leading-relaxed">
                                    Choose a layout for your table tents or stickers. Click the button below to open the system print dialog.
                                </p>

                                <button
                                    onClick={handlePrint}
                                    className="w-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white h-14 rounded-full font-bold text-[16px] shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-3"
                                >
                                    <Printer size={20} />
                                    Print Now
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#0071E3]/5 rounded-[32px] p-8 border border-[#0071E3]/10">
                            <h4 className="text-[14px] font-bold text-[#0071E3] uppercase tracking-widest mb-2">Pro Tip</h4>
                            <p className="text-[14px] text-[#0071E3]/80 font-medium leading-relaxed">
                                For the best results, use high-quality cardstock or vinyl stickers. Ensure the QR code has enough contrast with its surroundings.
                            </p>
                        </div>
                    </div>

                    {/* Print Preview Area */}
                    <div className="flex justify-center bg-white rounded-[40px] shadow-[0_15px_60px_rgb(0,0,0,0.04)] border border-[#F2F2F7] p-12 md:p-20 print:shadow-none print:border-none print:p-0">
                        <div className="flex flex-col items-center text-center space-y-12 max-w-[400px]">
                            <div className="relative">
                                {/* Visual Frame for the preview */}
                                <div className="p-8 bg-white border-[12px] border-[#D6CAB8] rounded-xl shadow-xl print:shadow-none print:border-[1px] print:border-black/10">
                                    <QRGenerator
                                        value={menuUrl}
                                        size={280}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-[32px] font-bold text-[#1D1D1F] tracking-tight">Scan for Menu</h2>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#0071E3]" />
                                    <p className="text-[18px] font-bold text-[#0071E3] tracking-tight">menura.app</p>
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#0071E3]" />
                                </div>
                            </div>

                            <p className="text-[14px] text-[#86868B] font-semibold uppercase tracking-[0.2em] opacity-40">
                                Powered by Menura
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
