import { cn } from "@/lib/cn";

export const controlBase =
  "w-full rounded-md border border-border-strong bg-surface px-3.5 text-base text-fg " +
  "placeholder:text-fg-muted transition-colors focus-visible:border-accent focus-visible:outline-offset-0 " +
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60 " +
  "aria-invalid:border-danger aria-invalid:focus-visible:outline-danger";

// 16px text keeps iOS Safari from zooming on focus.
export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn(controlBase, "h-11", className)} {...props} />;
}
