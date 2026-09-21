import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Wrapper for screens that have not been migrated to the light design system yet.
 * They keep their original dark styling; this banner gives users a way back.
 */
export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="legacy-dark min-h-screen">
      <div className="flex h-10 items-center justify-between border-b border-white/10 bg-[#0d0d0d] px-4 text-xs text-white/60">
        <span>Legacy screen — being redesigned</span>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Overview
        </Link>
      </div>
      {children}
    </div>
  );
}
