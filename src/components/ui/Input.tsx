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
          className={`data-label ${error ? "!text-destructive" : ""}`}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-white border-2 border-border px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground transition-all duration-200 ease-out focus:outline-none focus:border-editorial focus:ring-1 focus:ring-editorial/30 ${
          error ? "border-destructive focus:border-destructive" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
