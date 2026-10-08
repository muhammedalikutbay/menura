import { describe, expect, it } from "vitest";
import { initials } from "./initials";

describe("initials", () => {
  it("uses the first letters of the first two words", () => {
    expect(initials("Lezzet Durağı")).toBe("LD");
    expect(initials("Deniz Balık Evi")).toBe("DB");
  });

  it("handles a single word, extra spaces and Turkish capitals", () => {
    expect(initials("Menura")).toBe("M");
    expect(initials("  ışık   ocakbaşı ")).toBe("IO");
    expect(initials("")).toBe("");
  });
});
