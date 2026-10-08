import { z } from "zod";
import type { Options } from "qr-code-styling";

/** QR style model, validation and the mapping to qr-code-styling options. Pure; safe on both sides. */

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const DOT_STYLES = ["square", "rounded", "dots", "classy"] as const;
export const CORNER_STYLES = ["square", "rounded", "circle"] as const;

export const qrStyleSchema = z.object({
  fg: hexColor,
  bg: hexColor,
  dots: z.enum(DOT_STYLES),
  corners: z.enum(CORNER_STYLES),
  /** Show the restaurant logo in the center (only applies when the restaurant has one). */
  logo: z.boolean(),
});

export type QrStyle = z.infer<typeof qrStyleSchema>;

export const DEFAULT_QR_STYLE: QrStyle = {
  fg: "#1d1d1f",
  bg: "#ffffff",
  dots: "rounded",
  corners: "rounded",
  logo: true,
};

export const DOT_STYLE_LABELS: Record<QrStyle["dots"], string> = {
  square: "Kare",
  rounded: "Yuvarlak",
  dots: "Noktalı",
  classy: "Zarif",
};

export const CORNER_STYLE_LABELS: Record<QrStyle["corners"], string> = {
  square: "Kare",
  rounded: "Yuvarlatılmış",
  circle: "Daire",
};

/** Parses a stored style (e.g. from localStorage); anything invalid falls back to the default. */
export function parseQrStyle(raw: string | null | undefined): QrStyle {
  if (!raw) return DEFAULT_QR_STYLE;
  try {
    const parsed = qrStyleSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : DEFAULT_QR_STYLE;
  } catch {
    return DEFAULT_QR_STYLE;
  }
}

/* ------------------------------------------------------------------ */
/* Color contrast                                                      */
/* ------------------------------------------------------------------ */

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of a `#rrggbb` color. */
export function relativeLuminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = channelToLinear((value >> 16) & 0xff);
  const g = channelToLinear((value >> 8) & 0xff);
  const b = channelToLinear(value & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two `#rrggbb` colors (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

/** Below this ratio many phone cameras struggle to separate the modules from the background. */
export const MIN_SCANNABLE_CONTRAST = 4;

export type QrColorAssessment = {
  /** `inverted`: light code on a darker background, which several scanners cannot read. */
  status: "ok" | "low" | "inverted";
  ratio: number;
};

export function assessQrColors(fg: string, bg: string): QrColorAssessment {
  const ratio = contrastRatio(fg, bg);
  if (relativeLuminance(fg) > relativeLuminance(bg)) return { status: "inverted", ratio };
  return { status: ratio < MIN_SCANNABLE_CONTRAST ? "low" : "ok", ratio };
}

/* ------------------------------------------------------------------ */
/* qr-code-styling options                                             */
/* ------------------------------------------------------------------ */

const DOT_TYPE = {
  square: "square",
  rounded: "rounded",
  dots: "dots",
  classy: "classy-rounded",
} as const satisfies Record<QrStyle["dots"], string>;

const CORNER_TYPES = {
  square: { frame: "square", dot: "square" },
  rounded: { frame: "extra-rounded", dot: "dot" },
  circle: { frame: "dot", dot: "dot" },
} as const satisfies Record<QrStyle["corners"], { frame: string; dot: string }>;

/** Quiet zone around the code as a share of the image size (about 4 modules for typical menu URLs). */
const MARGIN_RATIO = 0.09;

export function hasQrLogo(style: QrStyle, logoUrl: string | null | undefined): logoUrl is string {
  return style.logo && Boolean(logoUrl);
}

export function buildQrOptions(
  style: QrStyle,
  input: { data: string; size: number; logoUrl?: string | null; type: "svg" | "canvas" },
): Options {
  const logoUrl = input.logoUrl;
  const withLogo = hasQrLogo(style, logoUrl);
  const corner = CORNER_TYPES[style.corners];
  return {
    type: input.type,
    width: input.size,
    height: input.size,
    margin: Math.round(input.size * MARGIN_RATIO),
    data: input.data,
    ...(withLogo ? { image: logoUrl } : {}),
    // A logo hides modules, so it needs the highest error correction.
    qrOptions: { errorCorrectionLevel: withLogo ? "H" : "Q" },
    imageOptions: {
      saveAsBlob: true,
      hideBackgroundDots: true,
      imageSize: 0.26,
      margin: Math.max(2, Math.round(input.size * 0.01)),
      crossOrigin: "anonymous",
    },
    dotsOptions: { type: DOT_TYPE[style.dots], color: style.fg },
    cornersSquareOptions: { type: corner.frame, color: style.fg },
    cornersDotOptions: { type: corner.dot, color: style.fg },
    backgroundOptions: { color: style.bg },
  };
}
