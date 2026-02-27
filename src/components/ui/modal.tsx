import * as React from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Content */}
      <div className={cn(
        "relative w-full max-w-md rounded-lg bg-surface p-6 shadow-2xl animate-in fade-in zoom-in duration-200",
        className
      )}>
        {(title || description) && (
          <div className="mb-6">
            {title && (
              <h2 className="text-h3 font-semibold mb-1 text-text-primary">{title}</h2>
            )}
            {description && (
              <p className="text-callout text-text-secondary">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
