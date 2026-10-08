import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Ürünler yükleniyor</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 sm:w-52" />
        <Skeleton className="h-11 sm:w-44" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-[78px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
