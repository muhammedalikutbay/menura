import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 sm:gap-10" aria-busy="true">
      <span role="status" className="sr-only">
        Yükleniyor
      </span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 sm:gap-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            {Array.from({ length: 3 }, (_, index) => (
              <Card key={index} className="gap-2 px-5 sm:px-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-32" />
              </Card>
            ))}
          </div>
          <Card className="gap-4 px-5 sm:px-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-44 w-full" />
          </Card>
        </div>
        <div className="flex flex-col gap-8">
          <Card className="gap-3 px-5 sm:px-6">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-9 w-40" />
          </Card>
          <Card className="gap-3 px-5 sm:px-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-full rounded-full" />
            <Skeleton className="h-9 w-full rounded-full" />
            <Skeleton className="h-9 w-full rounded-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}
