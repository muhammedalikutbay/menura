import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

const variantStyles = {
  default: "border-transparent bg-action text-white hover:bg-action-hover",
  secondary: "border-transparent bg-bg-secondary text-text-primary hover:bg-border",
  destructive: "border-transparent bg-error text-white hover:bg-error/90",
  outline: "text-text-primary border-border hover:bg-bg-secondary",
  success: "border-transparent bg-success text-white hover:bg-success/90",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-caption font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
