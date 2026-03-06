import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Focus trap: cycle through focusable elements within the dialog
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    []
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      onKeyDown={handleKeyDown}
      className="m-auto max-w-lg w-[calc(100%-2rem)] bg-card p-0 border-2 border-border backdrop:bg-[#000]/40 backdrop:backdrop-blur-sm"
    >
      <div className={`p-8 md:p-10 ${open ? "animate-fade-in-scale" : ""}`}>
        {/* Decorative top accent — editorial red */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-editorial" />

        {title && (
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-3 -m-1 text-muted-foreground transition-all duration-200 ease-out hover:text-secondary-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        )}
        {children}
      </div>
    </dialog>
  );
}
