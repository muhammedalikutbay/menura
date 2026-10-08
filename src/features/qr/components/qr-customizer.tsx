"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { Download, ExternalLink, FileDown, Printer, RotateCcw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CORNER_STYLE_LABELS,
  CORNER_STYLES,
  DEFAULT_QR_STYLE,
  DOT_STYLE_LABELS,
  DOT_STYLES,
  MIN_SCANNABLE_CONTRAST,
  assessQrColors,
  hasQrLogo,
  type QrStyle,
} from "../style";
import { markQrDownloaded, useStoredQrStyle } from "../storage";
import { ColorField } from "./color-field";
import { CopyLinkButton } from "./copy-link-button";
import { downloadQr } from "./download";
import { OptionGroup } from "./option-group";
import { QrPreview } from "./qr-preview";

type QrCustomizerProps = {
  menuUrl: string;
  restaurantName: string;
  slug: string;
  /** Same-origin URL of the restaurant logo (`/media/<id>`), or null when none is uploaded. */
  logoUrl: string | null;
};

const dotOptions = DOT_STYLES.map((value) => ({ value, label: DOT_STYLE_LABELS[value] }));
const cornerOptions = CORNER_STYLES.map((value) => ({ value, label: CORNER_STYLE_LABELS[value] }));

export function QrCustomizer({ menuUrl, restaurantName, slug, logoUrl }: QrCustomizerProps) {
  const [style, setStyle] = useStoredQrStyle();
  const [busy, setBusy] = useState<"png" | "svg" | null>(null);

  const update = (patch: Partial<QrStyle>) => setStyle({ ...style, ...patch });
  const colors = assessQrColors(style.fg, style.bg);
  const showsLogo = hasQrLogo(style, logoUrl);

  async function download(format: "png" | "svg") {
    setBusy(format);
    try {
      await downloadQr({ style, data: menuUrl, logoUrl, format, fileName: `${slug}-qr` });
      markQrDownloaded();
      toast.success(format === "png" ? "PNG dosyası indirildi." : "SVG dosyası indirildi.");
    } catch {
      toast.error("QR kod oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      {/* Preview and actions */}
      <Card className="gap-6 lg:sticky lg:top-6">
        <CardContent className="flex flex-col items-center gap-6">
          <div className="w-full max-w-96 overflow-hidden rounded-xl bg-surface-muted p-3 shadow-hairline">
            <QrPreview
              style={style}
              data={menuUrl}
              logoUrl={logoUrl}
              label={`${restaurantName} menüsü için QR kod`}
              className="block aspect-square w-full rounded-lg"
            />
          </div>
          <p className="type-caption max-w-full text-center break-all text-fg-muted">{menuUrl}</p>
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <Button onClick={() => download("png")} loading={busy === "png"} disabled={busy !== null}>
              {busy !== "png" && <Download aria-hidden="true" />}
              PNG indir (1024 px)
            </Button>
            <Button variant="secondary" onClick={() => download("svg")} loading={busy === "svg"} disabled={busy !== null}>
              {busy !== "svg" && <FileDown aria-hidden="true" />}
              SVG indir
            </Button>
            <CopyLinkButton url={menuUrl} variant="secondary" className="w-full" />
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "secondary", className: "w-full" })}
            >
              <ExternalLink aria-hidden="true" />
              Menüyü aç
              <span className="sr-only">(yeni sekmede açılır)</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Customization */}
      <div className="flex flex-col gap-6 sm:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Renkler</CardTitle>
            <CardDescription>Koyu kod, açık zemin en iyi okunur.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-3">
              <ColorField label="Kod rengi" value={style.fg} onChange={(fg) => update({ fg })} />
              <ColorField label="Zemin rengi" value={style.bg} onChange={(bg) => update({ bg })} />
            </div>
            {colors.status !== "ok" && (
              <div
                role="status"
                className="flex gap-3 rounded-md bg-warning-soft p-4 text-sm text-warning-text"
              >
                <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p>
                  {colors.status === "inverted"
                    ? "Kod rengi zeminden açık. Birçok telefon ve okuyucu bu tür kodları okuyamaz; kodu koyu, zemini açık seçin."
                    : `Kod ile zemin arasındaki kontrast düşük (${colors.ratio.toFixed(1).replace(".", ",")}:1; en az ${MIN_SCANNABLE_CONTRAST}:1 önerilir). Kod bazı cihazlarda okunmayabilir.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desen</CardTitle>
            <CardDescription>Çok süslü stiller okunabilirliği azaltabilir; baskıdan önce telefonunuzla deneyin.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <OptionGroup legend="Nokta stili" value={style.dots} options={dotOptions} onChange={(dots) => update({ dots })} />
            <OptionGroup
              legend="Köşe stili"
              value={style.corners}
              options={cornerOptions}
              onChange={(corners) => update({ corners })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>
              {logoUrl
                ? "Restoran logonuz kodun ortasında görünür. Logo varken hata düzeltme seviyesi en yükseğe alınır."
                : "Kodun ortasında göstermek için önce Restoran sayfasından logo yükleyin."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Switch
              id="qr-logo"
              checked={showsLogo}
              disabled={!logoUrl}
              onCheckedChange={(logo) => update({ logo })}
            />
            <Label htmlFor="qr-logo">Ortada logo göster</Label>
            {!logoUrl && (
              <Link
                href={"/dashboard/restaurant" as Route}
                className="type-caption text-accent-text underline-offset-4 hover:underline"
              >
                Logo yükle
              </Link>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={"/dashboard/qr/print" as Route} className={buttonVariants({ variant: "secondary" })}>
            <Printer aria-hidden="true" />
            Masa kartlarını yazdır
          </Link>
          <Button
            variant="ghost"
            onClick={() => setStyle(DEFAULT_QR_STYLE)}
          >
            <RotateCcw aria-hidden="true" />
            Varsayılana dön
          </Button>
        </div>
      </div>
    </div>
  );
}
