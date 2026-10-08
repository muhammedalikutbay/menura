import { Skeleton } from "@/components/ui/skeleton";

export default function ProductFormLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Form yükleniyor</span>
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-72 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
