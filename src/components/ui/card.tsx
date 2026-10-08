import { cn } from "@/lib/cn";

/** Resting container: surface, hairline edge, 24px padding (16px on mobile). */
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-4 rounded-lg bg-surface py-4 text-fg shadow-hairline sm:py-6", className)}
      {...props}
    />
  );
}

/** Elevated card used around hero objects and for floating UI samples. */
export function FloatingCard({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-lg bg-surface p-4 text-fg shadow-float", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 px-4 sm:px-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("type-title", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-fg-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-4 sm:px-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-3 px-4 sm:px-6", className)} {...props} />;
}
