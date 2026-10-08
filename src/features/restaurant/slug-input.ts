import { slugify, SLUG_MAX } from "@/lib/text";

/**
 * Cleans a slug while the user is typing: Turkish letters are transliterated, spaces and
 * punctuation become single hyphens, and a trailing hyphen is kept so "kafe-" can become "kafe-bar".
 */
export function sanitizeSlugInput(value: string): string {
  const base = slugify(value);
  const endsWithSeparator = /[^\p{L}\p{N}]$/u.test(value);
  return endsWithSeparator && base && base.length < SLUG_MAX ? `${base}-` : base;
}

/** "https://menura.app" -> "menura.app", for showing the public address without the scheme. */
export function displayHost(appUrl: string): string {
  try {
    return new URL(appUrl).host;
  } catch {
    return appUrl.replace(/^https?:\/\//, "");
  }
}
