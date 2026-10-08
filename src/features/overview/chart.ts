/** Pure helpers for the dashboard views chart (no server imports; safe on both sides). */

const MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"] as const;

export type DayCount = { day: string; count: number };

/** "2026-10-08" -> "8 Eki". Falls back to the input for malformed dates. */
export function formatShortDate(day: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return day;
  const month = MONTHS_SHORT[Number(match[2]) - 1];
  return month ? `${Number(match[3])} ${month}` : day;
}

export type ChartBar = {
  day: string;
  label: string;
  count: number;
  /** 0-100; at least `MIN_VISIBLE_PERCENT` for non-zero counts so tiny values stay visible. */
  heightPercent: number;
};

const MIN_VISIBLE_PERCENT = 3;

export function buildChartBars(days: DayCount[]): { bars: ChartBar[]; max: number; total: number } {
  const max = days.reduce((highest, entry) => Math.max(highest, entry.count), 0);
  const total = days.reduce((sum, entry) => sum + entry.count, 0);
  const bars = days.map((entry) => ({
    day: entry.day,
    label: formatShortDate(entry.day),
    count: entry.count,
    heightPercent: max === 0 || entry.count === 0 ? 0 : Math.max(MIN_VISIBLE_PERCENT, (entry.count / max) * 100),
  }));
  return { bars, max, total };
}

/** Sum of the most recent `n` entries of an oldest-first series. */
export function sumLast(days: DayCount[], n: number): number {
  return days.slice(-n).reduce((sum, entry) => sum + entry.count, 0);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}
