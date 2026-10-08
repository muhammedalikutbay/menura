import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppearanceLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only" role="status">
        Görünüm ayarları yükleniyor
      </span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
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
        <Skeleton className="hidden h-[620px] w-full rounded-lg lg:block" />
      </div>
    </div>
  );
}
