import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  customType,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer | Uint8Array }>({
  dataType: () => "bytea",
  fromDriver: (value) => (Buffer.isBuffer(value) ? value : Buffer.from(value)),
});

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* ------------------------------------------------------------------ */
/* Better Auth tables (field names must match Better Auth's model)     */
/* ------------------------------------------------------------------ */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

/* ------------------------------------------------------------------ */
/* Domain tables. Every domain row is owned by exactly one restaurant. */
/* ------------------------------------------------------------------ */

export const restaurant = pgTable(
  "restaurant",
  {
    id: id(),
    ownerId: text("owner_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    logoMediaId: text("logo_media_id"),
    coverMediaId: text("cover_media_id"),
    phone: text("phone"),
    address: text("address"),
    instagram: text("instagram"),
    website: text("website"),
    wifiName: text("wifi_name"),
    wifiPassword: text("wifi_password"),
    currency: text("currency").notNull().default("TRY"),
    themeColor: text("theme_color").notNull().default("#0071E3"),
    isPublished: boolean("is_published").notNull().default(false),
    showVatNote: boolean("show_vat_note").notNull().default(true),
    hideUnavailable: boolean("hide_unavailable").notNull().default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex("restaurant_slug_idx").on(t.slug)],
);

export const media = pgTable(
  "media",
  {
    id: id(),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurant.id, { onDelete: "cascade" }),
    contentType: text("content_type").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    byteSize: integer("byte_size").notNull(),
    data: bytea("data").notNull(),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("media_restaurant_id_idx").on(t.restaurantId)],
);

export const category = pgTable(
  "category",
  {
    id: id(),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurant.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    imageMediaId: text("image_media_id").references(() => media.id, { onDelete: "set null" }),
    position: integer("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("category_restaurant_position_idx").on(t.restaurantId, t.position)],
);

export const product = pgTable(
  "product",
  {
    id: id(),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurant.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    imageMediaId: text("image_media_id").references(() => media.id, { onDelete: "set null" }),
    /** Price in minor units (kuruş for TRY). */
    priceMinor: integer("price_minor").notNull(),
    /** Discounted price in minor units; must be lower than priceMinor. */
    discountPriceMinor: integer("discount_price_minor"),
    isAvailable: boolean("is_available").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    position: integer("position").notNull().default(0),
    /** Free text such as "15-20 dk". */
    prepTime: text("prep_time"),
    calories: integer("calories"),
    /** Allergen codes from src/lib/menu-attributes.ts. */
    allergens: text("allergens").array().notNull().default(sql`'{}'::text[]`),
    /** Dietary tag codes from src/lib/menu-attributes.ts. */
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    ...timestamps,
  },
  (t) => [
    index("product_restaurant_idx").on(t.restaurantId),
    index("product_category_position_idx").on(t.categoryId, t.position),
    check("product_price_non_negative", sql`${t.priceMinor} >= 0`),
    check(
      "product_discount_lower_than_price",
      sql`${t.discountPriceMinor} IS NULL OR (${t.discountPriceMinor} >= 0 AND ${t.discountPriceMinor} < ${t.priceMinor})`,
    ),
  ],
);

export const menuViewDaily = pgTable(
  "menu_view_daily",
  {
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurant.id, { onDelete: "cascade" }),
    day: date("day", { mode: "string" }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.restaurantId, t.day] })],
);

/* ------------------------------------------------------------------ */
/* Relations                                                          */
/* ------------------------------------------------------------------ */

export const restaurantRelations = relations(restaurant, ({ many, one }) => ({
  owner: one(user, { fields: [restaurant.ownerId], references: [user.id] }),
  categories: many(category),
  products: many(product),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  restaurant: one(restaurant, { fields: [category.restaurantId], references: [restaurant.id] }),
  products: many(product),
}));

export const productRelations = relations(product, ({ one }) => ({
  restaurant: one(restaurant, { fields: [product.restaurantId], references: [restaurant.id] }),
  category: one(category, { fields: [product.categoryId], references: [category.id] }),
}));

export type Restaurant = typeof restaurant.$inferSelect;
export type Category = typeof category.$inferSelect;
export type Product = typeof product.$inferSelect;
export type Media = typeof media.$inferSelect;
