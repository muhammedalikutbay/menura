"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

type CopyLinkButtonProps = Pick<ButtonProps, "variant" | "size" | "className"> & {
  url: string;
  /** Visible text; defaults to "Bağlantıyı kopyala". Pass `null` for an icon-only button. */
  label?: string | null;
};

/** Copies a URL to the clipboard, with a visible and announced confirmation. */
export function CopyLinkButton({ url, label = "Bağlantıyı kopyala", variant = "outline", size, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Bağlantı kopyalandı.");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Bağlantı kopyalanamadı. Lütfen elle kopyalayın.");
    }
  }

  const text = copied ? "Kopyalandı" : (label ?? "Bağlantıyı kopyala");
  const Icon = copied ? Check : Copy;

  return (
    <Button
      variant={variant}
      size={label === null ? "icon" : size}
      className={className}
      onClick={copy}
      aria-label={label === null ? text : undefined}
    >
      <Icon aria-hidden="true" />
      {label !== null && text}
    </Button>
  );
}
