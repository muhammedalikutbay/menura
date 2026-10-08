import { z } from "zod";
import { recordMenuView } from "@/features/analytics/server";
import { SLUG_MAX, SLUG_PATTERN } from "@/lib/text";

// Format check only: reserved slugs (e.g. the seeded "demo" menu) must still be countable.
const bodySchema = z.object({ slug: z.string().max(SLUG_MAX).regex(SLUG_PATTERN) });
const MAX_BODY_BYTES = 1024;

/**
 * Beacon sent once per browser session by the public menu (see features/menu ViewBeacon).
 * View counts are a best-effort metric: only same-origin browser requests are accepted,
 * which stops casual cross-site inflation but not a determined script.
 */
export async function POST(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return new Response(null, { status: 403 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return new Response(null, { status: 413 });
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });

  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const body = bodySchema.safeParse(json);
  if (!body.success) return new Response(null, { status: 400 });
  await recordMenuView(body.data.slug, request.headers.get("user-agent"));
  return new Response(null, { status: 204 });
}
