"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_SECTIONS } from "./nav";
import { Badge } from "@/components/ui/Badge";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || "";
  const search = useSearchParams();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-topbar items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-on">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
              <path d="M12 3 4 20h3.2l1.6-3.6h6.4L16.8 20H20L12 3Zm0 6.2 2.1 4.8H9.9L12 9.2Z" fill="currentColor" />
            </svg>
          </span>
          <span className="text-title-sm tracking-tight text-ink">Automarc</span>
        </Link>
      </div>

      {/* Primary action */}
      <div className="px-4 pb-2 pt-1">
        <Link
          href="/dashboard/legacy?tab=studio"
          onClick={onNavigate}
          className="inline-flex h-11 w-full items-center gap-3 rounded-lg bg-accent-soft px-4 text-body font-medium text-accent-ink shadow-none transition hover:shadow-1"
        >
          <Plus className="h-5 w-5" />
          Create post
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
        {NAV_SECTIONS.map((section, i) => (
          <div key={i} className={cn(i > 0 && "mt-4")}>
            {section.title && <p className="px-3 pb-1 pt-2 text-label text-ink-3">{section.title}</p>}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.match ? item.match(pathname, search) : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex h-10 items-center gap-3 rounded-full px-3 text-body transition-colors",
                        active ? "bg-accent-soft font-medium text-accent-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", active ? "text-accent" : "text-ink-3 group-hover:text-ink-2")} />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant="outline" className="ml-auto h-5 px-2">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
