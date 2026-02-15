"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex items-center h-5 w-5">
        <input
          type="checkbox"
          className={cn(
            "peer h-5 w-5 cursor-pointer appearance-none rounded border border-divider bg-white transition-all checked:bg-success checked:border-success hover:border-success/50 focus:ring-2 focus:ring-success/20",
            className
          )}
          ref={ref}
          {...props}
        />
        <svg
          className="pointer-events-none absolute h-3.5 w-3.5 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
