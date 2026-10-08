import { Skeleton } from "@/components/ui/skeleton";

export default function MenuLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Menü yükleniyor</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-full rounded-full sm:w-64" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6">
        <Skeleton className="hidden h-64 rounded-lg lg:block" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-lg bg-surface shadow-hairline">
              <Skeleton className="m-3 h-9 w-56" />
              {Array.from({ length: 3 }, (_, row) => (
                <div key={row} className="flex h-16 items-center gap-3 border-t border-border px-4">
                  <Skeleton className="size-12 rounded-md" />
                  <Skeleton className="h-5 w-48 max-w-[50%]" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
