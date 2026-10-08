import { cn } from "@/lib/cn";

export type StatsBandItem = {
  /** The headline figure or phrase, e.g. "14" or "Saniyeler". */
  value: React.ReactNode;
  /** One short line below it. */
  label: string;
};

type StatsBandProps = Omit<React.ComponentProps<"ul">, "children"> & {
  items: StatsBandItem[];
};

/** Dark rounded band with up to three facts separated by hairlines. Honest facts only, no growth claims. */
export function StatsBand({ items, className, ...props }: StatsBandProps) {
  return (
    <ul
      className={cn(
        "grid overflow-hidden rounded-xl bg-ink text-ink-fg",
        "grid-cols-1 divide-y divide-ink-fg/12 sm:grid-flow-col sm:auto-cols-fr sm:grid-cols-none sm:divide-x sm:divide-y-0",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <li key={item.label} className="flex flex-col items-center gap-1 px-6 py-6 text-center sm:py-7">
          <span className="tabular text-[28px] leading-tight font-semibold tracking-[-0.03em]">{item.value}</span>
          <span className="type-caption text-ink-fg/70">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
