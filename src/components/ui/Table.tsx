import React from "react";
import { cn } from "@/lib/cn";

export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-auto rounded-lg border border-line bg-surface", className)}>
      <table className="w-full text-left text-body">{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-line bg-surface-2/60 text-label text-ink-3">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-line text-ink">{children}</tbody>;
}

export function TableRow({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr onClick={onClick} className={cn("transition-colors hover:bg-surface-2/60", onClick && "cursor-pointer", className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("h-11 px-4 font-medium", className)}>{children}</th>;
}

export function TableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("h-13 px-4 py-3 align-middle", className)}>{children}</td>;
}
