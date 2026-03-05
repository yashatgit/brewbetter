import { type InputHTMLAttributes } from "react";

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
}

export function Slider({
  label,
  min,
  max,
  value,
  onChange,
  minLabel,
  maxLabel,
  className = "",
  id,
  ...props
}: SliderProps) {
  const sliderId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={sliderId}
          className="text-sm font-medium text-espresso-700"
        >
          {label}
        </label>
      )}
      <div className="relative pt-6">
        {/* Value pill positioned above the thumb */}
        <span
          aria-hidden="true"
          className="absolute -top-0 rounded-full bg-sienna-500 px-2 py-0.5 text-xs font-medium text-cream-50 shadow-sm transition-all duration-150 ease-out"
          style={{
            left: `${percentage}%`,
            transform: `translateX(-50%)`,
          }}
        >
          {value}
        </span>
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full ${className}`}
          {...props}
        />
      </div>
      <div className="flex justify-between text-xs text-espresso-400">
        <span>{minLabel ?? min}</span>
        <span>{maxLabel ?? max}</span>
      </div>
    </div>
  );
}
