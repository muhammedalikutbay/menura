import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/lib/money";
import { RESERVED_SLUGS, SLUG_MAX, SLUG_MIN, SLUG_PATTERN } from "@/lib/text";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `En fazla ${max} karakter olabilir.`)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(SLUG_MIN, `Adres en az ${SLUG_MIN} karakter olmalı.`)
  .max(SLUG_MAX, `Adres en fazla ${SLUG_MAX} karakter olabilir.`)
  .regex(SLUG_PATTERN, "Yalnızca küçük harf, rakam ve tire kullanın.")
  .refine((slug) => !RESERVED_SLUGS.has(slug), "Bu adres kullanılamaz.");

export const restaurantNameSchema = z
  .string()
  .trim()
  .min(2, "Restoran adı en az 2 karakter olmalı.")
  .max(80, "Restoran adı en fazla 80 karakter olabilir.");

export const createRestaurantSchema = z.object({
  name: restaurantNameSchema,
  slug: slugSchema,
});

export const updateRestaurantSchema = z.object({
  name: restaurantNameSchema,
  slug: slugSchema,
  description: optionalText(300),
  phone: optionalText(30),
  address: optionalText(200),
  instagram: optionalText(30).transform((value) => value?.replace(/^@/, "") ?? null),
  website: z
    .union([z.literal(""), z.url("Geçerli bir adres girin (https://...).")])
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
  wifiName: optionalText(64),
  wifiPassword: optionalText(64),
  currency: z.enum(SUPPORTED_CURRENCIES),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçerli bir renk seçin."),
  showVatNote: z.boolean(),
  hideUnavailable: z.boolean(),
  logoMediaId: z.string().nullable().optional(),
  coverMediaId: z.string().nullable().optional(),
});

export type CreateRestaurantInput = z.input<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.input<typeof updateRestaurantSchema>;
