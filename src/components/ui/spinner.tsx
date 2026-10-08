import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type SpinnerProps = Omit<React.ComponentProps<typeof LoaderCircle>, "ref"> & {
  /** Accessible name. Pass `null` when the spinner is decorative (e.g. inside a busy button). */
  label?: string | null;
};

export function Spinner({ label = "Yükleniyor", className, ...props }: SpinnerProps) {
  return (
    <LoaderCircle
      className={cn("size-5 animate-spin text-fg-muted", className)}
      {...(label === null ? { "aria-hidden": true } : { role: "status", "aria-label": label })}
      {...props}
    />
  );
}
