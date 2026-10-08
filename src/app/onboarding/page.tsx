import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { authCardClassName } from "@/features/auth/components/auth-card";
import { OnboardingForm } from "@/features/restaurant/components/onboarding-form";
import { env } from "@/server/env";
import { getRestaurantForUser, requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Restoranınızı oluşturun" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (await getRestaurantForUser(user.id)) redirect("/dashboard");

  const firstName = user.name.trim().split(/\s+/)[0] ?? "";

  return (
    <Card className={authCardClassName}>
      <CardHeader className="gap-1.5 px-0 sm:px-0">
        <p className="type-overline text-accent-text">Son bir adım</p>
        <h1 className="type-title-lg text-balance">{firstName ? `Hoş geldiniz, ${firstName}!` : "Hoş geldiniz!"}</h1>
        <CardDescription className="text-base text-fg-muted">
          Restoranınızın adını ve menü adresini belirleyin. Ardından kategorileri ve ürünleri ekleyip menünüzü
          yayınlayabilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-0">
        <OnboardingForm appUrl={env.APP_URL} />
      </CardContent>
    </Card>
  );
}
