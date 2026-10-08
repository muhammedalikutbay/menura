"use client";

import { BatteryFull, Signal, Wifi } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { MenuView } from "../components/menu-view";
import type { PublicMenu } from "../types";

export type PhoneSize = "lg" | "md" | "sm";

/** Rendered width of the whole phone (bezel included) in px. */
const PHONE_WIDTH: Record<PhoneSize, number> = { lg: 360, md: 300, sm: 260 };

/** Logical screen of the phone; the layout is built at this size and scaled with CSS. */
const SCREEN_WIDTH = 390;
const SCREEN_HEIGHT = 844;
/** Titanium frame (12) and the black ring (3) around the screen. */
const FRAME = 12;
const RING = 3;
const BODY_WIDTH = SCREEN_WIDTH + 2 * (FRAME + RING);
const BODY_HEIGHT = SCREEN_HEIGHT + 2 * (FRAME + RING);
/** Status bar strip above the menu (dynamic island, clock, indicators). */
const STATUS_BAR = 44;

/** Resting pose (design: perspective 1800px, rotateX 6deg, rotateY -14deg, rotateZ 1deg). */
const REST_X = 6;
const REST_Y = -14;
const REST_Z = 1;
/** Pointer tilt around the resting pose, in degrees. */
const TILT = 6;

const REDUCED_OR_COARSE = "(prefers-reduced-motion: reduce), (pointer: coarse)";

/**
 * A 3D phone showing the real guest menu (`MenuView` in embedded mode): the landing hero uses the
 * sample menu, the appearance page the restaurant's own data. See `docs/design/screens.md` §6.
 *
 * - The screen is laid out at 390 x 844 and scaled with CSS `scale` on the frame, so text stays crisp.
 * - The phone follows the pointer by up to 6 degrees with spring easing and returns to its resting
 *   pose on leave. This is off for `prefers-reduced-motion`, touch input and `tilt={false}`.
 * - The menu inside is a labelled region with working keyboard controls; the frame is decorative.
 */
export function MenuPhonePreview({
  menu,
  tilt = true,
  pose = "hero",
  size = "lg",
  className,
}: {
  menu: PublicMenu;
  tilt?: boolean;
  /** "hero" is the angled marketing pose; "flat" faces the viewer (settings preview). */
  pose?: "hero" | "flat";
  size?: PhoneSize;
  className?: string;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const width = PHONE_WIDTH[size];
  const scale = width / BODY_WIDTH;
  const height = Math.round(BODY_HEIGHT * scale);

  function setPose(x: number, y: number) {
    const body = bodyRef.current;
    if (!body) return;
    body.style.setProperty("--tilt-x", `${x}deg`);
    body.style.setProperty("--tilt-y", `${y}deg`);
  }

  function tiltAllowed(event: React.PointerEvent) {
    return tilt && pose === "hero" && event.pointerType !== "touch" && !window.matchMedia(REDUCED_OR_COARSE).matches;
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!tiltAllowed(event)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    // -1 (left/top edge) .. 1 (right/bottom edge) relative to the centre of the (untransformed) stage.
    const px = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    const py = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
    setPose(REST_X - py * TILT, REST_Y + px * TILT);
  }

  function onPointerLeave() {
    setPose(REST_X, REST_Y);
  }

  return (
    <div
      className={cn("relative mx-auto shrink-0", className)}
      style={{ width, height, perspective: "1800px" }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* Soft ground shadow: a blurred ellipse under the phone. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 left-1/2 h-8 w-[78%] -translate-x-[42%] rounded-[50%] bg-ink/25 blur-2xl"
      />

      <div
        ref={bodyRef}
        // The body is centred in the stage and scaled around its centre, so it fills exactly width x height.
        className="absolute top-1/2 left-1/2 transition-transform duration-[650ms] ease-[cubic-bezier(0.34,1.45,0.5,1)] will-change-transform motion-reduce:transition-none"
        style={{
          width: BODY_WIDTH,
          height: BODY_HEIGHT,
          marginLeft: -BODY_WIDTH / 2,
          marginTop: -BODY_HEIGHT / 2,
          transform:
            pose === "flat"
              ? `scale(${scale})`
              : `scale(${scale}) rotateX(var(--tilt-x, ${REST_X}deg)) rotateY(var(--tilt-y, ${REST_Y}deg)) rotateZ(${REST_Z}deg)`,
        }}
      >
        {/* Titanium frame */}
        <div
          className="relative size-full rounded-[56px] shadow-[0_30px_50px_-20px_rgb(17_17_20/0.4),0_2px_4px_rgb(17_17_20/0.2)]"
          style={{
            padding: FRAME,
            background:
              "linear-gradient(145deg, #d9d9de 0%, #8d8d95 28%, #f1f1f3 52%, #7c7c84 78%, #c4c4ca 100%)",
          }}
        >
          {/* Thin highlight and edge line of the frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[56px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.55),inset_0_0_0_2px_rgb(17_17_20/0.18)]"
          />

          {/* Side buttons */}
          <span aria-hidden="true" className="absolute top-[132px] -left-[3px] h-8 w-[3px] rounded-l-sm bg-[#8d8d95]" />
          <span aria-hidden="true" className="absolute top-[188px] -left-[3px] h-14 w-[3px] rounded-l-sm bg-[#8d8d95]" />
          <span aria-hidden="true" className="absolute top-[256px] -left-[3px] h-14 w-[3px] rounded-l-sm bg-[#8d8d95]" />
          <span aria-hidden="true" className="absolute top-[212px] -right-[3px] h-24 w-[3px] rounded-r-sm bg-[#8d8d95]" />

          {/* Black ring around the screen */}
          <div className="relative size-full overflow-hidden rounded-[44px] bg-[#0b0b0d]" style={{ padding: RING }}>
            <div className="relative size-full overflow-hidden rounded-[41px] bg-bg">
              {/* Status bar. Decorative: the dynamic island, clock and indicators carry no information. */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-bg px-9 text-fg"
                style={{ height: STATUS_BAR }}
              >
                <span className="text-[15px] font-semibold tabular">9:41</span>
                <span className="flex items-center gap-1.5">
                  <Signal className="size-4" strokeWidth={2.25} />
                  <Wifi className="size-4" strokeWidth={2.25} />
                  <BatteryFull className="size-[22px]" strokeWidth={1.75} />
                </span>
              </div>
              <div
                aria-hidden="true"
                className="absolute top-[11px] left-1/2 z-30 h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-[#0b0b0d]"
              />

              <div className="absolute inset-x-0 bottom-0" style={{ top: STATUS_BAR }}>
                <MenuView menu={menu} mode="embedded" />
              </div>

              {/* Home indicator */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 left-1/2 z-30 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-fg/80"
              />
              {/* Glass reflection */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-40"
                style={{ background: "linear-gradient(115deg, rgb(255 255 255 / 0.08) 0%, transparent 38%)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
