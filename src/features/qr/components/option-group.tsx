import { useId } from "react";
import { cn } from "@/lib/cn";

type OptionGroupProps<T extends string> = {
  legend: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  className?: string;
};

/** Segmented single choice built from native radio inputs (keyboard and screen reader friendly). */
export function OptionGroup<T extends string>({ legend, value, options, onChange, className }: OptionGroupProps<T>) {
  const name = useId();
  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-2", className)}>
      <legend className="type-caption mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="relative cursor-pointer select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent rounded-full"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex min-h-11 items-center rounded-full border border-border-strong bg-surface px-4 text-sm font-medium transition-colors",
                "hover:bg-surface-muted peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent-text",
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
