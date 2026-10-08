import { describe, expect, it } from "vitest";
import { safeNextPath } from "./redirect";

describe("safeNextPath", () => {
  it("keeps same-origin paths with query strings", () => {
    expect(safeNextPath("/dashboard/products")).toBe("/dashboard/products");
    expect(safeNextPath("/dashboard/qr?x=1")).toBe("/dashboard/qr?x=1");
  });

  it("falls back for missing, relative, protocol-relative and absolute targets", () => {
    const unsafe = [undefined, null, "", "dashboard", "//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "/\t/evil.com", "/a\\b"];
    for (const value of unsafe) {
      expect(safeNextPath(value)).toBe("/dashboard");
    }
  });

  it("uses the first value when the param is repeated", () => {
    expect(safeNextPath(["/dashboard/qr", "//evil.com"])).toBe("/dashboard/qr");
  });
});
