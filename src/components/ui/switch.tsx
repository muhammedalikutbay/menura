import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/cn";

/** 44x24 track; the pseudo-element extends the touch target to 44px tall. */
export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-border-control transition-colors",
        "after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-['']",
        "data-[state=checked]:bg-success disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform data-[state=checked]:translate-x-[22px]" />
    </SwitchPrimitive.Root>
  );
}
