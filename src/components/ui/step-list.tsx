import { cn } from "@/lib/cn";

export type Step = {
  title: string;
  description?: string;
};

type StepListProps = Omit<React.ComponentProps<"ol">, "children"> & {
  steps: Step[];
};

/** Numbered rows with 28px brand-gradient dots joined by a hairline. */
export function StepList({ steps, className, ...props }: StepListProps) {
  return (
    <ol className={cn("flex flex-col", className)} {...props}>
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
          {index < steps.length - 1 && (
            <span aria-hidden="true" className="absolute top-8 bottom-1 left-3.5 w-px bg-border" />
          )}
          <span
            aria-hidden="true"
            className="gradient-brand tabular relative flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-brand-fg"
          >
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-col gap-1 pt-0.5">
            <h3 className="text-[17px] leading-snug font-semibold tracking-[-0.015em]">{step.title}</h3>
            {step.description && <p className="type-body text-fg-muted">{step.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
