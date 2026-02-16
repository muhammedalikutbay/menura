"use client";

import { cn } from "@/lib/utils";

interface TabNavProps<T extends string> {
  tabs: { value: T; label: string }[];
  activeTab: T;
  onTabChange: (value: T) => void;
  className?: string;
}

export function TabNav<T extends string>({ tabs, activeTab, onTabChange, className }: TabNavProps<T>) {
  const activeIndex = tabs.findIndex(tab => tab.value === activeTab);
  const tabWidth = 100 / tabs.length;

  return (
    <div className={cn("flex items-center p-1 bg-white border border-divider rounded-full shadow-sm relative min-w-[240px]", className)}>
      <div 
        className="absolute h-[calc(100%-8px)] rounded-full bg-action transition-all duration-300 ease-out z-0"
        style={{
          left: `calc(${activeIndex * tabWidth}% + ${activeIndex === 0 ? '4px' : '2px'})`,
          width: `calc(${tabWidth}% - ${activeIndex === 0 || activeIndex === tabs.length - 1 ? '6px' : '4px'})`
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "flex-1 py-1.5 text-caption font-semibold rounded-full transition-all relative z-10 capitalize",
            activeTab === tab.value 
              ? "text-white" 
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
