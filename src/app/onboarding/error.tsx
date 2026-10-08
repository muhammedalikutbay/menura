"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default function OnboardingError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card className="gap-6 py-6 sm:py-8">
      <CardHeader className="gap-1.5 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Bir sorun oluştu</h1>
        <CardDescription className="text-base">Sayfa yüklenemedi. Lütfen tekrar deneyin.</CardDescription>
      </CardHeader>
      <CardContent className="sm:px-8">
        <Button size="lg" className="w-full" onClick={reset}>
          Tekrar dene
        </Button>
      </CardContent>
    </Card>
  );
}
