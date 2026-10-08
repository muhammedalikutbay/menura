import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authCardClassName } from "@/features/auth/components/auth-card";

export default function OnboardingLoading() {
  return (
    <Card aria-busy="true" className={authCardClassName}>
      <span className="sr-only" role="status">
        Yükleniyor
      </span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-13 w-full rounded-pill" />
    </Card>
  );
}
