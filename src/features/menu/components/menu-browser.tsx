"use client";

import { Search, SearchX, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { normalizeForSearch } from "@/lib/text";
import { MENU_ROOT_SELECTOR, offsetWithin, type MenuMode } from "./menu-mode";

export type NavSection = { id: string; label: string };

/** Distance from the viewport top at which a section counts as "current" (sticky bar + breathing room). */
const SPY_OFFSET = 96;

/**
 * Sticky search + category bar around the server-rendered menu sections (`children`).
 *
 * The sections are plain HTML marked with `data-menu-section` (and `data-search` on each product
 * row). Searching and scroll-spy only toggle `hidden`/active state on that existing markup, so the
 * menu itself stays server-rendered and works before this island hydrates.
 *
 * In `embedded` mode the nearest `[data-menu-root]` is the scroll container instead of the window:
 * scroll-spy, "scroll to section" and "jump to menu top" all use it, and no window listener is added.
 */
export function MenuBrowser({
  sections,
  mode = "page",
  children,
}: {
  sections: NavSection[];
  mode?: MenuMode;
  children: React.ReactNode;
}) {
  const embedded = mode === "embedded";
  const searchId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lockTimer = useRef<number | null>(null);

  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [resultCount, setResultCount] = useState<number | null>(null);

  const activeRef = useRef(active);
  const lockedRef = useRef(false);

  function updateActive(id: string) {
    if (id === activeRef.current) return;
    activeRef.current = id;
    setActive(id);
  }

  /** The embedded menu's own scroll container; `null` in page mode (the window scrolls). */
  function findScroller(): HTMLElement | null {
    return embedded ? (rootRef.current?.closest<HTMLElement>(MENU_ROOT_SELECTOR) ?? null) : null;
  }

  /* Scroll-spy: the current section is the last one whose top has passed the sticky bar. */
  useEffect(() => {
    const content = contentRef.current;
    if (!content || searching) return;
    const scroller = findScroller();
    if (embedded && !scroller) return;
    const elements = Array.from(content.querySelectorAll<HTMLElement>("[data-menu-section]"));
    if (elements.length === 0) return;

    let frame = 0;
    function sectionTop(element: HTMLElement) {
      return scroller ? offsetWithin(element, scroller) - scroller.scrollTop : element.getBoundingClientRect().top;
    }
    function compute() {
      frame = 0;
      if (lockedRef.current) return;
      let current = elements[0]!;
      for (const element of elements) {
        if (sectionTop(element) <= SPY_OFFSET) current = element;
        else break;
      }
      const atBottom = scroller
        ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
        : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = elements[elements.length - 1]!;
      updateActive(current.dataset.menuSection ?? "");
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(compute);
    }

    // IntersectionObserver wakes the computation when a section enters/leaves the top band;
    // the scroll listener covers the rest (page end, resize).
    const observer = new IntersectionObserver(schedule, {
      root: scroller,
      rootMargin: `-${SPY_OFFSET}px 0px -50% 0px`,
      threshold: [0, 1],
    });
    elements.forEach((element) => observer.observe(element));
    const resizeObserver = scroller ? new ResizeObserver(schedule) : null;
    if (scroller) {
      scroller.addEventListener("scroll", schedule, { passive: true });
      resizeObserver?.observe(scroller);
    } else {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
    }
    schedule();

    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
      if (scroller) {
        scroller.removeEventListener("scroll", schedule);
      } else {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
      if (frame) window.cancelAnimationFrame(frame);
    };
    // `embedded` never changes for a mounted menu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searching]);

  /* Keep the active chip visible inside the horizontal chip strip (never scrolls the page). */
  useEffect(() => {
    const strip = chipsRef.current;
    const chip = strip?.querySelector<HTMLElement>(`[data-chip="${CSS.escape(active)}"]`);
    if (!strip || !chip) return;
    const target = chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, target) });
  }, [active, searching]);

  useEffect(
    () => () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
    },
    [],
  );

  function goToSection(id: string) {
    const target = contentRef.current?.querySelector<HTMLElement>(`[data-menu-section="${CSS.escape(id)}"]`);
    if (!target) return;
    updateActive(id);
    const scroller = findScroller();
    // Ignore spy updates while the smooth scroll runs, so the chip doesn't flicker through sections.
    lockedRef.current = true;
    const scrollEvents: Window | HTMLElement = scroller ?? window;
    const unlock = () => {
      lockedRef.current = false;
      scrollEvents.removeEventListener("scrollend", unlock);
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
    };
    scrollEvents.addEventListener("scrollend", unlock, { once: true });
    if (lockTimer.current) window.clearTimeout(lockTimer.current);
    lockTimer.current = window.setTimeout(unlock, 1200);
    if (scroller) {
      // scrollIntoView would also move the host page; scroll only our own container. The section's
      // scroll-margin-top accounts for the sticky bar, `scroll-smooth` on the root decides smooth vs instant.
      const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      scroller.scrollTo({ top: Math.max(0, offsetWithin(target, scroller) - margin) });
    } else {
      // scroll-margin-top on the section accounts for the sticky bar; CSS decides smooth vs instant.
      target.scrollIntoView({ block: "start" });
    }
  }

  function applyFilter(value: string): number | null {
    const content = contentRef.current;
    if (!content) return null;
    const needle = normalizeForSearch(value);
    let total = 0;
    content.querySelectorAll<HTMLElement>("[data-menu-section]").forEach((section) => {
      if (section.dataset.menuSection === "featured") {
        section.hidden = needle !== "";
        return;
      }
      let visible = 0;
      section.querySelectorAll<HTMLElement>("[data-search]").forEach((item) => {
        const match = needle === "" || (item.dataset.search ?? "").includes(needle);
        item.hidden = !match;
        if (match) visible += 1;
      });
      section.hidden = visible === 0;
      total += visible;
    });
    return needle === "" ? null : total;
  }

  function jumpToMenuTop() {
    const root = rootRef.current;
    const scroller = findScroller();
    if (root && scroller) {
      const top = offsetWithin(root, scroller);
      if (scroller.scrollTop > top) scroller.scrollTo({ top, behavior: "instant" });
      return;
    }
    if (root && root.getBoundingClientRect().top < 0) {
      window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    }
  }

  function changeQuery(value: string) {
    setQuery(value);
    setResultCount(applyFilter(value));
    jumpToMenuTop();
  }

  function openSearch() {
    setSearching(true);
  }

  function closeSearch() {
    setSearching(false);
    setQuery("");
    setResultCount(applyFilter(""));
    window.requestAnimationFrame(() => searchButtonRef.current?.focus({ preventScroll: true }));
  }

  const hasQuery = query.trim() !== "";

  return (
    <div ref={rootRef}>
      <div className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
          {searching ? (
            <form
              role="search"
              className="flex min-w-0 flex-1 items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                inputRef.current?.blur();
              }}
            >
              <label htmlFor={searchId} className="sr-only">
                Menüde ara
              </label>
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-fg-muted"
                />
                <input
                  ref={inputRef}
                  id={searchId}
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  placeholder="Menüde ara"
                  value={query}
                  onChange={(event) => changeQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Escape" && closeSearch()}
                  className="h-11 w-full rounded-full border border-transparent bg-surface-muted pr-4 pl-11 text-base text-fg placeholder:text-fg-muted focus-visible:border-border-strong focus-visible:outline-offset-0 [&::-webkit-search-cancel-button]:hidden"
                />
              </div>
              <button
                type="button"
                onClick={closeSearch}
                className="inline-flex h-11 shrink-0 items-center rounded-full px-3 text-base font-medium text-fg hover:bg-surface-muted"
              >
                Vazgeç
              </button>
            </form>
          ) : (
            <>
              <button
                ref={searchButtonRef}
                type="button"
                onClick={openSearch}
                aria-label="Menüde ara"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-muted text-fg transition-colors hover:bg-border"
              >
                <Search aria-hidden="true" className="size-5" />
              </button>
              <nav
                ref={chipsRef}
                aria-label="Kategoriler"
                className="no-scrollbar relative -mr-4 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-smooth py-1.5 pr-4 motion-reduce:scroll-auto"
              >
                {sections.map((section) => {
                  const isActive = section.id === active;
                  const chipProps = {
                    "data-chip": section.id,
                    "aria-current": isActive ? ("true" as const) : undefined,
                    className: cn(
                      "relative inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm whitespace-nowrap transition-colors",
                      // Invisible 44px hit area around the 36px pill.
                      "before:absolute before:-inset-y-1 before:inset-x-0 before:content-['']",
                      isActive
                        ? "bg-accent font-semibold text-accent-fg ring-1 ring-fg/15"
                        : "bg-surface-muted font-medium text-fg hover:bg-border",
                    ),
                  };
                  // Embedded chips are buttons: a `#hash` link could move the host page.
                  return embedded ? (
                    <button key={section.id} type="button" onClick={() => goToSection(section.id)} {...chipProps}>
                      {section.label}
                    </button>
                  ) : (
                    <a
                      key={section.id}
                      href={`#s-${section.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        goToSection(section.id);
                      }}
                      {...chipProps}
                    >
                      {section.label}
                    </a>
                  );
                })}
              </nav>
            </>
          )}
        </div>
      </div>

      {hasQuery && resultCount !== null && (
        <p role="status" className={cn("mx-auto max-w-2xl px-4 pt-4 text-sm text-fg-muted", resultCount === 0 && "sr-only")}>
          {resultCount === 0 ? "Sonuç bulunamadı" : `${resultCount} sonuç`}
        </p>
      )}

      <div ref={contentRef}>{children}</div>

      {hasQuery && resultCount === 0 && (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-16 text-center">
          <div
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-fg-muted"
          >
            <SearchX className="size-6" />
          </div>
          <p className="text-lg font-semibold tracking-tight">Sonuç bulunamadı</p>
          <p className="max-w-xs text-sm text-fg-muted">
            “{query.trim()}” ile eşleşen bir ürün yok. Farklı bir kelime deneyin.
          </p>
          <button
            type="button"
            onClick={() => changeQuery("")}
            className="mt-1 inline-flex h-11 items-center gap-2 rounded-full bg-surface-muted px-5 text-sm font-medium hover:bg-border"
          >
            <X aria-hidden="true" className="size-4" />
            Aramayı temizle
          </button>
        </div>
      )}
    </div>
  );
}
