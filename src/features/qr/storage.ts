"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_QR_STYLE, parseQrStyle, type QrStyle } from "./style";

/**
 * Browser-only persistence for the QR page. localStorage can be unavailable (private mode,
 * blocked site data), so every access is wrapped and the UI works without it.
 */

const STYLE_KEY = "menura:qr-style";
const DOWNLOADED_KEY = "menura:qr-downloaded";
const CHANGE_EVENT = "menura:qr-storage";

/** Fallback so the controls keep working for this visit when localStorage is unavailable. */
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the in-memory copy above still serves this visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Called after a successful PNG or SVG download; read by the dashboard checklist. */
export function markQrDownloaded() {
  write(DOWNLOADED_KEY, "1");
}

export function useQrDownloaded(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => read(DOWNLOADED_KEY) === "1",
    () => false,
  );
}

/**
 * The persisted style. The server render and the first client render use the default;
 * the stored value applies right after hydration. Without working storage, changes last
 * until the page is reloaded.
 */
export function useStoredQrStyle(): [QrStyle, (next: QrStyle) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(STYLE_KEY),
    () => null,
  );
  const setStyle = useCallback((next: QrStyle) => write(STYLE_KEY, JSON.stringify(next)), []);
  return [raw === null ? DEFAULT_QR_STYLE : parseQrStyle(raw), setStyle];
}
