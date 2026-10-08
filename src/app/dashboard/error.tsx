"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      role="alert"
      icon={<TriangleAlert />}
      title="Bir şeyler ters gitti"
      description="Bu sayfa yüklenirken beklenmedik bir hata oluştu. Tekrar deneyebilirsiniz; sorun sürerse biraz sonra yeniden gelin."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => retry()}>
            <RefreshCw aria-hidden="true" />
            Tekrar dene
          </Button>
          <Link href={"/dashboard" as Route} className={buttonVariants({ variant: "secondary" })}>
            Genel bakışa dön
          </Link>
        </div>
      }
    />
  );
}
