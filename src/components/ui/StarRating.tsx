import { Star } from "lucide-react";

type StarSize = "sm" | "md" | "lg";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: StarSize;
}

const sizeMap: Record<StarSize, { star: number; gap: string }> = {
  sm: { star: 18, gap: "gap-0.5" },
  md: { star: 26, gap: "gap-1" },
  lg: { star: 36, gap: "gap-1.5" },
};

export function StarRating({
  value,
  onChange,
  size = "md",
}: StarRatingProps) {
  const { star: starSize, gap } = sizeMap[size];
  const interactive = !!onChange;

  return (
    <div
      className={`inline-flex items-center ${gap}`}
      role="group"
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          role={interactive ? "button" : "presentation"}
          tabIndex={interactive ? 0 : -1}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange?.(star)}
          onKeyDown={
            interactive
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange!(star);
                  }
                }
              : undefined
          }
          className={`inline-flex rounded-sm transition-all duration-200 ease-out ${
            interactive
              ? "cursor-pointer hover:scale-125 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-1 focus-visible:ring-offset-cream-50"
              : ""
          }`}
        >
          <Star
            size={starSize}
            strokeWidth={1.5}
            className={star <= value ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_4px_rgba(212,149,32,0.4)]" : "text-cream-300"}
            aria-hidden="true"
          />
        </span>
      ))}
    </div>
  );
}
