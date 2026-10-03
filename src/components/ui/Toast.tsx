"use client";

export interface ToastProps {
  message: string;
  visible: boolean;
  type?: "success" | "error" | "warning" | "info";
  onClose?: () => void;
  duration?: number;
}

export function Toast({ message, visible, type = "success", onClose, duration = 4000 }: ToastProps) {
  if (!visible) return null;

  const typeStyles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    error: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300",
    warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300",
    info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300",
  };

  return (
    <div
      className={`
        fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg
        ${typeStyles[type]}
      `}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}