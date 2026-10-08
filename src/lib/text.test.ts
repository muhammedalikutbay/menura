import { describe, expect, it } from "vitest";
import { normalizeForSearch, slugify, SLUG_PATTERN } from "./text";

describe("normalizeForSearch", () => {
  it("matches Turkish letters case-insensitively", () => {
    expect(normalizeForSearch("ÇİĞ KÖFTE")).toBe(normalizeForSearch("cig kofte"));
    expect(normalizeForSearch("Islak Hamburger")).toBe(normalizeForSearch("ıslak hamburger"));
  });
});

describe("slugify", () => {
  it("produces valid slugs from Turkish names", () => {
    expect(slugify("Şükrü'nün Çay Bahçesi")).toBe("sukrunun-cay-bahcesi");
    expect(slugify("  İstanbul Kebap & Izgara  ")).toBe("istanbul-kebap-izgara");
    expect(SLUG_PATTERN.test(slugify("Ögle Yemeği 2"))).toBe(true);
  });
});
