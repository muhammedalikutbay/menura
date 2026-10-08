import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";

/** Surface shared by auth and onboarding cards: radius-xl, hairline edge, float shadow, 32px padding (24px on mobile). */
export const authCardClassName = "gap-6 rounded-xl p-6 shadow-float ring-1 ring-border sm:p-8";

/** Soft brand glow behind centered cards. Decorative only; the parent must be `relative` and `overflow-hidden`. */
export function AuthGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="gradient-brand absolute -top-28 left-1/2 size-[24rem] -translate-x-[78%] rounded-full opacity-30 blur-3xl sm:size-[36rem]" />
      <div className="gradient-brand absolute top-1/3 left-1/2 size-[20rem] translate-x-[12%] rounded-full opacity-25 blur-3xl sm:size-[30rem]" />
    </div>
  );
}

type AuthCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Secondary navigation below the form, e.g. "Hesabınız yok mu? Kayıt olun". */
  footer?: React.ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className={authCardClassName}>
      <CardHeader className="gap-1.5 px-0 sm:px-0">
        <h1 className="type-title-lg text-balance">{title}</h1>
        {description && <CardDescription className="text-base text-fg-muted">{description}</CardDescription>}
      </CardHeader>
      {/* Primary submit buttons fill the card width on every auth form. */}
      <CardContent className="px-0 sm:px-0 [&_button[type=submit]]:w-full">{children}</CardContent>
      {footer && (
        <CardFooter className="flex-wrap justify-center gap-x-1.5 px-0 text-center text-sm text-fg-muted sm:px-0">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

/** Red box for form-level errors; announced to screen readers. */
export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-md bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
      {children}
    </p>
  );
}
