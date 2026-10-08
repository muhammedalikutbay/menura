/** Pure helpers for the printable table-card sheet. */

export const SHEET_LAYOUTS = {
  "2x2": { columns: 2, rows: 2 },
  "3x3": { columns: 3, rows: 3 },
} as const;

export type SheetLayout = keyof typeof SHEET_LAYOUTS;

/** Upper bound of cards in one print job (keeps the page and the print queue sane). */
export const MAX_TABLE_CARDS = 100;

export function cardsPerSheet(layout: SheetLayout): number {
  const { columns, rows } = SHEET_LAYOUTS[layout];
  return columns * rows;
}

/**
 * Labels for a table range ("Masa 1" to "Masa N"). Without a valid upper bound the result is
 * empty and the caller prints identical, unlabeled cards.
 */
export function buildTableLabels(from: number | null, to: number | null, prefix = "Masa"): string[] {
  if (to === null || !Number.isInteger(to) || to < 1) return [];
  const start = from !== null && Number.isInteger(from) && from >= 1 ? from : 1;
  if (to < start) return [];
  const end = Math.min(to, start + MAX_TABLE_CARDS - 1);
  return Array.from({ length: end - start + 1 }, (_, index) => `${prefix} ${start + index}`);
}

/** Cards for one print job: one per label, or a single full sheet of identical cards. */
export function buildCards(labels: string[], layout: SheetLayout): Array<string | null> {
  return labels.length > 0 ? labels : Array.from({ length: cardsPerSheet(layout) }, () => null);
}

export function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) pages.push(items.slice(index, index + size));
  return pages;
}

/** Parses a number input; empty or invalid text becomes null. */
export function parsePositiveInt(value: string): number | null {
  if (!/^\d{1,4}$/.test(value.trim())) return null;
  const parsed = Number(value);
  return parsed >= 1 ? parsed : null;
}
