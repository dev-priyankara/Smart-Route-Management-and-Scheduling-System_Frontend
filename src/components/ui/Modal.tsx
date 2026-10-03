"use client";

import { Fragment, ReactNode } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, title, subtitle, onClose, children, className = "", size = "md" }: ModalProps) {
  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-5xl",
  };

  return createPortal(
    <Fragment>
      <div
        className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${sizeClasses[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className={`w-full max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <h3 id="modal-title" className="text-lg font-semibold text-[var(--text-primary)]">
                {title}
              </h3>
              {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] hover:bg-[var(--soft)]"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </Fragment>,
    document.body
  );
}