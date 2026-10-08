/**
 * The 14 allergens that must be declared under the Turkish Food Codex labelling
 * regulation (aligned with EU 1169/2011 Annex II). Codes are stored in the database.
 */
export const ALLERGENS = [
  { code: "gluten", label: "Gluten" },
  { code: "crustaceans", label: "Kabuklular" },
  { code: "eggs", label: "Yumurta" },
  { code: "fish", label: "Balık" },
  { code: "peanuts", label: "Yer fıstığı" },
  { code: "soy", label: "Soya" },
  { code: "milk", label: "Süt" },
  { code: "nuts", label: "Sert kabuklu yemişler" },
  { code: "celery", label: "Kereviz" },
  { code: "mustard", label: "Hardal" },
  { code: "sesame", label: "Susam" },
  { code: "sulphites", label: "Sülfitler" },
  { code: "lupin", label: "Acı bakla" },
  { code: "molluscs", label: "Yumuşakçalar" },
] as const;

export const DIETARY_TAGS = [
  { code: "vegetarian", label: "Vejetaryen" },
  { code: "vegan", label: "Vegan" },
  { code: "gluten_free", label: "Glutensiz" },
  { code: "spicy", label: "Acılı" },
  { code: "new", label: "Yeni" },
  { code: "chef_choice", label: "Şefin önerisi" },
] as const;

export type AllergenCode = (typeof ALLERGENS)[number]["code"];
export type DietaryTagCode = (typeof DIETARY_TAGS)[number]["code"];

export const ALLERGEN_CODES = ALLERGENS.map((a) => a.code) as [AllergenCode, ...AllergenCode[]];
export const DIETARY_TAG_CODES = DIETARY_TAGS.map((t) => t.code) as [DietaryTagCode, ...DietaryTagCode[]];

const allergenLabels = new Map<string, string>(ALLERGENS.map((a) => [a.code, a.label]));
const tagLabels = new Map<string, string>(DIETARY_TAGS.map((t) => [t.code, t.label]));

export const allergenLabel = (code: string) => allergenLabels.get(code) ?? code;
export const tagLabel = (code: string) => tagLabels.get(code) ?? code;
