"use client";

import { buildQrOptions, type QrStyle } from "../style";

export const DOWNLOAD_SIZE = 1024;

/** Renders the QR at full size and triggers a file download. Throws when rendering fails. */
export async function downloadQr(input: {
  style: QrStyle;
  data: string;
  logoUrl: string | null;
  format: "png" | "svg";
  fileName: string;
}): Promise<void> {
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const qr = new QRCodeStyling(
    buildQrOptions(input.style, {
      data: input.data,
      size: DOWNLOAD_SIZE,
      logoUrl: input.logoUrl,
      type: input.format === "png" ? "canvas" : "svg",
    }),
  );
  const blob = await qr.getRawData(input.format);
  if (!(blob instanceof Blob)) throw new Error("QR render returned no data");

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `${input.fileName}.${input.format}`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
}
