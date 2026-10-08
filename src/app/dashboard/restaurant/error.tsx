"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function RestaurantError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EmptyState
      icon={<TriangleAlert />}
      title="Restoran bilgileri yüklenemedi"
      description="Beklenmeyen bir sorun oluştu. Lütfen tekrar deneyin."
      action={<Button onClick={reset}>Tekrar dene</Button>}
    />
  );
}
