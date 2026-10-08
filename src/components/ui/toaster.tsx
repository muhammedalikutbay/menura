"use client";

import { Toaster as Sonner } from "sonner";

/** App-wide toast host (top-center, light), themed through design tokens. */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton
      theme="light"
      style={
        {
          "--normal-bg": "var(--color-surface)",
          "--normal-text": "var(--color-fg)",
          "--normal-border": "var(--color-border)",
          // Semantic toasts: a faint tint over the surface, text strong enough for AA.
          "--success-bg": "color-mix(in oklab, var(--color-success) 8%, var(--color-surface))",
          "--success-text": "var(--color-success-text)",
          "--success-border": "color-mix(in oklab, var(--color-success) 24%, var(--color-surface))",
          "--error-bg": "color-mix(in oklab, var(--color-danger) 7%, var(--color-surface))",
          "--error-text": "var(--color-danger-text)",
          "--error-border": "color-mix(in oklab, var(--color-danger) 24%, var(--color-surface))",
          "--warning-bg": "color-mix(in oklab, var(--color-warning) 8%, var(--color-surface))",
          "--warning-text": "var(--color-warning-text)",
          "--warning-border": "color-mix(in oklab, var(--color-warning) 24%, var(--color-surface))",
          "--border-radius": "var(--radius-lg)",
          fontFamily: "var(--font-sans)",
        } as React.CSSProperties
      }
      toastOptions={{ style: { boxShadow: "var(--shadow-float)" } }}
    />
  );
}
