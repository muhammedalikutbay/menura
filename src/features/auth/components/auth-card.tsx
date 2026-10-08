import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Secondary navigation below the form, e.g. "Hesabınız yok mu? Kayıt olun". */
  footer?: React.ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="gap-6 py-6 sm:py-8">
      <CardHeader className="gap-1.5 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {description && <CardDescription className="text-base">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="sm:px-8">{children}</CardContent>
      {footer && (
        <CardFooter className="flex-wrap justify-center gap-x-1.5 text-center text-sm text-fg-muted sm:px-8">
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
