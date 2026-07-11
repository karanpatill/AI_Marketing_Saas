// Original geometric logo mark — custom design, zero IP conflict
// Uses currentColor so it inherits text color automatically
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Automarc logo"
    >
      {/* "A" mark — two converging lines forming an automation arrow */}
      <rect x="0"  y="0"  width="18" height="18" rx="4" fill="currentColor" />
      <rect x="22" y="0"  width="18" height="18" rx="4" fill="currentColor" opacity="0.6" />
      <rect x="0"  y="22" width="18" height="18" rx="4" fill="currentColor" opacity="0.4" />
      <rect x="22" y="22" width="18" height="18" rx="4" fill="currentColor" opacity="0.8" />
    </svg>
  );
}
