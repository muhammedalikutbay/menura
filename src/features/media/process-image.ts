import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 1600;
/** ~16 MP; browsers downscale to 2000 px before upload, this bounds decode memory. */
const MAX_INPUT_PIXELS = 16_000_000;

export type ProcessedImage = {
  data: Buffer;
  contentType: "image/webp";
  width: number;
  height: number;
  byteSize: number;
};

export class InvalidImageError extends Error {}

/**
 * Decodes any supported raster image, applies EXIF orientation, strips metadata and
 * re-encodes it as WebP. Anything sharp cannot decode is rejected, which also blocks
 * SVG/HTML payloads disguised as images.
 */
export async function processImage(input: Buffer | Uint8Array): Promise<ProcessedImage> {
  if (input.byteLength === 0) throw new InvalidImageError("Dosya boş.");
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new InvalidImageError("Görsel 4 MB'tan büyük olamaz.");

  try {
    const image = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" });
    const meta = await image.metadata();
    if (!meta.format || !["jpeg", "png", "webp", "avif", "heif", "gif"].includes(meta.format)) {
      throw new InvalidImageError("Desteklenmeyen görsel türü. JPG, PNG, WebP veya AVIF yükleyin.");
    }
    const { data, info } = await image
      .rotate()
      .resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return { data, contentType: "image/webp", width: info.width, height: info.height, byteSize: data.byteLength };
  } catch (error) {
    if (error instanceof InvalidImageError) throw error;
    throw new InvalidImageError("Görsel okunamadı. Dosya bozuk ya da desteklenmeyen bir türde olabilir.");
  }
}
