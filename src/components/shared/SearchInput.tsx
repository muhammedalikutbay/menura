"use client";

import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // Container className
  inputClassName?: string; // Specific input className if needed
  showIcon?: boolean;
  variant?: "default" | "gray";
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className,
  inputClassName,
  showIcon = true,
  variant = "default"
}: SearchInputProps) {
  return (
    <div className={cn(
      "relative group flex items-center w-full rounded-full transition-all !bg-[#f5f4f6]",
      className
    )}>
      {showIcon && (
        <div className="absolute left-4 text-[#86868B] transition-colors group-focus-within:text-[#0071e3] z-10">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
      )}
      <input 
        className={cn(
          "w-full pr-4 py-2.5 rounded-full outline-none transition-all focus:ring-4 focus:ring-[#0071e3]/10 text-sm text-[#1D1D1F] placeholder-[#86868B]/60 font-medium bg-transparent border-none",
          showIcon ? "pl-11" : "pl-4",
          inputClassName
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
