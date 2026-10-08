import { and, eq } from "drizzle-orm";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getPublicMenu } from "@/features/menu/queries";
import { normalizeAccent, readableForeground } from "@/features/menu/theme";

export const alt = "Dijital menü";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Cover photo as a 1200×630 JPEG data URI (satori cannot read WebP), or null when unavailable. */
async function loadCover(restaurantId: string, coverUrl: string | null): Promise<string | null> {
  const mediaId = coverUrl?.split("/").pop();
  if (!mediaId) return null;
  try {
    const [row] = await db
      .select({ data: media.data })
      .from(media)
      .where(and(eq(media.id, mediaId), eq(media.restaurantId, restaurantId)))
      .limit(1);
    if (!row) return null;
    const jpeg = await sharp(row.data).resize(size.width, size.height, { fit: "cover" }).jpeg({ quality: 78 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);
  const name = (menu?.restaurant.name ?? "Menura").slice(0, 60);
  const accent = normalizeAccent(menu?.restaurant.themeColor);
  const cover = menu ? await loadCover(menu.restaurant.id, menu.restaurant.coverUrl) : null;
  const color = cover ? "#ffffff" : readableForeground(accent);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: accent,
          color,
        }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element -- rendered by satori, not the browser
          <img
            src={cover}
            alt=""
            width={size.width}
            height={size.height}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {cover && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.12))",
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            height: "100%",
            padding: 72,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", fontSize: 32, opacity: 0.85 }}>Dijital menü</div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: name.length > 28 ? 64 : 88,
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            {name}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
