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
    <div className="fixed inset-0 z-[z-modal] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-overlay backdrop-blur-default" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={cn(
        "relative w-full max-w-md rounded-lg bg-surface p-6 shadow-lg animate-in fade-in zoom-in duration-200",
        className
      )}>
        {title && (
          <h2 className="text-h3 font-semibold mb-1 text-text-primary">{title}</h2>
        )}
        {description && (
          <p className="text-callout text-text-secondary mb-4">{description}</p>
        )}
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
