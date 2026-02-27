"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DashboardGrid = React.forwardRef<HTMLDivElement, DashboardGridProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DashboardGrid.displayName = "DashboardGrid";

export interface DashboardMainProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DashboardMain = React.forwardRef<HTMLDivElement, DashboardMainProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DashboardMain.displayName = "DashboardMain";
