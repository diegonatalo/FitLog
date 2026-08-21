import { useEffect } from "react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  onCancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onCancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
      >
        <h2 className="text-lg font-bold text-balance">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
          {description}
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border bg-background py-3 font-semibold text-foreground hover:bg-muted"
          >
            {onCancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-destructive py-3 font-bold text-destructive-foreground hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
