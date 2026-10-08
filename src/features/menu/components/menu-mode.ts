/**
 * `page`: the public `/m/[slug]` route, scrolled by the window.
 * `embedded`: the menu inside the phone preview. Its root element (`[data-menu-root]`) is the scroll
 * container, nothing may touch `window`/`document` or navigate away, and outbound links are inert.
 */
export type MenuMode = "page" | "embedded";

/** Attribute on the embedded root; client islands find their scroll container with it. */
export const MENU_ROOT_SELECTOR = "[data-menu-root]";
/** The part of the embedded root that becomes `inert` while the product sheet is open. */
export const MENU_CONTENT_SELECTOR = "[data-menu-content]";

/**
 * Distance of `element` from the top of `scroller`'s scrolled content in layout pixels. Unlike
 * `getBoundingClientRect` it is unaffected by the CSS transforms (scale, 3D tilt) of the phone.
 */
export function offsetWithin(element: HTMLElement, scroller: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = element;
  while (node && node !== scroller) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return node === scroller ? top : element.offsetTop;
}
