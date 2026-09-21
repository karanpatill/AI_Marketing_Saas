import React from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "success" | "warning" | "error" | "info" | "outline" | "accent";

const variants: Record<Variant, string> = {
  default: "bg-surface-2 text-ink-2",
  accent: "bg-accent-soft text-accent-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  outline: "border border-line-2 text-ink-2",
};

export function Badge({
  children,
  variant = "default",
  className = "",
  dot,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-label whitespace-nowrap",
        variants[variant],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
