"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { sanitizeSlugInput } from "../slug-input";

type SlugFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Host shown in the address preview, e.g. "menura.app". */
  host: string;
  error?: string[];
  disabled?: boolean;
  autoFocus?: boolean;
};

/** Menu address input with a live preview of the public URL. */
export function SlugField({ value, onChange, host, error, disabled, autoFocus }: SlugFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Field
        label="Menü adresi"
        hint="Küçük harf, rakam ve tire kullanabilirsiniz."
        error={error}
        required
      >
        <Input
          value={value}
          onChange={(event) => onChange(sanitizeSlugInput(event.target.value))}
          onBlur={() => onChange(value.replace(/-+$/, ""))}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          disabled={disabled}
          autoFocus={autoFocus}
        />
      </Field>
      <p className="text-sm text-fg-muted" aria-live="polite">
        Menünüzün adresi:{" "}
        <span className="font-medium break-all text-fg">
          {host}/m/{value || "adres"}
        </span>
      </p>
    </div>
  );
}
