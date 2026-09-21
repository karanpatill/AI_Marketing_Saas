import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Fingerprint,
  CalendarDays,
  Sparkles,
  Layers,
  Clapperboard,
  FolderOpen,
  Plug,
  Users,
  CreditCard,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Pattern used to mark the item active; defaults to `href`. */
  match?: (pathname: string, search: URLSearchParams) => boolean;
  badge?: string;
};

export type NavSection = { title?: string; items: NavItem[] };

const legacyTab = (tab: string) => (pathname: string, search: URLSearchParams) =>
  pathname === "/dashboard/legacy" && search.get("tab") === tab && !search.get("settingsTab");
const legacySettings = (tab: string) => (pathname: string, search: URLSearchParams) =>
  pathname === "/dashboard/legacy" && search.get("settingsTab") === tab;

/**
 * Sidebar structure. Items still pointing at /dashboard/legacy are screens that have not been
 * migrated to the new design system yet; change the href here when each one lands.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard, match: (p) => p === "/dashboard" }],
  },
  {
    title: "Brand",
    items: [
      { label: "Brand DNA", href: "/dashboard/legacy?tab=dna", icon: Fingerprint, match: legacyTab("dna") },
      { label: "Assets", href: "/dashboard/legacy?tab=assets", icon: FolderOpen, match: legacyTab("assets") },
    ],
  },
  {
    title: "Create",
    items: [
      { label: "Calendar", href: "/dashboard/legacy?tab=campaigns", icon: CalendarDays, match: legacyTab("campaigns") },
      { label: "Post Studio", href: "/dashboard/legacy?tab=studio", icon: Sparkles, match: legacyTab("studio") },
      { label: "Carousel Studio", href: "/dashboard/legacy?tab=carousel", icon: Layers, match: legacyTab("carousel") },
      { label: "Video Studio", href: "/dashboard/legacy?tab=video", icon: Clapperboard, match: legacyTab("video"), badge: "Beta" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Integrations", href: "/dashboard/legacy?settingsTab=integrations", icon: Plug, match: legacySettings("integrations") },
      { label: "Team", href: "/dashboard/legacy?settingsTab=team", icon: Users, match: legacySettings("team") },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { label: "Settings", href: "/dashboard/legacy?settingsTab=profile", icon: Settings, match: legacySettings("profile") },
    ],
  },
];
