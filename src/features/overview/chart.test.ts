import { describe, expect, it } from "vitest";
import { buildChartBars, formatShortDate, sumLast } from "./chart";

describe("formatShortDate", () => {
  it("formats ISO days with Turkish short month names", () => {
    expect(formatShortDate("2026-10-08")).toBe("8 Eki");
    expect(formatShortDate("2026-01-31")).toBe("31 Oca");
    expect(formatShortDate("2026-08-01")).toBe("1 Ağu");
    expect(formatShortDate("2026-02-15")).toBe("15 Şub");
  });

  it("returns malformed input unchanged", () => {
    expect(formatShortDate("not-a-date")).toBe("not-a-date");
    expect(formatShortDate("2026-13-01")).toBe("2026-13-01");
  });
});

describe("buildChartBars", () => {
  it("scales bars against the highest day", () => {
    const { bars, max, total } = buildChartBars([
      { day: "2026-10-06", count: 10 },
      { day: "2026-10-07", count: 5 },
      { day: "2026-10-08", count: 0 },
    ]);
    expect(max).toBe(10);
    expect(total).toBe(15);
    expect(bars.map((bar) => bar.heightPercent)).toEqual([100, 50, 0]);
    expect(bars[0]?.label).toBe("6 Eki");
  });

  it("keeps tiny non-zero values visible", () => {
    const { bars } = buildChartBars([
      { day: "2026-10-07", count: 1 },
      { day: "2026-10-08", count: 1000 },
    ]);
    expect(bars[0]?.heightPercent).toBeGreaterThanOrEqual(3);
  });

  it("handles a series without any views", () => {
    const { bars, max, total } = buildChartBars([{ day: "2026-10-08", count: 0 }]);
    expect(max).toBe(0);
    expect(total).toBe(0);
    expect(bars[0]?.heightPercent).toBe(0);
  });
});

describe("sumLast", () => {
  const days = [1, 2, 3, 4, 5].map((count, index) => ({ day: `2026-10-0${index + 1}`, count }));

  it("sums the most recent entries", () => {
    expect(sumLast(days, 2)).toBe(9);
    expect(sumLast(days, 5)).toBe(15);
  });

  it("copes with a window larger than the series", () => {
    expect(sumLast(days, 30)).toBe(15);
    expect(sumLast([], 7)).toBe(0);
  });
});
