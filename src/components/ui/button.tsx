import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary: "bg-primary text-on-primary",
  secondary: "bg-surface border text-body",
  ghost: "bg-transparent text-body",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const classes = `
    interactive
    rounded-md
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `;

  return <button className={classes} {...props} />;
}
