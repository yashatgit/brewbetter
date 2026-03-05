import { type HTMLAttributes } from "react";

type CardAccent = "editorial" | "data" | "success" | "muted" | "none";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
  accent?: CardAccent;
  compact?: boolean;
}

const accentClasses: Record<CardAccent, string> = {
  editorial: "border-l-4 border-l-editorial",
  data: "border-l-4 border-l-data",
  success: "border-l-4 border-l-success",
  muted: "border-l-4 border-l-secondary",
  none: "",
};

export function Card({
  onClick,
  accent = "none",
  compact = false,
  className = "",
  children,
  ...props
}: CardProps) {
  const interactive = !!onClick;

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick!();
              }
            }
          : undefined
      }
      className={`bg-card border-2 border-border ${compact ? "p-4" : "p-6"} ${accentClasses[accent]} transition-all duration-200 ease-out ${
        interactive
          ? "cursor-pointer hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
