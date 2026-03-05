import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className={`text-sm font-medium transition-colors duration-150 ${
            error ? "text-rose-600" : "text-espresso-600"
          }`}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-cream-50 border-t-0 border-x-0 border-b-2 border-l-2 border-l-transparent rounded-none pl-3 pr-3 py-2 text-sm text-espresso-800 placeholder:text-cream-400 transition-all duration-200 ease-out focus:outline-none focus:border-b-sienna-400 focus:border-l-sienna-400 focus:pl-4 ${
          error
            ? "border-b-rose-400 focus:border-b-rose-400"
            : "border-b-espresso-200"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
