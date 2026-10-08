import { describe, expect, it } from "vitest";
import { formatMoney, parseMoneyInput, toMoneyInput } from "./money";

describe("parseMoneyInput", () => {
  it.each([
    ["120", 12000],
    ["120,5", 12050],
    ["120,50", 12050],
    ["120.5", 12050],
    ["1.250", 125000],
    ["1.250,75", 125075],
    ["1,250.75", 125075],
    [" 99 ₺ ", 9900],
    ["0", 0],
  ])("parses %s", (input, expected) => {
    expect(parseMoneyInput(input)).toBe(expected);
  });

  it.each(["", "abc", "-5", "1,234", "12,345", "1.2.3,4,5", "10,999"])("rejects %s", (input) => {
    expect(parseMoneyInput(input)).toBeNull();
  });
});

describe("toMoneyInput", () => {
  it("round-trips with parseMoneyInput", () => {
    for (const minor of [0, 5, 100, 12050, 125075]) {
      expect(parseMoneyInput(toMoneyInput(minor))).toBe(minor);
    }
  });
});

describe("formatMoney", () => {
  it("formats Turkish lira", () => {
    expect(formatMoney(12050).replace(/\s/g, " ")).toBe("₺120,50");
    expect(formatMoney(12000).replace(/\s/g, " ")).toBe("₺120");
  });
});
