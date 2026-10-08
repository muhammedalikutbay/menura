import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <Card aria-busy="true" className="gap-6 px-5 py-6 sm:px-8 sm:py-8">
      <span className="sr-only" role="status">
        Yükleniyor
      </span>
      <Skeleton className="h-8 w-1/2" />
      <div className="flex flex-col gap-5">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </Card>
  );
}
