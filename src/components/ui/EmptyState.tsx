import React from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      {icon && <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-3">{icon}</span>}
      <h3 className="text-title-sm text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-body-sm text-ink-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
