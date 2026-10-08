import { cn } from "@/lib/cn";

/** Loading placeholder. Decorative: pair the region with `aria-busy` where it matters. */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-fg/[0.06]", className)} {...props} />;
}
