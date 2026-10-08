"use client";

import { useSyncExternalStore } from "react";
import { MenuPhonePreview } from "@/features/menu/preview/menu-phone-preview";
import { SAMPLE_MENU } from "@/features/menu/preview/sample-menu";

const WIDE = "(min-width: 640px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** The real guest menu in a 3D phone: 360px wide from 640px up, 300px below (fits a 360px screen). */
export function HeroPhone() {
  const wide = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
  return <MenuPhonePreview menu={SAMPLE_MENU} size={wide ? "lg" : "md"} />;
}
