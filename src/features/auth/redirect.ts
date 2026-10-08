export const DEFAULT_AFTER_LOGIN = "/dashboard";

/**
 * Returns `next` only when it is a same-origin path ("/..." but not "//host" or "/\host");
 * anything else falls back to the dashboard. Guards the post-login redirect against open redirects.
 */
export function safeNextPath(next: string | string[] | null | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || value.length > 512) return DEFAULT_AFTER_LOGIN;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return DEFAULT_AFTER_LOGIN;
  // Control characters (browsers strip tabs/newlines, which can smuggle in "//") and backslashes.
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return DEFAULT_AFTER_LOGIN;
  return value;
}
