import React from "react";

/** Standard page title row: title + description on the left, actions on the right. */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-label text-ink-3">{eyebrow}</div>}
        <h1 className="text-display text-ink">{title}</h1>
        {description && <p className="mt-1 text-body text-ink-3">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
