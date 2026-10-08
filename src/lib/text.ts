/** Lower-cases with Turkish rules and strips diacritics so "Çiğ" matches "cig". */
export function normalizeForSearch(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

const TURKISH_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MIN = 3;
export const SLUG_MAX = 48;

/** Reserved slugs that would clash with routes or look official. */
export const RESERVED_SLUGS = new Set([
  "admin", "api", "app", "dashboard", "demo-menu", "help", "login", "logout", "m", "media",
  "menura", "onboarding", "register", "settings", "support", "www",
]);

export function slugify(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (ch) => TURKISH_MAP[ch] ?? ch)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’]/g, "") // Turkish suffix apostrophes: "Ali'nin" -> "alinin"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}
