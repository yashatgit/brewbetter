import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "editorial";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-muted text-secondary-foreground border border-border",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-accent text-accent-foreground border border-accent",
  editorial: "bg-destructive/10 text-editorial border border-destructive/20",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
