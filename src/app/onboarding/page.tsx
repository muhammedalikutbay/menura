import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { OnboardingForm } from "@/features/restaurant/components/onboarding-form";
import { env } from "@/server/env";
import { getRestaurantForUser, requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Restoranınızı oluşturun" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (await getRestaurantForUser(user.id)) redirect("/dashboard");

  const firstName = user.name.trim().split(/\s+/)[0] ?? "";

  return (
    <Card className="gap-6 py-6 sm:py-8">
      <CardHeader className="gap-1.5 sm:px-8">
        <p className="text-sm font-medium text-accent-text">Son bir adım</p>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {firstName ? `Hoş geldiniz, ${firstName}!` : "Hoş geldiniz!"}
        </h1>
        <CardDescription className="text-base">
          Restoranınızın adını ve menü adresini belirleyin. Ardından kategorileri ve ürünleri ekleyip menünüzü
          yayınlayabilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="sm:px-8">
        <OnboardingForm appUrl={env.APP_URL} />
      </CardContent>
    </Card>
  );
}
