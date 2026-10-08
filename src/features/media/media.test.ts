import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import { createTenant, sessionMock, signInAs } from "../../../test/helpers";
import { InvalidImageError, MAX_IMAGE_EDGE, processImage } from "./process-image";

vi.mock("@/server/session", () => sessionMock());

const { uploadImage } = await import("./actions");
const { isOwnedMedia, releaseMedia } = await import("./server");

function png(width: number, height: number) {
  return sharp({ create: { width, height, channels: 3, background: "#e07a5f" } }).png().toBuffer();
}

function formWith(data: Buffer | string, type = "image/png") {
  const body = new FormData();
  body.set("file", new File([typeof data === "string" ? data : new Uint8Array(data)], "upload", { type }));
  return body;
}

describe("processImage", () => {
  it("re-encodes to WebP and caps the longest edge", async () => {
    const result = await processImage(await png(3000, 1500));
    expect(result.contentType).toBe("image/webp");
    expect(result.width).toBe(MAX_IMAGE_EDGE);
    expect(result.height).toBe(MAX_IMAGE_EDGE / 2);
  });

  it("rejects non-images, including SVG markup", async () => {
    await expect(processImage(Buffer.from("<html>hi</html>"))).rejects.toBeInstanceOf(InvalidImageError);
    await expect(
      processImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')),
    ).rejects.toBeInstanceOf(InvalidImageError);
  });
});

describe("uploadImage", () => {
  it("stores the image for the signed-in restaurant only", async () => {
    const a = await createTenant();
    const b = await createTenant();
    signInAs(a);

    const result = await uploadImage(formWith(await png(400, 300)));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.url).toBe(`/media/${result.data.id}`);
    expect(await isOwnedMedia(a.restaurant.id, result.data.id)).toBe(true);
    expect(await isOwnedMedia(b.restaurant.id, result.data.id)).toBe(false);

    // Another tenant cannot release (delete) it.
    await releaseMedia(b.restaurant.id, result.data.id);
    expect(await isOwnedMedia(a.restaurant.id, result.data.id)).toBe(true);
    await releaseMedia(a.restaurant.id, result.data.id);
    expect(await isOwnedMedia(a.restaurant.id, result.data.id)).toBe(false);
  });

  it("returns a friendly error for invalid files", async () => {
    signInAs(await createTenant());
    const result = await uploadImage(formWith("not an image", "image/png"));
    expect(result.ok).toBe(false);
  });
});
