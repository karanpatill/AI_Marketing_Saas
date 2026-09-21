import React from "react";
import { cn } from "@/lib/cn";
import { Card } from "./Card";

/** KPI tile: label, big number, optional delta/hint and icon. */
export function Stat({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "default" | "accent" | "success" | "warning";
  className?: string;
}) {
  const iconTone = {
    default: "bg-surface-2 text-ink-2",
    accent: "bg-accent-soft text-accent",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
  }[tone];

  return (
    <Card className={cn("flex items-start justify-between gap-4 p-5", className)}>
      <div className="min-w-0">
        <p className="text-label text-ink-3">{label}</p>
        <p className="mt-2 text-display tabular text-ink">{value}</p>
        {hint && <p className="mt-1 text-body-sm text-ink-3">{hint}</p>}
      </div>
      {icon && <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", iconTone)}>{icon}</span>}
    </Card>
  );
}
