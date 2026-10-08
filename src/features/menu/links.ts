/** Builders for the outbound links on the public menu. Pure, so they are easy to test. */

export function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** `tel:` link with only dialable characters, or null when there is nothing to dial. */
export function telHref(phone: string): string | null {
  const dialable = phone.replace(/[^\d+]/g, "");
  return /\d/.test(dialable) ? `tel:${dialable}` : null;
}

/** Accepts "@name", "name" or a profile URL; returns the handle or null for anything unsafe. */
export function instagramHandle(input: string): string | null {
  const raw = input
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "");
  return /^[a-z0-9._]{1,30}$/i.test(raw) ? raw : null;
}

export function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}

/** Only http(s) URLs may become links (a stored `javascript:` URL must never be rendered). */
export function safeHttpUrl(input: string): URL | null {
  try {
    const url = new URL(input.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}
