import { type HTMLAttributes, type ButtonHTMLAttributes } from "react";

type CardAccent = "editorial" | "data" | "success" | "muted" | "none";

type CardBaseProps = {
  accent?: CardAccent;
  compact?: boolean;
};

type StaticCardProps = CardBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, "onClick"> & {
    onClick?: never;
  };

type InteractiveCardProps = CardBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
    onClick: () => void;
  };

type CardProps = StaticCardProps | InteractiveCardProps;

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
  const baseClass = `bg-card border-2 border-border ${compact ? "p-4" : "p-6"} ${accentClasses[accent]} transition-all duration-200 ease-out`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClass} w-full text-left cursor-pointer hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
        {...(props as Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">)}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      className={`${baseClass} ${className}`}
      {...(props as HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </div>
  );
}
