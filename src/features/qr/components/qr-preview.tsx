"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { buildQrOptions, type QrStyle } from "../style";
import { useQrImage } from "./use-qr-image";

type QrPreviewProps = {
  style: QrStyle;
  data: string;
  logoUrl: string | null;
  /** Accessible description of the code. */
  label: string;
  /** Render size in px; the image is vector, so this only affects the generated viewBox. */
  size?: number;
  className?: string;
};

/** A QR code rendered as an <img> from a generated SVG. */
export function QrPreview({ style, data, logoUrl, label, size = 512, className }: QrPreviewProps) {
  const options = useMemo(() => buildQrOptions(style, { data, size, logoUrl, type: "svg" }), [style, data, size, logoUrl]);
  const { url, failed } = useQrImage(options);

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- generated object URL, not optimizable
    return <img src={url} alt={label} className={className} draggable={false} />;
  }
  if (failed) {
    return (
      <div role="alert" className={className}>
        <p className="flex size-full items-center justify-center p-4 text-center text-sm text-danger">
          QR kod oluşturulamadı. Sayfayı yenileyip tekrar deneyin.
        </p>
      </div>
    );
  }
  return <Skeleton className={className} />;
}
