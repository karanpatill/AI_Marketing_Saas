"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { IconButton } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

/** Dialog built on the native <dialog> element: focus trapping, Esc, and scroll lock come for free. */
export function Modal({ isOpen, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`w-full ${widths[size]} rounded-xl border border-line bg-surface p-0 text-ink shadow-3 backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]`}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
        <div>
          <h2 className="text-title text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-body-sm text-ink-3">{description}</p>}
        </div>
        <IconButton aria-label="Close" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">{children}</div>

      {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
    </dialog>
  );
}
