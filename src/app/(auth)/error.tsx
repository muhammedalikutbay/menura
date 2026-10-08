"use client";

import { Button } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/auth-card";

export default function AuthError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AuthCard title="Bir sorun oluştu" description="Sayfa yüklenemedi. Lütfen tekrar deneyin.">
      <Button size="lg" className="w-full" onClick={reset}>
        Tekrar dene
      </Button>
    </AuthCard>
  );
}
