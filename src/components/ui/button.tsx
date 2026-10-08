import { Slot } from "radix-ui";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

/** `outline` is kept as an alias of `secondary` for older call sites. `brand` is for the landing hero CTA only. */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link" | "brand";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium " +
  "transition-[background-color,color,box-shadow,filter] select-none disabled:pointer-events-none disabled:opacity-50 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:shrink-0";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm [&_svg]:size-4", // 36px
  md: "h-11 px-5 text-[15px] [&_svg]:size-5", // 44px: meets the touch target rule
  lg: "h-13 px-7 text-base [&_svg]:size-5", // 52px
  // 40px circle; the pseudo-element extends the hit area to 44px.
  icon: "relative size-10 after:absolute after:-inset-0.5 after:rounded-full after:content-[''] [&_svg]:size-5",
};

const secondary = "bg-surface text-fg ring-1 ring-inset ring-border-strong hover:bg-surface-muted";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-ink-fg hover:bg-ink-hover",
  secondary,
  outline: secondary,
  ghost: "text-fg hover:bg-surface-muted",
  destructive: "bg-danger text-danger-fg hover:bg-danger-hover",
  link: "h-auto rounded-sm p-0 text-accent-text underline-offset-4 hover:underline",
  brand: "gradient-brand text-brand-fg shadow-float hover:brightness-[0.97]",
};

/** Class names for a button; use it to style links (`<Link className={buttonVariants()}>`). */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, sizes[size], variants[variant], className);
}

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean;
  /** Render the single child element (e.g. a Link) with the button styles. */
  asChild?: boolean;
};

export function Button({
  variant,
  size,
  loading = false,
  asChild = false,
  disabled,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const classes = buttonVariants({ variant, size, className });

  if (asChild) {
    // Slot needs exactly one child, so the spinner is not injected here.
    return (
      <Slot.Root
        className={classes}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner label={null} className="size-4 text-current" />}
      {children}
    </button>
  );
}

/** 40px circular ghost button for icon-only actions. `aria-label` is required (Turkish). */
export function IconButton({
  variant = "ghost",
  className,
  ...props
}: Omit<ButtonProps, "size" | "aria-label"> & { "aria-label": string }) {
  return <Button variant={variant} size="icon" className={className} {...props} />;
}
