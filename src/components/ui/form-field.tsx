import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  description?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, description, children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("grid w-full items-center gap-1.5", className)} {...props}>
        {label && <Label>{label}</Label>}
        {children}
        {description && (
          <p className="text-caption text-text-secondary">{description}</p>
        )}
        {error && (
          <p className="text-caption font-medium text-error">{error}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
