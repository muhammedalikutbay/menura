import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into a compact string with suffixes (k, m, b).
 * e.g., 1500 -> 1.5k, 1000000 -> 1m
 */
export function formatCompactNumber(number: number): string {
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + "b";
  }
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + "m";
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + "k";
  }
  return number.toString().replace(".", ",");
}

/**
 * Handles currency input masking:
 * - Converts dots to commas
 * - Limits to 2 decimal places
 * - Removes non-numeric/non-comma characters
 */
export function formatCurrencyInput(value: string): string {
  // Replace dot with comma
  let val = value.replace(/\./g, ",");

  // Remove everything except numbers and comma
  val = val.replace(/[^0-9,]/g, "");

  // Ensure only one comma
  const parts = val.split(",");
  if (parts.length > 2) {
    val = parts[0] + "," + parts.slice(1).join("");
  }

  // Limit to 2 decimal places
  if (parts.length > 1 && parts[1].length > 2) {
    val = parts[0] + "," + parts[1].substring(0, 2);
  }

  return val;
}

/**
 * Converts a masked currency string (with comma) back to a number
 */
export function parseCurrencyInput(value: string): number {
  const normalized = value.replace(/,/g, ".");
  return parseFloat(normalized) || 0;
}
/**
 * Normalizes text for Turkish search.
 * Handles İ/i, I/ı and other characters correctly.
 */
export function normalizeText(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .trim();
}
