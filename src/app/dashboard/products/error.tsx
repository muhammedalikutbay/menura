"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ProductsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EmptyState
      role="alert"
      icon={<TriangleAlert />}
      title="Ürünler yüklenemedi"
      description="Bir sorun oluştu. Lütfen tekrar deneyin."
      action={<Button onClick={reset}>Tekrar dene</Button>}
    />
  );
}
