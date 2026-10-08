import { cn } from "@/lib/cn";

type PageHeaderProps = Omit<React.ComponentProps<"header">, "title"> & {
  title: string;
  description?: string;
  /** Buttons or links aligned to the end on wide screens. */
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <header
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="type-title-lg text-balance">{title}</h1>
        {description && <p className="type-body max-w-2xl text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
