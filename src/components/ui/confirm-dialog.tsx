"use client";

import { useState } from "react";
import { AlertDialog } from "radix-ui";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { dialogContentClass, dialogOverlayClass } from "./dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for irreversible actions. */
  destructive?: boolean;
  /**
   * Runs on confirm. The dialog shows a spinner while the promise is pending and closes when it
   * resolves. Return `false` (or throw) to keep it open; report errors yourself (e.g. a toast).
   */
  onConfirm: () => void | boolean | Promise<void | boolean>;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      const result = await onConfirm();
      if (result !== false) onOpenChange(false);
    } catch {
      // Caller reports the failure; keep the dialog open so the user can retry.
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={dialogOverlayClass} />
        <AlertDialog.Content
          className={cn(dialogContentClass, "gap-5")}
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <div className="flex flex-col gap-1.5">
            <AlertDialog.Title className="type-title">{title}</AlertDialog.Title>
            {description && (
              <AlertDialog.Description className="type-body text-fg-muted">{description}</AlertDialog.Description>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" disabled={pending}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <Button variant={destructive ? "destructive" : "primary"} loading={pending} onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
