import { cn } from "@/lib/cn";

type EmptyStateProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** A lucide icon element, e.g. `<UtensilsCrossed />`. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Call to action, usually a Button. */
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-fg-muted [&_svg]:size-6"
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1">
        <h3 className="type-title">{title}</h3>
        {description && <p className="type-body text-fg-muted">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
