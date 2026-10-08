"use client";

import { Clock, Flame, X, type LucideIcon } from "lucide-react";

import { useEffect, useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import type { SheetProduct } from "../sheet-data";
import { MENU_CONTENT_SELECTOR, MENU_ROOT_SELECTOR, type MenuMode } from "./menu-mode";
import { MenuImage } from "./menu-image";

/**
 * Detail sheet for the product rows. Rows are plain server-rendered buttons carrying
 * `data-product-id`; this island listens for their clicks (event delegation), so no client
 * code ships per row.
 *
 * `page`: a Radix dialog in a portal; it owns a history entry so the phone's back button closes
 * it instead of leaving the menu.
 * `embedded`: a dialog rendered inside the menu root (no portal, no history entry, listeners on
 * the root element only), see {@link EmbeddedProductSheet}.
 */
export function ProductSheet({
  products,
  themeStyle,
  mode = "page",
}: {
  products: SheetProduct[];
  themeStyle: React.CSSProperties;
  mode?: MenuMode;
}) {
  return mode === "embedded" ? (
    <EmbeddedProductSheet products={products} />
  ) : (
    <PageProductSheet products={products} themeStyle={themeStyle} />
  );
}

function PageProductSheet({ products, themeStyle }: { products: SheetProduct[]; themeStyle: React.CSSProperties }) {
  // The id outlives `open` so the closing animation still has content to show.
  const [productId, setProductId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const hasHistoryEntry = useRef(false);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest<HTMLElement>("[data-product-id]");
      if (!trigger?.dataset.productId) return;
      setProductId(trigger.dataset.productId);
      setOpen(true);
      if (!hasHistoryEntry.current) {
        window.history.pushState(null, "");
        hasHistoryEntry.current = true;
      }
    }

    function onPopState() {
      // Back button (or our own history.back() below): the entry is gone, close the sheet.
      hasHistoryEntry.current = false;
      setOpen(false);
    }

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  function handleOpenChange(open: boolean) {
    if (open) return;
    if (hasHistoryEntry.current) {
      // popstate closes the sheet once the entry is popped.
      window.history.back();
    } else {
      setOpen(false);
    }
  }

  const product = productId ? products.find((item) => item.id === productId) : undefined;

  return (
    <Dialog open={open && Boolean(product)} onOpenChange={handleOpenChange}>
      {product && <SheetBody product={product} themeStyle={themeStyle} />}
    </Dialog>
  );
}

// The dialog renders in a portal outside the themed wrapper, so it receives the theme variables itself.
function SheetBody({ product, themeStyle }: { product: SheetProduct; themeStyle: React.CSSProperties }) {
  return (
    <DialogContent
      title={product.name}
      hideTitle
      showClose={false}
      style={themeStyle}
      className="gap-0 p-0 sm:max-w-md sm:p-0 [&_:focus-visible]:outline-(color:--menu-accent-text)"
    >
      {/* Sticky, zero-height wrapper keeps the close button reachable while the sheet scrolls. */}
      <div className="sticky top-0 z-10 h-0">
        <DialogClose
          aria-label="Kapat"
          className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-full bg-surface/85 text-fg shadow-md backdrop-blur-md transition-colors hover:bg-surface"
        >
          <X aria-hidden="true" className="size-5" />
        </DialogClose>
      </div>
      <ProductDetails product={product} imageSizes="(min-width: 640px) 448px, 100vw" />
    </DialogContent>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The embedded variant lives inside the menu root, which is the scroll container. A zero-height
 * sticky anchor at the end of the root keeps the sheet pinned to the visible area while the menu is
 * scrolled; the sheet itself is absolutely positioned against that anchor (`100cqh` = the root's
 * height, the root being a size container). While open, the rest of the menu is `inert` and the root
 * does not scroll. Clicks are delegated on the root element: no `document`/`window` listeners, no
 * history entry.
 */
function EmbeddedProductSheet({ products }: { products: SheetProduct[] }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = anchorRef.current?.closest<HTMLElement>(MENU_ROOT_SELECTOR);
    if (!root) return;
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest<HTMLElement>("[data-product-id]");
      if (!trigger?.dataset.productId) return;
      returnFocusRef.current = trigger;
      setProductId(trigger.dataset.productId);
      setOpen(true);
    }
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = anchorRef.current?.closest<HTMLElement>(MENU_ROOT_SELECTOR);
    const content = root?.querySelector<HTMLElement>(MENU_CONTENT_SELECTOR);
    if (!root || !content) return;
    content.setAttribute("inert", "");
    root.style.overflowY = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const returnTo = returnFocusRef.current;
    return () => {
      content.removeAttribute("inert");
      root.style.overflowY = "";
      returnTo?.focus({ preventScroll: true });
    };
  }, [open]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && event.target === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && event.target === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const product = productId ? products.find((item) => item.id === productId) : undefined;

  return (
    <div ref={anchorRef} className="sticky bottom-0 z-40 h-0 w-full">
      {open && product && (
        <div className="absolute inset-x-0 bottom-0 h-[100cqh]" onKeyDown={handleKeyDown}>
          <div aria-hidden="true" className="absolute inset-0 animate-fade-in bg-overlay" onClick={() => setOpen(false)} />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            className="absolute inset-x-0 bottom-0 flex max-h-[88%] animate-sheet-in flex-col overflow-y-auto rounded-t-xl bg-surface text-fg shadow-sheet"
          >
            <div className="sticky top-0 z-10 h-0">
              <button
                ref={closeRef}
                type="button"
                aria-label="Kapat"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-full bg-surface/85 text-fg shadow-md backdrop-blur-md transition-colors hover:bg-surface"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <ProductDetails product={product} imageSizes="390px" />
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDetails({ product, imageSizes }: { product: SheetProduct; imageSizes: string }) {
  const allergenHeadingId = useId();
  const meta: { key: string; icon: LucideIcon; label: string }[] = [];
  if (product.calories != null) meta.push({ key: "calories", icon: Flame, label: `${product.calories} kcal` });
  if (product.prepTime) meta.push({ key: "prep", icon: Clock, label: product.prepTime });

  return (
    <>
      {product.imageUrl && (
        <div className="relative aspect-[4/3] w-full shrink-0 bg-surface-muted">
          <MenuImage
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes={imageSizes}
            className={product.isAvailable ? "object-cover" : "object-cover opacity-70 grayscale"}
          />
        </div>
      )}

      <div className="flex flex-col gap-4 p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-2">
          <p aria-hidden="true" className="text-2xl leading-tight font-bold tracking-tight text-balance">
            {product.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums">
            <span className="text-xl font-semibold">
              {product.oldPrice && <span className="sr-only">İndirimli fiyat: </span>}
              {product.price}
            </span>
            {product.oldPrice && (
              <del className="text-base text-fg-muted">
                <span className="sr-only">Eski fiyat: </span>
                {product.oldPrice}
              </del>
            )}
            {!product.isAvailable && <Badge variant="danger">Tükendi</Badge>}
          </div>
        </div>

        {product.description && (
          <p className="text-base leading-relaxed whitespace-pre-line text-fg">{product.description}</p>
        )}

        {meta.length > 0 && (
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-muted">
            {meta.map((item) => (
              <li key={item.key} className="inline-flex items-center gap-1.5">
                <item.icon aria-hidden="true" className="size-4" />
                {item.label}
              </li>
            ))}
          </ul>
        )}

        {product.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Etiketler">
            {product.tags.map((tag) => (
              <li key={tag}>
                <Badge>{tag}</Badge>
              </li>
            ))}
          </ul>
        )}

        {product.allergens.length > 0 && (
          <section aria-labelledby={allergenHeadingId} className="flex flex-col gap-2 rounded-lg bg-surface-muted p-4">
            <h3 id={allergenHeadingId} className="text-sm font-semibold">
              Alerjen bilgisi
            </h3>
            <ul className="flex flex-wrap gap-2">
              {product.allergens.map((allergen) => (
                <li key={allergen}>
                  <Badge variant="warning">{allergen}</Badge>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
