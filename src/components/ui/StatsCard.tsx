"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subtext?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "purple" | "orange";
}

const variantStyles = {
  primary: {
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-[#0071E3]",
  },
  purple: {
    iconBg: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-500",
  },
  orange: {
    iconBg: "bg-orange-50 dark:bg-orange-900/20",
    iconColor: "text-orange-500",
  },
};

export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, label, value = "0", subtext, icon, variant = "primary", ...props }, ref) => {
    // Clone icon for the large background version
    const backgroundIcon = React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement<any>, { size: 96, strokeWidth: 1.5 })
      : null;

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white  p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/50 dark:border-white/5 relative overflow-hidden group transition-all duration-300",
          className
        )}
        {...props}
      >
        {/* Background Icon Decorator */}
        <div className={cn(
          "absolute right-0 top-0 p-6 opacity-[0.15] group-hover:opacity-[0.25] transition-opacity transform group-hover:scale-110 duration-500",
          variantStyles[variant].iconColor
        )}>
          {backgroundIcon}
        </div>

        <div className="relative z-10">
          {/* Icon Circle */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-transform ",
            variantStyles[variant].iconBg,
            variantStyles[variant].iconColor
          )}>
            {icon}
          </div>

          <p className="text-lg font-medium text-[#86868B] dark:text-[#86868B]">
            {label}
          </p>
          <h3 className="text-3xl md:text-5xl font-medium tracking-tight mb-3 text-[#1D1D1F]">
            {value !== undefined && value !== null ? value : "0"}
          </h3>

          {subtext && (
            <div className="mt-2 text-md font-medium text-[#86868B]">
              {subtext}
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatsCard.displayName = "StatsCard";
