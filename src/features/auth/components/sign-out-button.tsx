"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

/** Plain "Çıkış yap" button for pages outside the dashboard shell (e.g. onboarding). */
export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message);
      router.replace("/login" as Route);
      router.refresh();
    } catch {
      toast.error("Çıkış yapılamadı. Lütfen tekrar deneyin.");
      setPending(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" loading={pending} onClick={signOut}>
      Çıkış yap
    </Button>
  );
}
