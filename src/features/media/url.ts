/** Public URL of a stored image. Media ids are immutable, so URLs can be cached forever. */
export function mediaUrl(mediaId: string | null | undefined): string | null {
  return mediaId ? `/media/${mediaId}` : null;
}
