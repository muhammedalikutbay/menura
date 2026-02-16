"use client";

import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  categories: Category[];
  onToggleAvailability: (id: string, e?: React.MouseEvent) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
}

export function ProductCard({
  product,
  categories,
  onToggleAvailability,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const categoryName = categories.find(c => c.id === product.categoryId)?.name || "Genel";

  return (
    <Card className={cn(
      "group overflow-hidden border border-divider/50 hover:shadow-2xl hover:shadow-[#0d7ff2]/10 hover:-translate-y-1 transition-all duration-500 relative flex flex-col h-full bg-white rounded-3xl",
      !product.isAvailable && "bg-bg-secondary/30 grayscale-[0.3]"
    )}>
      {/* Image Section */}
      <div className="aspect-[16/10] relative overflow-hidden bg-bg-secondary group-hover:aspect-[16/11] transition-all duration-700">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
        )}
        
        {/* Preparation Time Badge */}
        {product.preparationTime && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur shadow-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-text-primary flex items-center gap-1.5 uppercase tracking-tighter border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-action"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {product.preparationTime}
          </div>
        )}

        {/* Action Overlay (Visible on Hover) */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit(product)} className="w-10 h-10 rounded-xl bg-white text-text-primary hover:bg-white/90 shadow-xl scale-90 group-hover:scale-100 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </Button>
          <Button variant="secondary" size="sm" onClick={(e) => onDelete(product.id, e)} className="w-10 h-10 rounded-xl bg-white text-error hover:bg-white/90 shadow-xl scale-90 group-hover:scale-100 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
             <div className="space-y-1 min-w-0">
               <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">
                 {categoryName}
               </span>
               <h4 className="text-headline font-black text-text-primary uppercase tracking-tight truncate leading-tight transition-colors group-hover:text-action">
                 {product.name}
               </h4>
             </div>
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAvailability(product.id, e);
                }}
                className={cn(
                  "mt-1 w-2.5 h-2.5 rounded-full shrink-0 border border-white/50 shadow-sm transition-all duration-500",
                  product.isAvailable ? "bg-success scale-125 hover:rotate-180" : "bg-text-secondary opacity-30 hover:opacity-100"
                )}
                title={product.isAvailable ? "Pasife Al" : "Aktife Al"}
             />
          </div>
        </div>

        {product.description && (
          <p className="text-caption text-text-secondary leading-relaxed line-clamp-2 font-medium">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-divider/30">
          <div className="flex flex-col">
            <span className={cn(
              "text-callout font-black tracking-tight",
              product.discountPrice ? "text-success" : "text-action"
            )}>
              {product.discountPrice ? `${product.discountPrice}₺` : `${product.price}₺`}
            </span>
            {product.discountPrice && (
              <span className="text-[10px] text-text-secondary line-through opacity-50 decoration-2 font-black">
                {product.price}₺
              </span>
            )}
          </div>
          
          <div className="flex -space-x-1.5 overflow-hidden">
             {product.allergens?.slice(0, 3).map((a, i) => (
               <div key={i} className="w-6 h-6 rounded-full bg-bg-secondary border-2 border-white flex items-center justify-center text-[8px] font-black text-error shadow-sm capitalize" title={a}>
                 {a[0]}
               </div>
             ))}
             {(product.allergens?.length || 0) > 3 && (
               <div className="w-6 h-6 rounded-full bg-bg-secondary border-2 border-white flex items-center justify-center text-[8px] font-black text-text-secondary shadow-sm">
                 +{(product.allergens?.length || 0) - 3}
               </div>
             )}
          </div>
        </div>
      </div>
    </Card>
  );
}
