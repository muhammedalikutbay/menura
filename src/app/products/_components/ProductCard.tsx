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
    <Card className={cn("group overflow-hidden border border-divider hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full", !product.isAvailable && "opacity-60")}>
      {/* Image Holder */}
      <div className="aspect-[4/3] bg-bg-secondary relative overflow-hidden shrink-0">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary/20 bg-gradient-to-br from-bg-secondary to-divider">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
          <Badge 
            variant={product.isAvailable ? "success" : "secondary"} 
            className={cn(
              "shadow-lg backdrop-blur-md border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
              product.isAvailable ? "bg-success/90 text-white" : "bg-text-secondary/90 text-white"
            )}
          >
            {product.isAvailable ? "Mevcut" : "Tükendi"}
          </Badge>
          {product.calories && (
             <Badge className="bg-white/80 backdrop-blur-md text-text-primary border-none shadow-sm text-[9px] font-bold">
               {product.calories} kcal
             </Badge>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-callout font-black text-text-primary line-clamp-1 group-hover:text-action transition-colors">{product.name}</h4>
            <span className="text-[10px] font-mono font-bold text-text-secondary/50 border border-divider px-1.5 rounded-md bg-bg-secondary/20">
              #{String(product.order).padStart(2, "0")}
            </span>
          </div>
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider bg-bg-secondary inline-block px-1.5 py-0.5 rounded">
            {categoryName}
          </p>
          {product.description && <p className="text-caption text-text-secondary line-clamp-2 leading-relaxed pt-1">{product.description}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-divider pt-3 mt-auto">
          <div className="flex flex-col">
            <span className="text-headline font-black text-action">
              {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
            </span>
            {product.discountPrice && (
              <span className="text-caption text-text-secondary line-through italic decoration-error/50">
                {product.discountPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-bg-secondary" onClick={(e) => onToggleAvailability(product.id, e)} title="Stok Durumu">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={product.isAvailable ? "text-success" : "text-text-secondary"}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-bg-secondary" onClick={() => onEdit(product)}>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-error-bg text-error/40 hover:text-error" onClick={(e) => onDelete(product.id, e)}>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
