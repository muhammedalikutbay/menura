"use client";

import { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { SearchInput } from "./SearchInput";

interface ProductFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
  activeTab: "all" | "active" | "draft";
  onTabChange: (tab: "all" | "active" | "draft") => void;
  className?: string;
}

/**
 * A reusable dropdown component for filters in the ProductFilterBar.
 * Adheres to SRP by handling only the dropdown display and interaction.
 */
function FilterDropdown({ 
  value, 
  isOpen, 
  onToggle, 
  onSelect, 
  options, 
  dropdownWidth = "w-56" 
}: { 
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (val: string) => void;
  options: { id: string, name: string }[];
  dropdownWidth?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const isStatus = options.some(opt => opt.id === "active" || opt.id === "draft");
  const isActive = isStatus && value === "Active";
  const isDraft = isStatus && value === "Draft";

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={onToggle}
        className={cn(
          "px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-3 transition-all shrink-0 border-none outline-none",
          isActive && "bg-green-100 text-green-600",
          isDraft && "bg-orange-100 text-orange-600",
          !isActive && !isDraft && "!bg-[#f5f4f6] text-[#1D1D1F]",
          isOpen ? "ring-2 ring-[#0071e3]/10" : "hover:opacity-80"
        )}
      >
        <span className="flex items-center gap-1.5">
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
          {isDraft && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
          {value}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" height="16" 
          viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2.5" 
          strokeLinecap="round" strokeLinejoin="round"
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className={cn("absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-50 py-1 animate-in fade-in zoom-in-95 duration-200", dropdownWidth)}>
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => { onSelect(option.id); onToggle(); }}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2",
                  option.id === "active" && "text-green-600 hover:bg-green-50",
                  option.id === "draft" && "text-orange-600 hover:bg-orange-50",
                  (option.id === "all" || !isStatus) && "text-[#1D1D1F] hover:bg-[#f5f4f6]",
                  (value === option.name || (isStatus && value === option.name))
                    ? (option.id === "active" ? "bg-green-100 font-bold" : option.id === "draft" ? "bg-orange-100 font-bold" : "bg-[#f5f4f6] font-bold")
                    : ""
                )}
              >
                {option.id === "active" && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                {option.id === "draft" && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductFilterBar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategoryId,
  onCategoryChange,
  activeTab,
  onTabChange,
  className
}: ProductFilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<"category" | "status" | null>(null);

  const selectedCategoryName = categories.find(c => c.id === selectedCategoryId)?.name || "All Categories";
  
  const categoryOptions = [
    { id: "all", name: "All Categories" },
    ...categories.map(c => ({ id: c.id, name: c.name }))
  ];

  const statusOptions = [
    { id: "all", name: "All Status" },
    { id: "active", name: "Active" },
    { id: "draft", name: "Draft" }
  ];

  const currentStatusName = statusOptions.find(s => s.id === activeTab)?.name || "All Status";

  return (
    <div className={cn("bg-white p-2 rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col md:flex-row items-stretch md:items-center gap-2", className)}>
      {/* Optimized Search Input using shared component */}
      <SearchInput 
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search for appetizers, drinks, etc..."
        variant="gray"
        className="flex-1"
      />

      <div className="flex items-center gap-2">
        {/* Category Dropdown Filter */}
        <FilterDropdown 
          value={selectedCategoryName}
          isOpen={openDropdown === "category"}
          onToggle={() => setOpenDropdown(prev => prev === "category" ? null : "category")}
          onSelect={onCategoryChange}
          options={categoryOptions}
        />

        {/* Status Dropdown Filter */}
        <FilterDropdown 
          value={currentStatusName}
          isOpen={openDropdown === "status"}
          onToggle={() => setOpenDropdown(prev => prev === "status" ? null : "status")}
          onSelect={(val) => onTabChange(val as any)}
          options={statusOptions}
          dropdownWidth="w-40"
        />
      </div>
    </div>
  );
}
