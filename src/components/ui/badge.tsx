import { cn } from "@/lib/cn";

export type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-fg-muted",
  accent: "bg-accent-soft text-accent-text",
  success: "bg-success-soft text-success-text",
  warning: "bg-warning-soft text-warning-text",
  danger: "bg-danger-soft text-danger-text",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "type-caption inline-flex items-center gap-1 rounded-sm px-2 py-0.5 whitespace-nowrap",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export type ChipVariant = "neutral" | "outline" | "ink";

const chipVariants: Record<ChipVariant, string> = {
  neutral: "bg-surface-muted text-fg-muted",
  outline: "bg-surface text-fg ring-1 ring-inset ring-border-strong",
  ink: "bg-ink text-ink-fg",
};

/** Pill-shaped tag for filters, formats and short labels. */
export function Chip({
  variant = "neutral",
  className,
  ...props
}: React.ComponentProps<"span"> & { variant?: ChipVariant }) {
  return (
    <span
      className={cn(
        "type-caption inline-flex items-center gap-1.5 rounded-full px-3 py-1 whitespace-nowrap",
        chipVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
