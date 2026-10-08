import { z } from "zod";
import { recordMenuView } from "@/features/analytics/server";
import { slugSchema } from "@/features/restaurant/schema";

const bodySchema = z.object({ slug: slugSchema });

/** Beacon sent once per browser session by the public menu (see features/menu ViewBeacon). */
export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return new Response(null, { status: 400 });
  await recordMenuView(body.data.slug, request.headers.get("user-agent"));
  return new Response(null, { status: 204 });
}
