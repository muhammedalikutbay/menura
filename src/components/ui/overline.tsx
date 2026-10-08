import { cn } from "@/lib/cn";

/** Small chip with a brand-gradient dot, used above headlines ("Restoran ve kafeler için QR menü"). */
export function Overline({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "type-overline inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-fg-muted",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="gradient-brand size-1.5 shrink-0 rounded-full" />
      {children}
    </span>
  );
}
