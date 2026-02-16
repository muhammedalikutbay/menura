"use client";

import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Ara...", className }: SearchInputProps) {
  return (
    <div className={cn("flex items-center gap-2 bg-white border border-divider rounded-lg px-5 py-2.5 w-full md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-action/20 transition-all", className)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input 
        className="bg-transparent border-none !outline-none !ring-0 !focus:outline-none !focus:ring-0 text-callout w-full placeholder:text-text-secondary/50" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
