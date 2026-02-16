"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    // Always show first, last, current, and neighbors.
    // For simplicity in this iteration, if totalPages <= 7, show all.
    // If > 7, show 1, ..., current-1, current, current+1, ..., last.
    
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 4) {
            // Start items
            for(let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            // End items
            pages.push(1);
            pages.push('...');
            for(let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            // Middle items
            pages.push(1);
            pages.push('...');
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push('...');
            pages.push(totalPages);
        }
    }

    return pages.map((page, index) => {
        if (page === '...') {
            return (
                <span key={`ellipsis-${index}`} className="text-[#86868B] px-1">...</span>
            );
        }
        
        const pageNum = page as number;
        const isActive = pageNum === currentPage;
        
        return (
            <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                    "w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-colors",
                    isActive 
                        ? "bg-[#F5F5F7] text-[#1D1D1F] font-bold" 
                        : "hover:bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F]"
                )}
            >
                {pageNum}
            </button>
        );
    });
  };

  return (
    <div className={cn("mt-10 flex items-center justify-center space-x-2", className)}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-full hover:bg-[#F5F5F7] text-[#86868B] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      
      {renderPageNumbers()}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full hover:bg-[#F5F5F7] text-[#86868B] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
  );
}
