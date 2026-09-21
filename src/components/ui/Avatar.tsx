import { cn } from "@/lib/cn";

const sizes = { sm: "h-7 w-7 text-[11px]", md: "h-9 w-9 text-body-sm", lg: "h-12 w-12 text-body" };

/** Image avatar with initials fallback. Deterministic tint from the name so lists stay scannable. */
export function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: {
  src?: string | null;
  name?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const initials = (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
  const hue = (name || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name || ""} className={cn("shrink-0 rounded-full object-cover", sizes[size], className)} />;
  }
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white", sizes[size], className)}
      style={{ backgroundColor: `hsl(${hue} 45% 45%)` }}
      aria-label={name || undefined}
    >
      {initials}
    </span>
  );
}
