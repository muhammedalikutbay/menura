"use client";

import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-divider/0">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="h-9 w-1.5 bg-[#0d7ff2] rounded-full shadow-sm shadow-[#0d7ff2]/20" />
          <h1 className="text-3xl font-black text-text-primary tracking-tight uppercase">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-body-muted font-medium pl-5.5 border-l-0 text-base">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <Button 
          onClick={action.onClick} 
          className="h-12 px-6 rounded-2xl shadow-lg shadow-action/20 hover:scale-105 active:scale-95 transition-all gap-2 font-black uppercase tracking-widest text-[12px]"
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}
