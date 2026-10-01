import React from 'react';
import { 
  Building, 
  BarChart3, 
  Image as ImageIcon, 
  Layers, 
  Video, 
  Archive, 
  Brain, 
  Calendar, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  org_id: string;
}

interface Org {
  id: string;
  name: string;
}

interface SidebarProps {
  activeTab: any;
  setActiveTab: (tab: any) => void;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  activeOrg: Org | null;
  dna: any;
  handleSignOut: () => void;
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  workspaces,
  activeWorkspace,
  setActiveWorkspace,
  activeOrg,
  dna,
  handleSignOut
}: SidebarProps) {
  
  const NavItem = ({ id, icon: Icon, label, badge }: any) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group ${
          isActive 
            ? "bg-white/10 text-white font-medium shadow-sm border border-white/10" 
            : "text-[#828282] hover:text-white hover:bg-white/5 border border-transparent font-medium"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#828282] group-hover:text-white"}`} />
          <span>{label}</span>
        </div>
        {badge && (
          <span className="text-[10px] bg-[#DEDBC8]/10 text-[#DEDBC8] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-[260px] flex flex-col bg-[#050505] border-r border-[#828282]/20 flex-shrink-0 z-40 relative hidden md:flex h-full">
      {/* Brand / Org Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#828282]/20">
        <div className="flex items-center gap-2 px-2 py-1.5 w-full bg-black border border-[#828282]/20 rounded-lg text-[#ffffff] font-medium text-xs hover:border-[#828282]/40 transition-colors cursor-pointer group">
          <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0">
            <Building className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-white/90 text-sm font-semibold tracking-tight">{dna?.brand_name || activeOrg?.name || "Automarc"}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#828282] group-hover:text-white transition-colors" />
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1 hide-scrollbar">
        
        <div className="px-3 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">Overview</div>
        <NavItem id="control" icon={BarChart3} label="Mission Control" />
        <NavItem id="campaigns" icon={Calendar} label="Content Calendar" />
        
        <div className="px-3 pt-6 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Creation Hub</div>
        <NavItem id="studio" icon={ImageIcon} label="Post Studio" badge="AI" />
        <NavItem id="carousel" icon={Layers} label="Carousel Studio" badge="AI" />
        <NavItem id="video" icon={Video} label="Video Studio" badge="AI" />
        
        <div className="px-3 pt-6 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Library</div>
        <NavItem id="assets" icon={Archive} label="Generated Assets" />
        <NavItem id="dna" icon={Brain} label="Brand DNA" />
      </nav>

      {/* Footer / User Actions */}
      <div className="p-4 border-t border-[#828282]/20 space-y-1">
        <NavItem id="settings" icon={Settings} label="Workspace Settings" />
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#828282] hover:text-red-400 hover:bg-red-500/10 transition-all font-medium"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
