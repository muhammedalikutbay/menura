import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

const ID_PATTERN = /^[0-9a-f-]{36}$/;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID_PATTERN.test(id)) return new Response("Not found", { status: 404 });

  const [row] = await db
    .select({ data: media.data, contentType: media.contentType, byteSize: media.byteSize })
    .from(media)
    .where(eq(media.id, id))
    .limit(1);
  if (!row) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.contentType,
      "Content-Length": String(row.byteSize),
      // Media rows are never modified in place; a new upload gets a new id.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
