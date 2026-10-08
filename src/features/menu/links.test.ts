import { describe, expect, it } from "vitest";
import { instagramHandle, mapsSearchUrl, safeHttpUrl, telHref } from "./links";

describe("menu links", () => {
  it("encodes the address for Google Maps", () => {
    const url = new URL(mapsSearchUrl("Bağdat Cd. 12, Kadıköy"));
    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/search/");
    expect(url.searchParams.get("query")).toBe("Bağdat Cd. 12, Kadıköy");
  });

  it("keeps only dialable characters in tel links", () => {
    expect(telHref("+90 (212) 555 00 11")).toBe("tel:+902125550011");
    expect(telHref("n/a")).toBeNull();
  });

  it("accepts handles and profile URLs, rejects anything else", () => {
    expect(instagramHandle("@menura.app")).toBe("menura.app");
    expect(instagramHandle("https://www.instagram.com/menura.app/?hl=tr")).toBe("menura.app");
    expect(instagramHandle("bad handle")).toBeNull();
    expect(instagramHandle("javascript:alert(1)")).toBeNull();
  });

  it("only turns http(s) URLs into links", () => {
    expect(safeHttpUrl("https://menura.app")?.hostname).toBe("menura.app");
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("not a url")).toBeNull();
  });
});
