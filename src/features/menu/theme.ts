/**
 * Per-restaurant theming for the public menu. Pure helpers (usable on both sides) that turn the
 * restaurant's accent color into CSS custom properties with guaranteed readable contrast.
 */

export const DEFAULT_ACCENT = "#0071e3";

type Rgb = readonly [number, number, number];

/** Foreground candidates for text on top of the accent color (the UI kit's fg token and white). */
const LIGHT_FOREGROUND = "#ffffff";
const DARK_FOREGROUND = "#1d1d1f";

/** Backgrounds accent-colored text can appear on (the muted surfaces are the stricter ones). */
const LIGHT_TEXT_BACKGROUND = "#f5f5f7";
const DARK_TEXT_BACKGROUND = "#2c2c2e";

/** WCAG AA for normal-size text. */
export const MIN_TEXT_CONTRAST = 4.5;

export function parseHex(input: string): Rgb | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!match) return null;
  let hex = match[1]!;
  if (hex.length === 3) hex = [...hex].map((ch) => ch + ch).join("");
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

/** WCAG 2.x relative luminance of an sRGB color. */
export function relativeLuminance([r, g, b]: Rgb): number {
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG contrast ratio (1 to 21) between two hex colors. Invalid input counts as no contrast. */
export function contrastRatio(a: string, b: string): number {
  const first = parseHex(a);
  const second = parseHex(b);
  if (!first || !second) return 1;
  const [hi, lo] = [relativeLuminance(first), relativeLuminance(second)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** A valid 6-digit lower-case hex color, falling back to the default accent. */
export function normalizeAccent(input: string | null | undefined): string {
  const rgb = input ? parseHex(input) : null;
  return rgb ? toHex(rgb) : DEFAULT_ACCENT;
}

/**
 * The text color for content on top of `background`: white or the UI kit's near-black, whichever
 * reads better; pure black for the few mid-tones where neither reaches AA.
 */
export function readableForeground(background: string): string {
  const color = normalizeAccent(background);
  const onWhite = contrastRatio(color, LIGHT_FOREGROUND);
  const onDark = contrastRatio(color, DARK_FOREGROUND);
  if (Math.max(onWhite, onDark) < MIN_TEXT_CONTRAST) return "#000000";
  return onWhite >= onDark ? LIGHT_FOREGROUND : DARK_FOREGROUND;
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ];
}

/**
 * The accent shifted toward `target` (black on light backgrounds, white on dark ones) just enough
 * to reach `minContrast` against `background`. In the worst case it ends at the target itself,
 * which is the same as falling back to the regular foreground color.
 */
export function accentForText(
  accent: string,
  background: string,
  target: "black" | "white",
  minContrast: number = MIN_TEXT_CONTRAST,
): string {
  const base = parseHex(normalizeAccent(accent))!;
  const end: Rgb = target === "black" ? [0, 0, 0] : [255, 255, 255];
  for (let step = 0; step <= 20; step += 1) {
    const candidate = toHex(mix(base, end, step / 20));
    if (contrastRatio(candidate, background) >= minContrast) return candidate;
  }
  return toHex(end);
}

/**
 * Inline CSS variables for the menu wrapper:
 * - `--color-accent` / `--color-accent-fg`: fills (active chip, gradients) and the text on them,
 * - `--menu-accent-text`: the accent as small text or thin lines, adjusted per color scheme.
 */
export function menuThemeVars(themeColor: string | null | undefined): Record<string, string> {
  const accent = normalizeAccent(themeColor);
  const onLight = accentForText(accent, LIGHT_TEXT_BACKGROUND, "black");
  const onDark = accentForText(accent, DARK_TEXT_BACKGROUND, "white");
  return {
    "--color-accent": accent,
    "--color-accent-fg": readableForeground(accent),
    "--menu-accent-text": `light-dark(${onLight}, ${onDark})`,
  };
}
