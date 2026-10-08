/** Money is stored as integer minor units (kuruş). These helpers are the only conversion points. */

export const SUPPORTED_CURRENCIES = ["TRY", "EUR", "USD", "GBP"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(minor: number, currency: string = "TRY"): string {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    formatters.set(currency, formatter);
  }
  return formatter.format(minor / 100);
}

/**
 * Parses user input such as "120", "120,5", "1.250,75" or "1250.75" into minor units.
 * Returns null when the input is not a valid non-negative amount with at most 2 decimals.
 */
export function parseMoneyInput(input: string): number | null {
  const raw = input.trim().replace(/\s|₺|TL/gi, "");
  if (!raw) return null;

  let normalized: string;
  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    // Both separators present: the last one is the decimal separator.
    normalized = lastComma > lastDot ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  } else if (lastComma > -1) {
    normalized = raw.replace(",", ".");
  } else if (lastDot > -1 && /^\d{1,3}(\.\d{3})+$/.test(raw)) {
    // "1.250" is a Turkish thousands separator, not 1.25.
    normalized = raw.replace(/\./g, "");
  } else {
    normalized = raw;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole = "0", fraction = ""] = normalized.split(".");
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(minor) ? minor : null;
}

/** Formats minor units for an editable input, e.g. 12050 -> "120,50", 12000 -> "120". */
export function toMoneyInput(minor: number | null | undefined): string {
  if (minor == null) return "";
  const whole = Math.floor(minor / 100);
  const fraction = minor % 100;
  return fraction === 0 ? String(whole) : `${whole},${String(fraction).padStart(2, "0")}`;
}
