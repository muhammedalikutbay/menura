"use client";

import { useEffect, useState } from "react";
import type { Options } from "qr-code-styling";

type QrImageState = { url: string | null; failed: boolean };

/**
 * Renders a QR code (SVG) for the given options and returns an object URL for an <img>.
 * qr-code-styling touches `window`, so it is imported lazily inside the effect. Rapid option
 * changes (e.g. dragging a color picker) are debounced.
 */
export function useQrImage(options: Options): QrImageState {
  const [state, setState] = useState<QrImageState>({ url: null, failed: false });
  // A string key keeps the effect from re-running when an equal options object is recreated.
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const { default: QRCodeStyling } = await import("qr-code-styling");
        const qr = new QRCodeStyling(JSON.parse(optionsKey) as Options);
        const blob = await qr.getRawData("svg");
        if (cancelled) return;
        if (!(blob instanceof Blob)) throw new Error("QR render returned no data");
        setState({ url: URL.createObjectURL(blob), failed: false });
      } catch {
        if (!cancelled) setState((previous) => ({ ...previous, failed: true }));
      }
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [optionsKey]);

  const { url } = state;
  useEffect(() => {
    // Release the previous object URL once a newer one has replaced it.
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return state;
}
