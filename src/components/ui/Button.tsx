import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "tonal" | "icon-only";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium " +
  "transition-[background-color,box-shadow,color,border-color] duration-150 select-none " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-on hover:bg-accent-hover hover:shadow-1 active:shadow-none",
  tonal: "bg-accent-soft text-accent-ink hover:bg-accent-soft/70",
  secondary: "bg-surface-2 text-ink hover:bg-surface-3",
  outline: "border border-line-2 bg-surface text-ink hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger/90",
  "icon-only": "h-10 w-10 rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-body-sm",
  md: "h-10 px-5 text-body",
  lg: "h-12 px-6 text-body-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  leadingIcon,
  trailingIcon,
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], variant !== "icon-only" && sizes[size], className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leadingIcon}
      {children}
      {!isLoading && trailingIcon}
    </button>
  );
}

/** Square icon button for toolbars. Always pass `aria-label`. */
export function IconButton({
  className = "",
  size = "md",
  ...props
}: Omit<ButtonProps, "variant" | "leadingIcon" | "trailingIcon"> & { "aria-label": string }) {
  const dims = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  return <Button variant="icon-only" className={cn(dims, className)} {...props} />;
}

/** Class string for styling a non-button element (e.g. next/link) like a Button. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className = ""): string {
  return cn(base, variants[variant], variant !== "icon-only" && sizes[size], className);
}

/** Link that looks like a Button — avoids nesting <a> inside <button>. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  className?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
