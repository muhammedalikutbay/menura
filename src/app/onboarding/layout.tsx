import { Logo } from "@/components/app-shell/logo";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-4 py-4 sm:py-6">
      <header className="mx-auto flex w-full max-w-lg items-center justify-between">
        <Logo />
        <SignOutButton />
      </header>
      <main id="main-content" className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-8">
        {children}
      </main>
    </div>
  );
}
