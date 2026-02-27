"use client";

import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { cn, formatCompactNumber } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface MenuItemCardProps {
  product: Product;
  categories: Category[];
  onToggleAvailability: (id: string, e?: React.MouseEvent) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
}

export function MenuItemCard({
  product,
  categories,
  onToggleAvailability,
  onEdit,
  onDelete
}: MenuItemCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const categoryName = categories.find(c => c.id === product.categoryId)?.name || "Genel";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-[#E5E7EB] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden bg-[#F5F5F7]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#86868B]">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-blue-500 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium">
          {formatCompactNumber(product.price)} ₺
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2 relative" ref={menuRef}>
          <h3 className="text-lg font-semibold text-[#1D1D1F] group-hover:text-[#0071e3] transition-colors">
            {product.name}
          </h3>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "p-1 rounded-full transition-colors",
              isMenuOpen ? "bg-[#F5F5F7] text-[#1D1D1F]" : "text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute -right-2 -top-2 w-44 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-30 py-1 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-end px-2 pt-1">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>
              <button
                onClick={() => {
                  onEdit(product);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                Edit Menu Item
              </button>
              <button
                onClick={(e) => {
                  onToggleAvailability(product.id, e);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                {product.isAvailable ? "Set to Draft" : "Set to Active"}
              </button>
              <button
                onClick={(e) => {
                  onDelete(product.id, e);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                Delete Menu Item
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-[#86868B] line-clamp-2 mb-4 min-h-[40px]">
          {product.description || "No description provided."}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-[#F5F5F7]">
          {product.isAvailable ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Draft
            </span>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="p-1.5 hover:bg-[#F5F5F7] rounded-md transition-colors text-[#86868B] hover:text-[#1D1D1F]"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
            </button>
            <button
              onClick={(e) => onDelete(product.id, e)}
              className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-[#86868B] hover:text-red-500"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
