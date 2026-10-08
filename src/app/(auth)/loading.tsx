import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authCardClassName } from "@/features/auth/components/auth-card";

export default function AuthLoading() {
  return (
    <Card aria-busy="true" className={authCardClassName}>
      <span className="sr-only" role="status">
        Yükleniyor
      </span>
      <Skeleton className="h-8 w-1/2" />
      <div className="flex flex-col gap-5">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-13 w-full rounded-pill" />
      </div>
    </Card>
  );
}
