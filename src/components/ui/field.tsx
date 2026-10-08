import { cloneElement, isValidElement, useId } from "react";
import { cn } from "@/lib/cn";
import { Label } from "./label";

type ControlProps = {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
  "aria-required": true | undefined;
};

export type FieldProps = {
  label: string;
  hint?: string;
  /** One or more messages, e.g. zod field errors. */
  error?: string | string[];
  required?: boolean;
  /** Shows "İsteğe bağlı" next to the label. */
  optional?: boolean;
  className?: string;
  /**
   * The control. A single element receives id / aria-describedby / aria-invalid automatically;
   * pass a function instead to wire a custom control yourself.
   */
  children: React.ReactElement<Partial<ControlProps>> | ((props: ControlProps) => React.ReactNode);
};

export function Field({ label, hint, error, required, optional, className, children }: FieldProps) {
  const uid = useId();
  // An explicit id on the child wins so the label still points at the right element.
  const ownId = typeof children !== "function" && isValidElement(children) ? children.props.id : undefined;
  const controlId = ownId ?? `${uid}-control`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  const messages = (Array.isArray(error) ? error : [error]).filter((m): m is string => Boolean(m));
  const hasError = messages.length > 0;
  const describedBy = [hint ? hintId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined;

  const controlProps: ControlProps = {
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": hasError || undefined,
    "aria-required": required || undefined,
  };

  const control =
    typeof children === "function"
      ? children(controlProps)
      : isValidElement(children)
        ? cloneElement(children, {
            id: controlProps.id,
            "aria-describedby": children.props["aria-describedby"] ?? controlProps["aria-describedby"],
            "aria-invalid": children.props["aria-invalid"] ?? controlProps["aria-invalid"],
            "aria-required": children.props["aria-required"] ?? controlProps["aria-required"],
          })
        : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={controlId}>
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
        {optional && <span className="ml-1.5 font-normal text-fg-muted">İsteğe bağlı</span>}
      </Label>
      {control}
      {hint && (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
      {hasError && (
        <div id={errorId} role="alert" className="flex flex-col gap-0.5 text-sm font-medium text-danger">
          {messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}
    </div>
  );
}
