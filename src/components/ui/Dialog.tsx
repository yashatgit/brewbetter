import { useEffect, useRef, type ReactNode } from "react";
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

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto max-w-lg w-full rounded-3xl bg-cream-50 p-0 border-none shadow-2xl backdrop:bg-espresso-950/70 backdrop:backdrop-blur-md"
    >
      <div className={`p-8 md:p-10 ${open ? "animate-fade-in-scale" : ""}`}>
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-sienna-400 via-sienna-500 to-sienna-400" />

        {title && (
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-espresso-900 tracking-tight">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-xl p-2 text-espresso-400 transition-all duration-200 ease-out hover:text-espresso-700 hover:bg-cream-200 hover:rotate-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-2"
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
