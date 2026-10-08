"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/cn";
import { IconButton } from "./button";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required for screen readers. */
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Sticky footer, usually the form actions ("Vazgeç" / "Kaydet"). */
  footer?: React.ReactNode;
  /** Keep the title for assistive tech only (render your own heading in `children`). */
  hideTitle?: boolean;
  className?: string;
  /** Extra classes for the scrolling body. */
  bodyClassName?: string;
};

/**
 * Floating panel built on Radix Dialog: a 480px right panel on >= 768px (16px from the viewport
 * edges, 88px below the top so the header stays visible, radius-xl, shadow-sheet) and a bottom
 * sheet below. Focus is trapped, Esc and an outside click close it (intercept `onOpenChange`
 * to confirm unsaved changes). The page behind stays visible: the overlay is a barely-there tint
 * on desktop and a dim layer on mobile.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  hideTitle = false,
  className,
  bodyClassName,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-overlay md:bg-fg/[0.03]",
            "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
          )}
        />
        <DialogPrimitive.Content
          // Radix warns when no description exists; opt out explicitly.
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-surface text-fg shadow-sheet outline-none",
            // Bottom sheet
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl",
            "data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out",
            // Floating right panel
            "md:inset-x-auto md:top-[88px] md:right-4 md:bottom-4 md:max-h-none md:w-[480px] md:max-w-[calc(100vw-2rem)] md:rounded-xl md:ring-1 md:ring-border",
            "md:data-[state=open]:animate-panel-in md:data-[state=closed]:animate-panel-out",
            className,
          )}
        >
          <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-strong md:hidden" />
          <header
            className={cn(
              "flex shrink-0 flex-col gap-1 px-5 pt-3 pr-16 pb-4 md:px-6 md:pt-5",
              hideTitle ? "sr-only" : "border-b border-border",
            )}
          >
            <DialogPrimitive.Title className="type-title">{title}</DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="type-body text-fg-muted">{description}</DialogPrimitive.Description>
            )}
          </header>
          <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-6", hideTitle && "pt-14", bodyClassName)}>
            {children}
          </div>
          {footer && (
            <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-surface px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6 md:pb-4">
              {footer}
            </footer>
          )}
          {/* Last in DOM order so initial focus lands on the first field, not the close button. */}
          <DialogPrimitive.Close asChild>
            <IconButton aria-label="Kapat" className="absolute top-3 right-3 md:top-4 md:right-4">
              <X aria-hidden="true" />
            </IconButton>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
