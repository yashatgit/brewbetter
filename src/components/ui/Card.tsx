import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
}

export function Card({
  onClick,
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
      className={`animate-fade-in rounded-2xl bg-cream-50 border border-cream-200 shadow-sm border-l-[4px] border-l-cream-300 p-5 transition-all duration-250 ease-out ${
        interactive
          ? "cursor-pointer hover:shadow-xl hover:border-l-sienna-400 hover:-translate-y-[2px] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100 active:translate-y-0 active:shadow-md"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
