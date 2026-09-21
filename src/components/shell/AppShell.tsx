"use client";

import { Suspense, useState } from "react";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { IconButton } from "@/components/ui/Button";
import type { ShellUser, ShellWorkspace } from "./types";

export function AppShell({
  user,
  workspaces,
  activeWorkspaceId,
  children,
}: {
  user: ShellUser;
  workspaces: ShellWorkspace[];
  activeWorkspaceId?: string;
  children: React.ReactNode;
}) {
  // The drawer closes via Sidebar's onNavigate callback, so no route-change effect is needed.
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar border-r border-line bg-canvas md:block">
        <Suspense>
          <Sidebar />
        </Suspense>
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-surface shadow-3 animate-fade-up">
            <div className="absolute right-2 top-3">
              <IconButton aria-label="Close navigation" onClick={() => setMenuOpen(false)}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <Suspense>
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </Suspense>
          </aside>
        </div>
      )}

      <div className="md:pl-sidebar">
        <Topbar user={user} workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-content px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
