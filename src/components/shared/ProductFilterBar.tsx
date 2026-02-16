"use client";

import { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useMemo } from "react";
import { SearchInput } from "./SearchInput";

interface ProductFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categories: Category[];
  topCategories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
  activeTab: "all" | "active" | "draft";
  onTabChange: (tab: "all" | "active" | "draft") => void;
  className?: string;
}

/**
 * A reusable dropdown component for filters in the ProductFilterBar.
 * Adheres to SRP by handling only the dropdown display and interaction.
 * Now enhanced with search and category sections.
 */
function FilterDropdown({ 
  value, 
  isOpen, 
  onToggle, 
  onSelect, 
  options, 
  popularOptions = [],
  showSearch = false,
  dropdownWidth = "w-56" 
}: { 
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (val: string) => void;
  options: { id: string, name: string }[];
  popularOptions?: { id: string, name: string }[];
  showSearch?: boolean;
  dropdownWidth?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalSearch, setInternalSearch] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onToggle();
          setInternalSearch("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const isStatus = options.some(opt => opt.id === "active" || opt.id === "draft");
  const isActive = isStatus && value === "Active";
  const isDraft = isStatus && value === "Draft";

  const filteredOptions = useMemo(() => {
    if (!internalSearch.trim()) return options;
    return options.filter(opt => opt.name.toLowerCase().includes(internalSearch.toLowerCase()));
  }, [options, internalSearch]);

  const displayPopular = !internalSearch.trim() && popularOptions.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => {
          onToggle();
          setInternalSearch("");
        }}
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
        <div className={cn("absolute left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200", dropdownWidth)}>
          {showSearch && (
            <div className="p-2 border-b border-[#F5F5F7]">
              <div className="relative flex items-center">
                <svg className="absolute left-3 text-[#86868B]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input 
                  autoFocus
                  type="text"
                  placeholder="Seach categories..."
                  value={internalSearch}
                  onChange={(e) => setInternalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#f5f4f6] border-none rounded-lg text-xs outline-none placeholder-[#86868B]/60"
                />
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto py-1">
            {displayPopular && (
              <>
                <div className="px-3 py-1 mb-1">
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Most Used</span>
                </div>
                {popularOptions.map((opt) => (
                  <button
                    key={`popular-${opt.id}`}
                    onClick={() => { onSelect(opt.id); onToggle(); setInternalSearch(""); }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2",
                      value === opt.name ? "bg-[#f5f4f6] text-[#0071e3] font-bold" : "text-[#1D1D1F] hover:bg-[#f5f4f6]"
                    )}
                  >
                    {opt.name}
                  </button>
                ))}
                <div className="h-px bg-[#F5F5F7] my-1 mx-2" />
                <div className="px-3 py-1 mb-1">
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">All Categories</span>
                </div>
              </>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => { onSelect(option.id); onToggle(); setInternalSearch(""); }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2",
                    option.id === "active" && "text-green-600 hover:bg-green-50",
                    option.id === "draft" && "text-orange-600 hover:bg-orange-50",
                    (option.id === "all" || !isStatus) && "text-[#1D1D1F] hover:bg-[#f5f4f6]",
                    (value === option.name)
                      ? (option.id === "active" ? "bg-green-100 font-bold" : option.id === "draft" ? "bg-orange-100 font-bold" : "bg-[#f5f4f6] font-bold")
                      : ""
                  )}
                >
                  {option.id === "active" && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                  {option.id === "draft" && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                  {option.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-[#86868B] text-center italic">
                No results found
              </div>
            )}
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
  topCategories,
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

  const popularOptions = topCategories.map(c => ({ id: c.id, name: c.name }));

  const statusOptions = [
    { id: "all", name: "All Status" },
    { id: "active", name: "Active" },
    { id: "draft", name: "Draft" }
  ];

  const currentStatusName = statusOptions.find(s => s.id === activeTab)?.name || "All Status";

  return (
    <div className={cn("bg-white p-2 rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col md:flex-row items-stretch md:items-center gap-2", className)}>
      <SearchInput 
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search for appetizers, drinks, etc..."
        variant="gray"
        className="flex-1"
      />

      <div className="flex items-center gap-2">
        <FilterDropdown 
          value={selectedCategoryName}
          isOpen={openDropdown === "category"}
          onToggle={() => setOpenDropdown(prev => prev === "category" ? null : "category")}
          onSelect={onCategoryChange}
          options={categoryOptions}
          popularOptions={popularOptions}
          showSearch={true}
        />

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
