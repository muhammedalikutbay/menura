import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MenuView } from "../components/menu-view";
import { MenuPhonePreview } from "./menu-phone-preview";
import { SAMPLE_MENU } from "./sample-menu";

describe("MenuPhonePreview", () => {
  const html = renderToString(<MenuPhonePreview menu={SAMPLE_MENU} />);

  it("server-renders the sample menu inside a labelled region", () => {
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Örnek menü önizlemesi"');
    expect(html).toContain("Lezzet Durağı");
    for (const name of ["Domates Çorbası", "Çıtır Tavuk", "Humus", "Antrikot Izgara", "Somon Izgara", "Tiramisu", "Sıcak Brownie"]) {
      expect(html).toContain(name);
    }
    expect(html).toContain("Öne çıkanlar");
    expect(html).toMatch(/246,50/);
    expect(html).toContain("Vejetaryen");
  });

  it("makes the menu root the scroll container", () => {
    expect(html).toContain("data-menu-root");
    expect(html).toMatch(/data-menu-root[^>]*class="[^"]*overflow-y-auto/);
  });

  it("does not render outbound links, a main landmark or a second h1", () => {
    expect(html).not.toMatch(/<a[\s>]/);
    expect(html).not.toContain("tel:");
    expect(html).not.toContain("google.com/maps");
    expect(html).not.toContain("instagram.com");
    expect(html).not.toContain("<main");
    expect(html).not.toContain("<h1");
    expect(html).not.toContain("_blank");
  });

  it("keeps chips and product rows interactive", () => {
    expect(html).toMatch(/<button[^>]*data-chip="sample-baslangiclar"/);
    expect(html).toMatch(/<button[^>]*data-product-id="sample-corba"/);
  });

  it("scales the frame to the requested size", () => {
    expect(html).toMatch(/width:360px/);
    expect(renderToString(<MenuPhonePreview menu={SAMPLE_MENU} size="md" />)).toMatch(/width:300px/);
    expect(renderToString(<MenuPhonePreview menu={SAMPLE_MENU} size="sm" />)).toMatch(/width:260px/);
    expect(html).toContain("rotateX(var(--tilt-x, 6deg)) rotateY(var(--tilt-y, -14deg)) rotateZ(1deg)");
  });
});

describe("MenuView page mode", () => {
  const html = renderToString(<MenuView menu={SAMPLE_MENU} mode="page" />);

  it("keeps links, landmark and h1 of the public page", () => {
    expect(html).toContain("<main");
    expect(html).toContain("<h1");
    expect(html).toContain('href="tel:+903625550123"');
    expect(html).toMatch(/<a[^>]*href="#s-sample-baslangiclar"/);
    expect(html).not.toContain("data-menu-root");
    expect(html).not.toContain("Örnek menü önizlemesi");
  });
});
