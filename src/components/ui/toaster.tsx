"use client";

import { Toaster as Sonner } from "sonner";

/** App-wide toast host, themed through design tokens. */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton
      theme="system"
      style={
        {
          "--normal-bg": "var(--color-surface)",
          "--normal-text": "var(--color-fg)",
          "--normal-border": "var(--color-border)",
          "--border-radius": "var(--radius-md)",
          fontFamily: "var(--font-sans)",
        } as React.CSSProperties
      }
    />
  );
}
