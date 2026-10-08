import { cn } from "@/lib/cn";
import { controlBase } from "./input";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(controlBase, "min-h-24 resize-y py-2.5", className)} {...props} />;
}
