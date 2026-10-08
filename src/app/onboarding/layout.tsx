import { Logo } from "@/components/app-shell/logo";
import { AuthGlow } from "@/features/auth/components/auth-card";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-canvas px-4 py-4 sm:py-6">
      <AuthGlow />
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-between">
        <Logo />
        <SignOutButton />
      </header>
      <main id="main-content" className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-8">
        {children}
      </main>
    </div>
  );
}
