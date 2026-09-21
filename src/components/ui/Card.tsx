import React from "react";
import { cn } from "@/lib/cn";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

/** Surface container. Hairline border, no shadow by default — elevation is reserved for floating UI. */
export function Card({ children, className = "", ...props }: DivProps) {
  return (
    <div className={cn("rounded-lg border border-line bg-surface", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: DivProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-6 pt-5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-title-sm text-ink", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-0.5 text-body-sm text-ink-3", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }: DivProps) {
  return (
    <div className={cn("px-6 pb-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }: DivProps) {
  return (
    <div className={cn("flex items-center justify-end gap-2 border-t border-line px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}
