import * as React from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Divider({ className, ...props }: DividerProps) {
  return (
    <div
      className={cn("h-[1px] w-full bg-divider", className)}
      {...props}
    />
  );
}
