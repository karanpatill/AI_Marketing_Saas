"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Search, Settings, User as UserIcon, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";
import type { ShellUser, ShellWorkspace } from "./types";

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

function WorkspaceSwitcher({ workspaces, activeId }: { workspaces: ShellWorkspace[]; activeId?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  // The page-level `?workspaceId=` wins over the server default so the switcher and content agree.
  const urlWorkspaceId = useSearchParams().get("workspaceId");
  const active = workspaces.find((w) => w.id === (urlWorkspaceId || activeId)) ?? workspaces[0];

  if (!active) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface pl-1.5 pr-3 text-body text-ink transition hover:bg-surface-2"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-[11px] font-medium text-accent-ink">
          {active.name.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[160px] truncate font-medium">{active.name}</span>
        <ChevronDown className="h-4 w-4 text-ink-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-40 w-72 overflow-hidden rounded-lg border border-line bg-surface p-1.5 shadow-3">
          <p className="px-3 pb-1 pt-2 text-label text-ink-3">Workspaces</p>
          <ul role="listbox">
            {workspaces.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/dashboard?workspaceId=${w.id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-body hover:bg-surface-2",
                    w.id === active.id ? "text-ink" : "text-ink-2"
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-3 text-[11px] font-medium text-ink-2">
                    {w.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{w.name}</span>
                    {w.orgName && <span className="block truncate text-body-sm text-ink-3">{w.orgName}</span>}
                  </span>
                  {w.id === active.id && <Check className="h-4 w-4 text-accent" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function UserMenu({ user }: { user: ShellUser }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const router = useRouter();

  const signOut = async () => {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full ring-offset-2 transition hover:ring-2 hover:ring-line-2"
      >
        <Avatar src={user.avatarUrl} name={user.name} size="md" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-11 z-40 w-64 overflow-hidden rounded-lg border border-line bg-surface shadow-3">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Avatar src={user.avatarUrl} name={user.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-ink">{user.name}</p>
              <p className="truncate text-body-sm text-ink-3">{user.email}</p>
            </div>
          </div>
          <div className="p-1.5">
            <Link href="/dashboard/legacy?settingsTab=profile" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2 text-body text-ink-2 hover:bg-surface-2 hover:text-ink">
              <UserIcon className="h-4 w-4" /> Profile
            </Link>
            <Link href="/dashboard/legacy?settingsTab=workspace" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2 text-body text-ink-2 hover:bg-surface-2 hover:text-ink">
              <Settings className="h-4 w-4" /> Workspace settings
            </Link>
            <button type="button" role="menuitem" onClick={signOut} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-body text-ink-2 hover:bg-surface-2 hover:text-ink">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Topbar({
  user,
  workspaces,
  activeWorkspaceId,
  onOpenMenu,
}: {
  user: ShellUser;
  workspaces: ShellWorkspace[];
  activeWorkspaceId?: string;
  onOpenMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-topbar items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur md:px-6">
      <IconButton aria-label="Open navigation" className="md:hidden" onClick={onOpenMenu}>
        <Menu className="h-5 w-5" />
      </IconButton>

      <Suspense>
        <WorkspaceSwitcher workspaces={workspaces} activeId={activeWorkspaceId} />
      </Suspense>

      {/* Search */}
      <div className="mx-auto hidden w-full max-w-xl md:block">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            placeholder="Search posts, campaigns, assets"
            className="h-11 w-full rounded-full border border-transparent bg-surface-2 pl-11 pr-4 text-body text-ink placeholder:text-ink-3 transition focus:border-line focus:bg-surface focus:shadow-1 focus:outline-none"
          />
        </label>
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <IconButton aria-label="Help">
          <HelpCircle className="h-5 w-5" />
        </IconButton>
        <IconButton aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </IconButton>
        <div className="ml-1">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
