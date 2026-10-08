import "server-only";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { menuViewDaily, restaurant } from "@/db/schema";

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse/i;

/** Today's date in Turkey (UTC+3, no DST) as YYYY-MM-DD; the product's reporting timezone. */
export function reportingDay(now = new Date()): string {
  return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Counts one menu view for a published restaurant. Returns false when nothing was counted. */
export async function recordMenuView(slug: string, userAgent: string | null): Promise<boolean> {
  if (userAgent && BOT_PATTERN.test(userAgent)) return false;
  const [target] = await db
    .select({ id: restaurant.id })
    .from(restaurant)
    .where(and(eq(restaurant.slug, slug), eq(restaurant.isPublished, true)))
    .limit(1);
  if (!target) return false;

  await db
    .insert(menuViewDaily)
    .values({ restaurantId: target.id, day: reportingDay(), count: 1 })
    .onConflictDoUpdate({
      target: [menuViewDaily.restaurantId, menuViewDaily.day],
      set: { count: sql`${menuViewDaily.count} + 1` },
    });
  return true;
}

export type DailyViews = { day: string; count: number };

/** Views per day for the last `days` days (oldest first), with missing days filled as 0. */
export async function getDailyViews(restaurantId: string, days: number): Promise<DailyViews[]> {
  const today = reportingDay();
  const start = new Date(`${today}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const startDay = start.toISOString().slice(0, 10);

  const rows = await db
    .select({ day: menuViewDaily.day, count: menuViewDaily.count })
    .from(menuViewDaily)
    .where(and(eq(menuViewDaily.restaurantId, restaurantId), gte(menuViewDaily.day, startDay)));
  const byDay = new Map(rows.map((row) => [row.day, row.count]));

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const day = date.toISOString().slice(0, 10);
    return { day, count: byDay.get(day) ?? 0 };
  });
}

export async function getTotalViews(restaurantId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${menuViewDaily.count}), 0)::int` })
    .from(menuViewDaily)
    .where(eq(menuViewDaily.restaurantId, restaurantId));
  return row?.total ?? 0;
}
