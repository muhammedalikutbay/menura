"use client";

import { Check, Copy, Wifi } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { infoPillClass } from "./info-pill";

export function WifiDialog({
  name,
  password,
  themeStyle,
}: {
  name: string;
  password: string | null;
  /** The dialog renders in a portal outside the themed wrapper, so it needs the theme variables itself. */
  themeStyle: React.CSSProperties;
}) {
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("Şifre kopyalandı");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalanamadı. Şifreye basılı tutarak kopyalayabilirsiniz.");
    }
  }

  return (
    <Dialog onOpenChange={(open) => !open && setCopied(false)}>
      <DialogTrigger className={infoPillClass}>
        <Wifi aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
        <span>Wi-Fi</span>
      </DialogTrigger>
      <DialogContent
        title="Wi-Fi bilgileri"
        description="Ağa bağlanmak için aşağıdaki bilgileri kullanın."
        style={themeStyle}
        className="[&_:focus-visible]:outline-(color:--menu-accent-text)"
      >
        <dl className="flex flex-col gap-4 rounded-lg bg-surface-muted p-4">
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-fg-muted">Ağ adı</dt>
            <dd className="text-lg font-semibold break-all select-all">{name}</dd>
          </div>
          {password && (
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-medium text-fg-muted">Şifre</dt>
              <dd className="font-mono text-lg font-semibold break-all select-all">{password}</dd>
            </div>
          )}
        </dl>
        {password && (
          <Button variant="primary" size="lg" onClick={copyPassword}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? "Kopyalandı" : "Şifreyi kopyala"}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
