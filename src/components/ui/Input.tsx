"use client";

import React, { useId } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label?: string;
  error?: string;
  helperText?: string;
}

const fieldBase =
  "w-full rounded-sm border bg-surface px-3.5 text-body text-ink placeholder:text-ink-4 " +
  "transition-[border-color,box-shadow] duration-150 " +
  "hover:border-line-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 " +
  "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3";

function FieldShell({
  id,
  label,
  error,
  helperText,
  children,
}: FieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-label text-ink-2">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-body-sm text-danger" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-body-sm text-ink-3">{helperText}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, FieldProps {
  leadingIcon?: React.ReactNode;
}

export function Input({ label, error, helperText, className = "", id, leadingIcon, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <FieldShell id={inputId} label={label} error={error} helperText={helperText}>
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-3">
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={!!error || undefined}
          className={cn(fieldBase, "h-10", error ? "border-danger" : "border-line", leadingIcon ? "pl-10" : undefined, className)}
          {...props}
        />
      </div>
    </FieldShell>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <FieldShell id={inputId} label={label} error={error} helperText={helperText}>
      <textarea
        id={inputId}
        aria-invalid={!!error || undefined}
        className={cn(fieldBase, "min-h-[96px] resize-y py-2.5 leading-relaxed", error ? "border-danger" : "border-line", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  error,
  helperText,
  className = "",
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & FieldProps) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <FieldShell id={inputId} label={label} error={error} helperText={helperText}>
      <select
        id={inputId}
        className={cn(fieldBase, "h-10 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22%23747775%22 viewBox=%220 0 16 16%22><path d=%22M4.5 6l3.5 3.5L11.5 6%22 stroke=%22%23747775%22 stroke-width=%221.5%22 fill=%22none%22/></svg>')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-10", error ? "border-danger" : "border-line", className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
