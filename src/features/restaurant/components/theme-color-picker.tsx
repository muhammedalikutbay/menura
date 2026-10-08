"use client";

import { Check } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";

export const THEME_PRESETS = [
  { value: "#0071e3", label: "Mavi" },
  { value: "#5856d6", label: "İndigo" },
  { value: "#8944ab", label: "Mor" },
  { value: "#c2185b", label: "Pembe" },
  { value: "#d70015", label: "Kırmızı" },
  { value: "#c93400", label: "Turuncu" },
  { value: "#1e7b34", label: "Yeşil" },
  { value: "#1d1d1f", label: "Grafit" },
] as const;

type ThemeColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string[];
  disabled?: boolean;
};

/** Preset swatches plus the native color input for anything else. */
export function ThemeColorPicker({ value, onChange, error, disabled }: ThemeColorPickerProps) {
  const labelId = useId();
  const customId = useId();
  const current = value.toLowerCase();

  return (
    <div className="flex flex-col gap-3">
      <p id={labelId} className="text-sm leading-5 font-medium">
        Tema rengi
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2.5">
        {THEME_PRESETS.map((preset) => {
          const selected = current === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={preset.label}
              title={preset.label}
              disabled={disabled}
              onClick={() => onChange(preset.value)}
              style={{ backgroundColor: preset.value }}
              className={cn(
                "flex size-11 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-surface transition-shadow disabled:opacity-50",
                selected && "ring-2 ring-fg",
              )}
            >
              {selected && <Check aria-hidden="true" className="size-5" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <input
          id={customId}
          type="color"
          value={/^#[0-9a-f]{6}$/.test(current) ? current : "#0071e3"}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-invalid={error?.length ? true : undefined}
          className="h-11 w-14 cursor-pointer rounded-md border border-border-strong bg-surface p-1 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <label htmlFor={customId} className="text-sm text-fg-muted">
          Özel renk seç · <span className="font-mono text-fg uppercase">{current}</span>
        </label>
      </div>
      {error?.length ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error[0]}
        </p>
      ) : (
        <p className="text-sm text-fg-muted">Menünüzdeki düğme ve vurgularda kullanılır.</p>
      )}
    </div>
  );
}
