import { type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  id,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className={`text-sm font-medium transition-colors duration-150 ${
            error ? "text-rose-600" : "text-espresso-600"
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none bg-cream-50 border-t-0 border-x-0 border-b-2 border-l-2 border-l-transparent rounded-none pl-3 pr-8 py-2 text-sm text-espresso-800 transition-all duration-200 ease-out focus:outline-none focus:border-b-sienna-400 focus:border-l-sienna-400 focus:pl-4 ${
            error
              ? "border-b-rose-400 focus:border-b-rose-400"
              : "border-b-espresso-200"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-espresso-400"
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
