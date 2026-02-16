"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface TabNavProps<T extends string> {
  tabs: { value: T; label: string }[];
  activeTab: T;
  onTabChange: (value: T) => void;
  className?: string;
}

export function TabNav<T extends string>({ tabs, activeTab, onTabChange, className }: TabNavProps<T>) {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.value === activeTab);
    const activeElement = itemsRef.current[activeIndex];

    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
        height: activeElement.offsetHeight,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className={cn("inline-flex p-1 bg-[#F5F5F7] rounded-full relative", className)}>
      <div 
        className="absolute bg-[#1D1D1F] rounded-full transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1) z-0"
        style={indicatorStyle}
      />
      {tabs.map((tab, index) => (
        <button
          key={tab.value}
          ref={(el) => { itemsRef.current[index] = el; }}
          onClick={() => onTabChange(tab.value)}
          role="tab"
          aria-selected={activeTab === tab.value}
          className={cn(
            "relative px-6 py-1.5 text-[14px] font-medium transition-colors whitespace-nowrap outline-none rounded-full z-10",
            activeTab === tab.value 
              ? "text-white" 
              : "text-[#1D1D1F]/70 hover:text-[#1D1D1F]"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
