"use client";

import { Download, Printer } from "lucide-react";

export function QRActionCards() {
    const downloadQR = () => {
        // Use the high-resolution canvas (2048px) defined in the print wrapper
        const canvas = document.getElementById("print-qr-code") as HTMLCanvasElement;

        if (!canvas) {
            // Fallback to the preview canvas if the print one isn't found
            const previewCanvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
            if (!previewCanvas) {
                alert("QR Code not found. Please wait until it generates.");
                return;
            }
            downloadFromCanvas(previewCanvas);
            return;
        }

        downloadFromCanvas(canvas);
    };

    const downloadFromCanvas = (canvas: HTMLCanvasElement) => {
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `menura-qr-highres-${Date.now()}.png`;
        link.href = url;
        link.click();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Download Card */}
            <div className="bg-white rounded-[40px] border border-[#E5E7EB] p-10 flex flex-col items-start gap-8 relative overflow-hidden transition-all duration-300">
                <div className="flex justify-between items-start w-full">
                    <div className="w-14 h-14 rounded-full bg-[#0071E3]/5 flex items-center justify-center text-[#0071E3]">
                        <Download size={24} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[24px] font-bold text-[#1D1D1F]">Download QR</h3>
                    <p className="text-[15px] text-[#86868B] font-medium leading-relaxed max-w-[280px]">
                        Get your QR code in PNG, SVG, or PDF format for digital use.
                    </p>
                </div>

                <button
                    onClick={downloadQR}
                    className="w-full !bg-[#0071E3] hover:!bg-[#0077ED] active:scale-[0.98] !text-white h-14 rounded-full font-bold text-[16px] transition-all mt-auto"
                >
                    Download PNG
                </button>
            </div>

            {/* Print Materials Card */}
            <div className="bg-white rounded-[40px] border border-[#E5E7EB] p-10 flex flex-col items-start gap-8 relative overflow-hidden transition-all duration-300">
                <div className="flex justify-between items-start w-full">
                    <div className="w-14 h-14 rounded-full bg-[#0071E3]/5 flex items-center justify-center text-[#0071E3]">
                        <Printer size={24} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[24px] font-bold text-[#1D1D1F]">Print Materials</h3>
                    <p className="text-[15px] text-[#86868B] font-medium leading-relaxed max-w-[280px]">
                        Generate ready-to-print table tents, stickers, and flyers.
                    </p>
                </div>

                <button
                    onClick={() => window.print()}
                    className="w-full !bg-[#0071E3] hover:!bg-[#0077ED] active:scale-[0.98] !text-white h-14 rounded-full font-bold text-[16px] transition-all mt-auto"
                >
                    Print QR Code
                </button>
            </div>
        </div>
    );
}
