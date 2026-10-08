import { describe, expect, it } from "vitest";
import {
  MIN_TEXT_CONTRAST,
  accentForText,
  contrastRatio,
  menuThemeVars,
  normalizeAccent,
  parseHex,
  readableForeground,
} from "./theme";

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    // #767676 on white is the classic 4.54:1 AA boundary example.
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });

  it("is symmetric and tolerates invalid input", () => {
    expect(contrastRatio("#0071e3", "#ffffff")).toBeCloseTo(contrastRatio("#ffffff", "#0071e3"), 10);
    expect(contrastRatio("nope", "#ffffff")).toBe(1);
  });
});

describe("parseHex / normalizeAccent", () => {
  it("parses 3 and 6 digit colors", () => {
    expect(parseHex("#fff")).toEqual([255, 255, 255]);
    expect(parseHex("#0071E3")).toEqual([0, 113, 227]);
    expect(parseHex("0071e3")).toBeNull();
  });

  it("falls back to the default accent for invalid input", () => {
    expect(normalizeAccent("#ABCDEF")).toBe("#abcdef");
    expect(normalizeAccent("red")).toBe("#0071e3");
    expect(normalizeAccent(null)).toBe("#0071e3");
  });
});

describe("readableForeground", () => {
  it("uses white on dark accents and near-black on light accents", () => {
    expect(readableForeground("#0071e3")).toBe("#ffffff");
    expect(readableForeground("#7a1f1f")).toBe("#ffffff");
    expect(readableForeground("#ffd60a")).toBe("#1d1d1f");
    expect(readableForeground("#ffffff")).toBe("#1d1d1f");
  });

  it("reaches AA contrast for the chosen foreground on any accent", () => {
    for (const hex of ["#0071e3", "#ff9500", "#34c759", "#ff3b30", "#ffd60a", "#8e8e93", "#00ffff", "#777777"]) {
      expect(contrastRatio(hex, readableForeground(hex))).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }
  });
});

describe("accentForText", () => {
  it("keeps an accent that already passes", () => {
    expect(accentForText("#1d4ed8", "#f5f5f7", "black")).toBe("#1d4ed8");
  });

  it("darkens a light accent until it is readable on light surfaces", () => {
    const text = accentForText("#ffd60a", "#f5f5f7", "black");
    expect(text).not.toBe("#ffd60a");
    expect(contrastRatio(text, "#f5f5f7")).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it("lightens a dark accent until it is readable on dark surfaces", () => {
    const text = accentForText("#1a237e", "#2c2c2e", "white");
    expect(contrastRatio(text, "#2c2c2e")).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it("falls back to black or white in the worst case", () => {
    expect(accentForText("#ffffff", "#ffffff", "black", 21)).toBe("#000000");
  });
});

describe("menuThemeVars", () => {
  it("exposes the accent, its foreground and a scheme-aware text color", () => {
    const vars = menuThemeVars("#FFD60A");
    expect(vars["--color-accent"]).toBe("#ffd60a");
    expect(vars["--color-accent-fg"]).toBe("#1d1d1f");
    expect(vars["--menu-accent-text"]).toMatch(/^light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\)$/);
  });

  it("uses the default theme for an invalid color", () => {
    expect(menuThemeVars("not-a-color")["--color-accent"]).toBe("#0071e3");
  });
});
