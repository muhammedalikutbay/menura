"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { authCardClassName } from "@/features/auth/components/auth-card";

export default function OnboardingError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card className={authCardClassName}>
      <CardHeader className="gap-1.5 px-0 sm:px-0">
        <h1 className="type-title-lg text-balance">Bir sorun oluştu</h1>
        <CardDescription className="text-base text-fg-muted">Sayfa yüklenemedi. Lütfen tekrar deneyin.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-0">
        <Button size="lg" className="w-full" onClick={reset}>
          Tekrar dene
        </Button>
      </CardContent>
    </Card>
  );
}
