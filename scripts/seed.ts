/**
 * Creates (or recreates with --reset) the public demo restaurant at /m/demo.
 * Images are fetched from Unsplash once and cached under .data/seed-images; the seed
 * still succeeds offline, just without images.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { createDatabase } from "../src/db/client";
import { runMigrations } from "../src/db/migrate";
import * as s from "../src/db/schema";
import { processImage } from "../src/features/media/process-image";
import seedData from "./seed-data.json" with { type: "json" };

const DEMO_SLUG = "demo";
const IMAGE_CACHE_DIR = ".data/seed-images";

type SeedProduct = { name: string; description: string | null; price: number; image: string | null };

/** Allergens and tags per demo category, so the demo shows those features. */
const CATEGORY_ATTRIBUTES: Record<string, { allergens: string[]; tags: string[] }> = {
  "Başlangıçlar": { allergens: ["gluten", "milk"], tags: [] },
  "Ana Yemekler": { allergens: ["milk"], tags: ["chef_choice"] },
  "Burgerler": { allergens: ["gluten", "milk", "eggs", "sesame", "mustard"], tags: [] },
  "Pizzalar": { allergens: ["gluten", "milk"], tags: ["vegetarian"] },
  "Tatlılar": { allergens: ["gluten", "milk", "eggs", "nuts"], tags: ["vegetarian"] },
  "Soğuk İçecekler": { allergens: [], tags: ["vegan", "gluten_free"] },
  "Sıcak İçecekler": { allergens: ["milk"], tags: ["vegetarian", "gluten_free"] },
  "Çocuk Menüsü": { allergens: ["gluten", "milk", "eggs"], tags: [] },
};

const url = process.env.DATABASE_URL;
const db = createDatabase(url);
await runMigrations(db, url);

const reset = process.argv.includes("--reset");
const [existing] = await db.select().from(s.restaurant).where(eq(s.restaurant.slug, DEMO_SLUG));
if (existing && !reset) {
  console.info("Demo restaurant already exists. Use --reset to recreate it.");
  process.exit(0);
}
if (existing) {
  await db.delete(s.user).where(eq(s.user.id, existing.ownerId));
}

await mkdir(IMAGE_CACHE_DIR, { recursive: true });

async function loadImage(source: string | null): Promise<Buffer | null> {
  if (!source) return null;
  const file = `${IMAGE_CACHE_DIR}/${createHash("sha1").update(source).digest("hex")}.bin`;
  try {
    return await readFile(file);
  } catch {
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) return null;
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(file, buffer);
      return buffer;
    } catch {
      return null;
    }
  }
}

const mediaIds = new Map<string, string>();
async function storeImage(restaurantId: string, source: string | null): Promise<string | null> {
  if (!source) return null;
  const cached = mediaIds.get(source);
  if (cached) return cached;
  const raw = await loadImage(source);
  if (!raw) return null;
  try {
    const image = await processImage(raw);
    const [row] = await db
      .insert(s.media)
      .values({ restaurantId, ...image })
      .returning({ id: s.media.id });
    if (!row) return null;
    mediaIds.set(source, row.id);
    return row.id;
  } catch {
    return null;
  }
}

// The demo owner has no credential account, so nobody can sign in as it.
const ownerId = crypto.randomUUID();
await db.insert(s.user).values({
  id: ownerId,
  name: "Menura Demo",
  email: `demo+${randomBytes(4).toString("hex")}@menura.invalid`,
  emailVerified: true,
});

const [demo] = await db
  .insert(s.restaurant)
  .values({
    ownerId,
    slug: DEMO_SLUG,
    name: "Lezzet Durağı",
    description: "Mahallenin sıcak mutfağı: güne kahvaltıyla başlar, akşamı ızgarayla kapatır.",
    phone: "+90 362 000 00 00",
    address: "Atakum, Samsun",
    instagram: "menura",
    isPublished: true,
  })
  .returning();
if (!demo) throw new Error("Demo restaurant could not be created.");

let imageCount = 0;
for (const [categoryIndex, seedCategory] of seedData.entries()) {
  const [created] = await db
    .insert(s.category)
    .values({
      restaurantId: demo.id,
      name: seedCategory.name,
      description: seedCategory.description,
      imageMediaId: await storeImage(demo.id, seedCategory.image),
      position: categoryIndex,
    })
    .returning({ id: s.category.id });
  if (!created) continue;

  const attributes = CATEGORY_ATTRIBUTES[seedCategory.name] ?? { allergens: [], tags: [] };
  for (const [productIndex, seedProduct] of (seedCategory.products as SeedProduct[]).entries()) {
    const imageMediaId = await storeImage(demo.id, seedProduct.image);
    if (imageMediaId) imageCount++;
    await db.insert(s.product).values({
      restaurantId: demo.id,
      categoryId: created.id,
      name: seedProduct.name,
      description: seedProduct.description,
      imageMediaId,
      priceMinor: Math.round(seedProduct.price * 100),
      // A couple of discounted and featured items to exercise those states.
      discountPriceMinor: productIndex === 1 ? Math.round(seedProduct.price * 85) : null,
      isFeatured: productIndex === 0,
      position: productIndex,
      allergens: attributes.allergens,
      tags: attributes.tags,
    });
  }
}

console.info(`Demo restaurant seeded at /m/${DEMO_SLUG} (${seedData.length} categories, ${imageCount} product images).`);
process.exit(0);
