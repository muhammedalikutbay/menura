import { z } from "zod";
import { ALLERGEN_CODES, DIETARY_TAG_CODES } from "@/lib/menu-attributes";
import { parseMoneyInput } from "@/lib/money";

export const MAX_PRODUCTS = 1000;
export const PRODUCT_NAME_MAX = 80;
export const PRODUCT_DESCRIPTION_MAX = 500;
export const PRODUCT_PREP_TIME_MAX = 20;
export const PRODUCT_CALORIES_MAX = 5000;
/** Largest accepted price in minor units (999.999,99); keeps the integer column far from overflow. */
export const MAX_PRICE_MINOR = 99_999_999;

const PRICE_ERROR = "Geçerli bir fiyat girin.";

/** Price typed into a form ("120", "120,50", "1.250,75") converted to minor units. */
const priceField = z
  .string({ error: PRICE_ERROR })
  .transform((value, ctx) => {
    const minor = parseMoneyInput(value);
    if (minor === null || minor > MAX_PRICE_MINOR) {
      ctx.addIssue({ code: "custom", message: PRICE_ERROR });
      return z.NEVER;
    }
    return minor;
  });

const optionalPriceField = z
  .string({ error: PRICE_ERROR })
  .nullable()
  .optional()
  .transform((value, ctx) => {
    if (value == null || value.trim() === "") return null;
    const minor = parseMoneyInput(value);
    if (minor === null || minor > MAX_PRICE_MINOR) {
      ctx.addIssue({ code: "custom", message: PRICE_ERROR });
      return z.NEVER;
    }
    return minor;
  });

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null));

const optionalCalories = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((value, ctx) => {
    if (value == null) return null;
    const text = String(value).trim();
    if (text === "") return null;
    const parsed = Number(text);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > PRODUCT_CALORIES_MAX) {
      ctx.addIssue({ code: "custom", message: `Kalori 0 ile ${PRODUCT_CALORIES_MAX} arasında bir tam sayı olmalı.` });
      return z.NEVER;
    }
    return parsed;
  });

const uniqueCodes = <T extends [string, ...string[]]>(codes: T) =>
  z
    .array(z.enum(codes))
    .max(codes.length)
    .optional()
    .transform((value) => [...new Set(value ?? [])]);

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Ürün adı gerekli.")
      .max(PRODUCT_NAME_MAX, `Ürün adı en fazla ${PRODUCT_NAME_MAX} karakter olabilir.`),
    categoryId: z.string().min(1, "Bir kategori seçin."),
    description: optionalText(
      PRODUCT_DESCRIPTION_MAX,
      `Açıklama en fazla ${PRODUCT_DESCRIPTION_MAX} karakter olabilir.`,
    ),
    price: priceField,
    discountPrice: optionalPriceField,
    imageMediaId: z
      .string()
      .nullable()
      .optional()
      .transform((value) => value || null),
    isAvailable: z.boolean(),
    isFeatured: z.boolean(),
    prepTime: optionalText(PRODUCT_PREP_TIME_MAX, `Hazırlık süresi en fazla ${PRODUCT_PREP_TIME_MAX} karakter olabilir.`),
    calories: optionalCalories,
    allergens: uniqueCodes(ALLERGEN_CODES),
    tags: uniqueCodes(DIETARY_TAG_CODES),
  })
  .superRefine((value, ctx) => {
    if (typeof value.price === "number" && typeof value.discountPrice === "number") {
      if (value.discountPrice >= value.price) {
        ctx.addIssue({
          code: "custom",
          path: ["discountPrice"],
          message: "İndirimli fiyat normal fiyattan düşük olmalı.",
        });
      }
    }
  });

export const idSchema = z.string().min(1).max(100);
export const idListSchema = z.array(idSchema).min(1).max(MAX_PRODUCTS);

export type ProductInput = z.input<typeof productSchema>;
export type ProductData = z.output<typeof productSchema>;
