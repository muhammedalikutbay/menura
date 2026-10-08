import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Kategoriler yükleniyor</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-[74px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
