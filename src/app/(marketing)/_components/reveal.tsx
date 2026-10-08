"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Fade-and-rise on first entry into the viewport (design-language §2 Motion).
 *
 * Content is visible by default (SSR, no JS, reduced motion). After hydration, blocks that start
 * below the fold are hidden and revealed once by an IntersectionObserver. State lives in a data
 * attribute so no re-render is needed.
 */
export function Reveal({
  delay = 0,
  className,
  children,
  style,
  ...props
}: { delay?: number } & React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.reveal === "in") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;
    // Already on screen at load: do not flash it away.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      delete el.dataset.reveal;
      return;
    }
    el.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.reveal = "in";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("data-[reveal=hidden]:opacity-0 data-[reveal=in]:animate-reveal", className)}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}
