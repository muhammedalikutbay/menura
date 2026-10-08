import { z } from "zod";

export const MAX_CATEGORIES = 100;
export const CATEGORY_NAME_MAX = 60;
export const CATEGORY_DESCRIPTION_MAX = 200;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Kategori adı gerekli.")
    .max(CATEGORY_NAME_MAX, `Kategori adı en fazla ${CATEGORY_NAME_MAX} karakter olabilir.`),
  description: z
    .string()
    .trim()
    .max(CATEGORY_DESCRIPTION_MAX, `Açıklama en fazla ${CATEGORY_DESCRIPTION_MAX} karakter olabilir.`)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
  imageMediaId: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value || null),
  isActive: z.boolean(),
});

export const idSchema = z.string().min(1).max(100);
export const orderedIdsSchema = z.array(idSchema).max(MAX_CATEGORIES);

export type CategoryInput = z.input<typeof categorySchema>;
export type CategoryData = z.output<typeof categorySchema>;
