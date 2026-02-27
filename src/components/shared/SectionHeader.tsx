"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ title, description, className, children }: SectionHeaderProps) {
  return (
    <div className={cn("mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4", className)}>
      <div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3 text-[#1D1D1F]">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-[#86868B] max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
