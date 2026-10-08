import { cn } from "@/lib/cn";

/**
 * Shared by Input, Textarea and Select. Focus = accent border + 3px accent ring at 25 % (the
 * transparent outline keeps a visible focus indicator in forced-colors mode).
 */
export const controlBase =
  "w-full rounded-md border border-border-control bg-surface px-3.5 text-base text-fg " +
  "placeholder:text-fg-muted transition-[background-color,border-color,box-shadow] hover:bg-surface-muted " +
  "focus-visible:border-accent focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-accent/25 " +
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-transparent " +
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60 " +
  "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/25";

// 16px text keeps iOS Safari from zooming on focus.
export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn(controlBase, "h-11", className)} {...props} />;
}
