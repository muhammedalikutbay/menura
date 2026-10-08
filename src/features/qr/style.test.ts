import { describe, expect, it } from "vitest";
import { MAX_TABLE_CARDS, buildCards, buildTableLabels, cardsPerSheet, chunk, parsePositiveInt } from "./print";
import {
  DEFAULT_QR_STYLE,
  assessQrColors,
  buildQrOptions,
  contrastRatio,
  hasQrLogo,
  parseQrStyle,
} from "./style";

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 1);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#0071e3", "#ffffff")).toBeCloseTo(contrastRatio("#ffffff", "#0071e3"), 10);
  });
});

describe("assessQrColors", () => {
  it("accepts dark code on a light background", () => {
    expect(assessQrColors("#1d1d1f", "#ffffff").status).toBe("ok");
  });

  it("flags low contrast", () => {
    expect(assessQrColors("#bbbbbb", "#ffffff").status).toBe("low");
    expect(assessQrColors("#0071e3", "#2a7de1").status).toBe("low");
  });

  it("flags inverted codes even with high contrast", () => {
    const result = assessQrColors("#ffffff", "#000000");
    expect(result.status).toBe("inverted");
    expect(result.ratio).toBeCloseTo(21, 5);
  });
});

describe("parseQrStyle", () => {
  it("falls back to the default for missing or broken input", () => {
    expect(parseQrStyle(null)).toEqual(DEFAULT_QR_STYLE);
    expect(parseQrStyle("")).toEqual(DEFAULT_QR_STYLE);
    expect(parseQrStyle("{not json")).toEqual(DEFAULT_QR_STYLE);
    expect(parseQrStyle(JSON.stringify({ ...DEFAULT_QR_STYLE, fg: "red" }))).toEqual(DEFAULT_QR_STYLE);
    expect(parseQrStyle(JSON.stringify({ ...DEFAULT_QR_STYLE, dots: "hearts" }))).toEqual(DEFAULT_QR_STYLE);
  });

  it("round-trips a valid style", () => {
    const style = { fg: "#112233", bg: "#fafafa", dots: "classy", corners: "circle", logo: false } as const;
    expect(parseQrStyle(JSON.stringify(style))).toEqual(style);
  });
});

describe("buildQrOptions", () => {
  const input = { data: "https://menura.app/m/demo", size: 1024, type: "svg" } as const;

  it("uses error correction H only when a logo is shown", () => {
    const withLogo = buildQrOptions(DEFAULT_QR_STYLE, { ...input, logoUrl: "/media/abc" });
    expect(withLogo.image).toBe("/media/abc");
    expect(withLogo.qrOptions?.errorCorrectionLevel).toBe("H");

    const without = buildQrOptions(DEFAULT_QR_STYLE, { ...input, logoUrl: null });
    expect(without.image).toBeUndefined();
    expect(without.qrOptions?.errorCorrectionLevel).toBe("Q");

    const disabled = buildQrOptions({ ...DEFAULT_QR_STYLE, logo: false }, { ...input, logoUrl: "/media/abc" });
    expect(disabled.image).toBeUndefined();
    expect(hasQrLogo({ ...DEFAULT_QR_STYLE, logo: false }, "/media/abc")).toBe(false);
  });

  it("maps colors and styles and leaves a quiet zone", () => {
    const options = buildQrOptions(
      { fg: "#112233", bg: "#fafafa", dots: "classy", corners: "circle", logo: false },
      { ...input, logoUrl: null },
    );
    expect(options.dotsOptions).toEqual({ type: "classy-rounded", color: "#112233" });
    expect(options.cornersSquareOptions?.type).toBe("dot");
    expect(options.backgroundOptions?.color).toBe("#fafafa");
    expect(options.margin).toBeGreaterThan(0);
    expect(options.width).toBe(1024);
  });
});

describe("table cards", () => {
  it("builds labels for a range", () => {
    expect(buildTableLabels(1, 3)).toEqual(["Masa 1", "Masa 2", "Masa 3"]);
    expect(buildTableLabels(5, 6)).toEqual(["Masa 5", "Masa 6"]);
    expect(buildTableLabels(null, 2)).toEqual(["Masa 1", "Masa 2"]);
  });

  it("returns no labels without a valid upper bound or for an inverted range", () => {
    expect(buildTableLabels(1, null)).toEqual([]);
    expect(buildTableLabels(1, 0)).toEqual([]);
    expect(buildTableLabels(8, 3)).toEqual([]);
  });

  it("caps the number of cards", () => {
    expect(buildTableLabels(1, 5000)).toHaveLength(MAX_TABLE_CARDS);
  });

  it("fills a sheet with identical cards when no labels are given", () => {
    expect(buildCards([], "2x2")).toEqual([null, null, null, null]);
    expect(buildCards([], "3x3")).toHaveLength(9);
    expect(buildCards(["Masa 1"], "3x3")).toEqual(["Masa 1"]);
  });

  it("splits cards into sheets", () => {
    const pages = chunk(buildTableLabels(1, 10), cardsPerSheet("2x2"));
    expect(pages.map((page) => page.length)).toEqual([4, 4, 2]);
    expect(chunk([], 4)).toEqual([]);
  });

  it("parses number inputs strictly", () => {
    expect(parsePositiveInt("12")).toBe(12);
    expect(parsePositiveInt(" 7 ")).toBe(7);
    expect(parsePositiveInt("")).toBeNull();
    expect(parsePositiveInt("0")).toBeNull();
    expect(parsePositiveInt("-3")).toBeNull();
    expect(parsePositiveInt("2.5")).toBeNull();
    expect(parsePositiveInt("abc")).toBeNull();
  });
});
