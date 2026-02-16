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
      "group overflow-hidden border border-divider hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 relative flex flex-col h-full bg-white",
      !product.isAvailable && "bg-bg-secondary/30"
    )}>
      {/* Top Badge Overlay */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[10px] font-mono font-black text-text-primary/70 border border-divider/50 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm">
          #{String(product.order).padStart(2, "0")}
        </span>
      </div>

      {/* Image Holder */}
      <div className="aspect-[16/10] bg-bg-secondary relative overflow-hidden shrink-0 border-b border-divider/50">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className={cn(
              "w-full h-full object-cover transition-all duration-700 group-hover:scale-110",
              !product.isAvailable && "grayscale-[0.8] opacity-60"
            )} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary/20 bg-gradient-to-br from-bg-secondary to-divider">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
        )}
        
        {/* Availability Badge - Top Right */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
           <Badge 
            variant={product.isAvailable ? "success" : "secondary"} 
            className={cn(
               "shadow-lg backdrop-blur-md border-none text-[9px] font-black uppercase tracking-widest px-2.5 py-1 transition-all",
               product.isAvailable ? "bg-success text-white ring-2 ring-white/20" : "bg-text-secondary text-white ring-2 ring-white/10"
            )}
          >
            {product.isAvailable ? "Satışta" : "Pasif"}
          </Badge>
          {product.calories && (
             <Badge className="bg-white/90 backdrop-blur-sm text-text-primary border-none shadow-md text-[9px] font-extrabold px-2 py-0.5">
               {product.calories} KCAL
             </Badge>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1 opacity-60">
              {categoryName}
            </p>
            <h4 className="text-body-lg font-black text-text-primary leading-tight line-clamp-2 group-hover:text-action transition-colors">
              {product.name}
            </h4>
          </div>
          {product.description && (
            <p className="text-caption text-text-secondary line-clamp-2 leading-relaxed h-[2.8rem]">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-divider/50 flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            {product.discountPrice && (
              <span className="text-[11px] font-bold text-text-secondary/50 line-through decoration-error/30">
                {product.discountPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </span>
            )}
            <span className="text-h3 font-black text-text-primary tracking-tight">
              {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Availability Toggle - Always Visible */}
            <Button 
               variant="ghost" 
               size="sm" 
               className={cn(
                 "h-10 px-3 rounded-xl border border-divider/50 hover:bg-bg-secondary transition-all flex items-center gap-2",
                 product.isAvailable ? "text-success bg-success/5 hover:bg-success/10" : "text-text-secondary bg-bg-secondary/50"
               )} 
               onClick={(e) => onToggleAvailability(product.id, e)}
               title={product.isAvailable ? "Satışı Durdur" : "Satışa Aç"}
            >
               <div className={cn("w-2 h-2 rounded-full shadow-sm", product.isAvailable ? "bg-success animate-pulse" : "bg-text-secondary")} />
               <span className="text-[10px] font-black uppercase tracking-widest">{product.isAvailable ? "Açık" : "Kapalı"}</span>
            </Button>

            <Button 
               variant="ghost" 
               size="sm" 
               className="h-10 w-10 p-0 rounded-xl bg-bg-secondary/30 hover:bg-action/10 hover:text-action transition-all" 
               onClick={() => onEdit(product)}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
            </Button>
            
            <Button 
               variant="ghost" 
               size="sm" 
               className="h-10 w-10 p-0 rounded-xl hover:bg-error/10 hover:text-error text-text-secondary/40 transition-all" 
               onClick={(e) => onDelete(product.id, e)}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
