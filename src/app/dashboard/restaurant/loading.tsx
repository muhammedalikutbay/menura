import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only" role="status">
        Restoran bilgileri yükleniyor
      </span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="flex max-w-3xl flex-col gap-6">
        <Card className="gap-4 px-5 sm:px-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full" />
        </Card>
        <Card className="gap-4 px-5 sm:px-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </Card>
        <Card className="gap-4 px-5 sm:px-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-11 w-full" />
        </Card>
      </div>
    </div>
  );
}
