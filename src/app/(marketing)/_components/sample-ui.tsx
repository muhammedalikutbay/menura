import { cn } from "@/lib/cn";

/*
 * Small static UI samples used as illustrations on the landing page (hero cards and feature
 * visuals). They are decorative, carry no data and never pretend to be a real customer's QR code.
 */

const QR_SIZE = 17;
const FINDERS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [QR_SIZE - 7, 0],
  [0, QR_SIZE - 7],
];

function nearFinder(x: number, y: number) {
  return FINDERS.some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);
}

// Deterministic pseudo-random data modules so server and client render the same markup.
const QR_CELLS: Array<readonly [number, number]> = [];
for (let y = 0; y < QR_SIZE; y++) {
  for (let x = 0; x < QR_SIZE; x++) {
    if (nearFinder(x, y)) continue;
    if ((x * 31 + y * 17 + x * y * 7 + ((x ^ y) % 5)) % 11 < 5) QR_CELLS.push([x, y]);
  }
}

/** A QR-like pattern (finder squares plus noise). Colored through `currentColor`. */
export function QrGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
      aria-hidden="true"
      shapeRendering="crispEdges"
      fill="currentColor"
      className={cn("size-16", className)}
    >
      {FINDERS.map(([fx, fy]) => (
        <g key={`${fx}-${fy}`}>
          <path fillRule="evenodd" d={`M${fx} ${fy}h7v7h-7zM${fx + 1} ${fy + 1}h5v5h-5z`} />
          <rect x={fx + 2} y={fy + 2} width="3" height="3" />
        </g>
      ))}
      {QR_CELLS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
      ))}
    </svg>
  );
}

/** Vertical bars from percentages (0-100). The last bar is highlighted. */
export function MiniBars({
  values,
  className,
  barClassName,
}: {
  values: readonly number[];
  className?: string;
  barClassName?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("flex items-end gap-1", className)}>
      {values.map((value, index) => (
        <span
          key={index}
          style={{ height: `${value}%` }}
          className={cn(
            "flex-1 rounded-[3px]",
            index === values.length - 1 ? "bg-accent" : "bg-accent/30",
            barClassName,
          )}
        />
      ))}
    </div>
  );
}
