"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

/** Shared with confirm-dialog so both look identical. */
export const dialogOverlayClass =
  "fixed inset-0 z-50 bg-overlay backdrop-blur-[2px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out";

/** Bottom sheet below `sm`, centered card from `sm` up. */
export const dialogContentClass =
  "fixed z-50 flex max-h-[90dvh] w-full flex-col gap-4 overflow-y-auto bg-surface p-5 text-fg shadow-lg " +
  "inset-x-0 bottom-0 rounded-t-xl pb-[max(1.25rem,env(safe-area-inset-bottom))] " +
  "data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out " +
  "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-6 " +
  "sm:data-[state=open]:animate-pop-in sm:data-[state=closed]:animate-pop-out";

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title className={cn("text-lg font-semibold tracking-tight text-fg", className)} {...props} />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm text-fg-muted", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3", className)}
      {...props}
    />
  );
}

type DialogContentProps = Omit<React.ComponentProps<typeof DialogPrimitive.Content>, "title"> & {
  /** Required for screen readers. */
  title: string;
  description?: string;
  /** Keep the title for assistive tech only. */
  hideTitle?: boolean;
  showClose?: boolean;
};

export function DialogContent({
  title,
  description,
  hideTitle = false,
  showClose = true,
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={dialogOverlayClass} />
      <DialogPrimitive.Content
        className={cn(dialogContentClass, className)}
        // Radix warns when no description exists; opt out explicitly.
        {...(description ? {} : { "aria-describedby": undefined })}
        {...props}
      >
        <DialogHeader className={hideTitle ? "sr-only" : undefined}>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {showClose && (
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon" aria-label="Kapat" className="absolute top-3 right-3 size-9">
              <X aria-hidden="true" />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
