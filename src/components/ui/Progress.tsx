import { cn } from "@/lib/cn";

export function Progress({ value, max = 100, className = "", tone = "accent" }: { value: number; max?: number; className?: string; tone?: "accent" | "success" | "warning" | "danger" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bar = { accent: "bg-accent", success: "bg-success", warning: "bg-warning", danger: "bg-danger" }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-3", className)} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={cn("h-full rounded-full transition-[width] duration-300", bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}
