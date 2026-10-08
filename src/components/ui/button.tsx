import { Slot } from "radix-ui";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium " +
  "transition-colors select-none disabled:pointer-events-none disabled:opacity-50 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:shrink-0";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm [&_svg]:size-4",
  md: "h-11 px-5 text-base [&_svg]:size-5", // 44px: meets the touch target rule
  lg: "h-12 px-6 text-base [&_svg]:size-5",
  icon: "size-11 [&_svg]:size-5",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "bg-surface-muted text-fg hover:bg-border",
  outline: "border border-border-strong bg-surface text-fg hover:bg-surface-muted",
  ghost: "text-fg hover:bg-surface-muted",
  destructive: "bg-danger text-danger-fg hover:bg-danger-hover",
  link: "h-auto rounded-sm p-0 text-accent-text underline-offset-4 hover:underline",
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
