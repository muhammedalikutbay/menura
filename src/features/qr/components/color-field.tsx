import { useId } from "react";
import { Label } from "@/components/ui/label";

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

/** Native color picker with a hex readout. */
export function ColorField({ label, value, onChange }: ColorFieldProps) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex h-11 items-center gap-3 rounded-full border border-border-strong bg-surface px-2.5 has-[:focus-visible]:border-accent">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-8 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
        />
        <span className="font-mono text-sm text-fg-muted uppercase" aria-hidden="true">
          {value}
        </span>
      </div>
    </div>
  );
}
