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
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6", className)}>
      <div className="space-y-1">
        <h1 className="text-[32px] md:text-[40px] font-black text-[#1D1D1F] tracking-tight leading-none uppercase">
          {title}
        </h1>
        {description && (
          <p className="text-[#86868B] text-[15px] md:text-[17px] font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
