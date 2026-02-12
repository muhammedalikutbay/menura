import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary: `
    bg-primary 
    text-on-primary 
    hover:opacity-90 
    active:scale-[0.98]
  `,
  secondary: `
    bg-surface 
    border 
    text-body 
    hover:bg-muted 
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent 
    text-body 
    hover:bg-muted 
    active:scale-[0.98]
  `,
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};
const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const classes = `
    interactive
    rounded-md
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${disabled ? disabledStyles : ""}
    ${className}
  `;

  return <button disabled={disabled} className={classes} {...props} />;
}
