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
  .min(SLUG_MIN, `Menü adresi en az ${SLUG_MIN} karakter olmalı.`)
  .max(SLUG_MAX, `Menü adresi en fazla ${SLUG_MAX} karakter olabilir.`)
  .regex(SLUG_PATTERN, "Yalnızca küçük harf, rakam ve tire kullanın.")
  .refine((slug) => !RESERVED_SLUGS.has(slug), "Bu menü adresi kullanılamaz.");

export const restaurantNameSchema = z
  .string()
  .trim()
  .min(2, "Restoran adı en az 2 karakter olmalı.")
  .max(80, "Restoran adı en fazla 80 karakter olabilir.");

export const createRestaurantSchema = z.object({
  name: restaurantNameSchema,
  slug: slugSchema,
});

/** Instagram handle; also accepts "@name" or a pasted profile URL. Empty becomes null. */
const instagramSchema = z
  .string()
  .trim()
  .transform((value) =>
    value
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/^@/, "")
      .replace(/\/+$/, ""),
  )
  .pipe(
    z.union([
      z.literal(""),
      z.string().regex(/^[A-Za-z0-9._]{1,30}$/, "Geçerli bir kullanıcı adı girin (örn. menura)."),
    ]),
  )
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

/** Only http(s) links: the value is rendered as a link on the public menu. */
const websiteSchema = z
  .string()
  .trim()
  .pipe(
    z.union([
      z.literal(""),
      z.url({ protocol: /^https?$/, error: "Geçerli bir adres girin (https://...)." }),
    ]),
  )
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

export const updateRestaurantSchema = z.object({
  name: restaurantNameSchema,
  slug: slugSchema,
  description: optionalText(300),
  phone: optionalText(30),
  address: optionalText(200),
  instagram: instagramSchema,
  website: websiteSchema,
  wifiName: optionalText(64),
  wifiPassword: optionalText(64),
  currency: z.enum(SUPPORTED_CURRENCIES),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçerli bir renk seçin."),
  showVatNote: z.boolean(),
  hideUnavailable: z.boolean(),
  /** undefined leaves the image unchanged, null removes it. */
  logoMediaId: z.string().nullable().optional(),
  coverMediaId: z.string().nullable().optional(),
});

/** Profile settings without the slug: the public address is changed separately (it breaks QR codes). */
export const updateRestaurantProfileSchema = updateRestaurantSchema.omit({ slug: true });

export const updateSlugSchema = z.object({ slug: slugSchema });

export const setPublishedSchema = z.object({ isPublished: z.boolean() });

export type CreateRestaurantInput = z.input<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.input<typeof updateRestaurantSchema>;
export type UpdateRestaurantProfileInput = z.input<typeof updateRestaurantProfileSchema>;
export type UpdateSlugInput = z.input<typeof updateSlugSchema>;
