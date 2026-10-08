import { describe, expect, it } from "vitest";
import { displayHost, sanitizeSlugInput } from "./slug-input";

describe("sanitizeSlugInput", () => {
  it("transliterates Turkish letters and lowercases", () => {
    expect(sanitizeSlugInput("Çiğ Köfte")).toBe("cig-kofte");
  });

  it("keeps a trailing separator while typing", () => {
    expect(sanitizeSlugInput("kafe ")).toBe("kafe-");
    expect(sanitizeSlugInput("kafe-")).toBe("kafe-");
  });

  it("drops leading separators and invalid characters", () => {
    expect(sanitizeSlugInput("  --Kafe!!")).toBe("kafe-");
    expect(sanitizeSlugInput("")).toBe("");
  });
});

describe("displayHost", () => {
  it("strips the scheme", () => {
    expect(displayHost("https://menura.app")).toBe("menura.app");
    expect(displayHost("http://localhost:3000")).toBe("localhost:3000");
  });
});
