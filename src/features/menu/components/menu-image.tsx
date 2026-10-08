import Image from "next/image";

/** Static, already optimized assets of the phone preview (`public/preview/*.webp`). */
const STATIC_PREVIEW_PREFIX = "/preview/";

/**
 * `next/image` for menu photos. Uploaded media (`/media/...`) goes through the optimizer; the bundled
 * sample photos are small pre-encoded webp files that are not in the optimizer's `localPatterns`,
 * so they are served as they are.
 */
export function MenuImage(props: React.ComponentProps<typeof Image>) {
  const unoptimized = typeof props.src === "string" && props.src.startsWith(STATIC_PREVIEW_PREFIX);
  // eslint-disable-next-line jsx-a11y/alt-text -- `alt` is part of the forwarded props
  return <Image {...props} unoptimized={unoptimized || props.unoptimized} />;
}
