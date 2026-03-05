import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-sienna-500 to-sienna-600 text-cream-50 shadow-md shadow-sienna-500/20 hover:from-sienna-600 hover:to-sienna-700 hover:shadow-lg hover:shadow-sienna-600/25 hover:-translate-y-px active:translate-y-0 active:shadow-sm",
  secondary:
    "bg-cream-50 text-espresso-700 border-2 border-cream-300 hover:border-sienna-300 hover:shadow-lg hover:-translate-y-px hover:bg-white active:translate-y-0 active:shadow-sm",
  ghost:
    "bg-transparent text-espresso-500 hover:bg-cream-200/80 hover:text-espresso-700 active:bg-cream-300",
  danger:
    "bg-gradient-to-b from-rose-500 to-rose-600 text-cream-50 shadow-md shadow-rose-500/20 hover:from-rose-600 hover:to-rose-600 hover:shadow-lg active:shadow-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-8 py-3.5 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
