import React from 'react';
import { Brain, ChevronDown, Bell } from 'lucide-react';
import TokenCounter from '@/components/TokenCounter';

interface Model {
  id: string;
  name: string;
  status: string;
}

interface HeaderProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: Model[];
  activeOrg: any;
  userName: string;
  userAvatar: string | null;
  notifications: any[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  activeWorkspace: any;
  workspaces: any[];
  setActiveWorkspace: (ws: any) => void;
}

export function DashboardHeader({
  selectedModel,
  setSelectedModel,
  availableModels,
  activeOrg,
  userName,
  userAvatar,
  notifications,
  showNotifications,
  setShowNotifications,
  activeWorkspace,
  workspaces,
  setActiveWorkspace
}: HeaderProps) {
  
  return (
    <header className="h-16 border-b border-[#828282]/20 flex items-center justify-between px-4 sm:px-6 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
      
      {/* Left side: Context (Workspace Switcher & Mobile Nav placeholder) */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle would go here */}
        
        <div className="flex items-center gap-2">
          {/* Workspace Switcher */}
          <div className="relative flex items-center">
            <select
              value={activeWorkspace?.id || ""}
              onChange={(e) => {
                const ws = workspaces.find(w => w.id === e.target.value);
                if (ws) setActiveWorkspace(ws);
              }}
              className="bg-black/40 border border-[#828282]/30 rounded-md px-3 py-1.5 text-xs font-semibold text-[#ffffff]/90 outline-none cursor-pointer hover:bg-white/5 transition-all appearance-none pr-8 shadow-sm"
            >
              {workspaces
                .filter(w => w.org_id === activeOrg?.id)
                .map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#828282] absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Right side: Global Actions (Model, Tokens, Notifications, Profile) */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Model Switcher */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-[#828282]/30 rounded-md hover:bg-white/5 transition-all shadow-sm">
          <Brain className="w-3.5 h-3.5 text-[#DEDBC8]" />
          <div className="relative flex items-center">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="min-w-[130px] pr-6 bg-transparent border-none text-[11px] font-bold text-[#ffffff]/90 outline-none cursor-pointer appearance-none uppercase tracking-wider"
            >
              {availableModels.map(m => (
                <option key={m.id} value={m.id} disabled={m.status === "high_demand"} className="bg-[#101010] text-[#ffffff]">
                  {m.name} {m.status === "high_demand" ? "(High Demand)" : ""}
                </option>
              ))}
              {availableModels.length === 0 && (
                <option value="gemini-3.5-flash" className="bg-[#101010] text-[#ffffff]">Gemini 3.5 Flash</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#828282] absolute right-0 pointer-events-none" />
          </div>
        </div>

        {/* Tokens */}
        {activeOrg?.id && <TokenCounter orgId={activeOrg.id} />}

        <div className="w-px h-6 bg-[#828282]/20 mx-1 hidden sm:block"></div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-[#828282] hover:text-white transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {notifications.filter((n) => !n.is_read).length > 0 && (
              <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-black" />
            )}
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          {userAvatar ? (
            <img src={userAvatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-[#828282]/30 shadow-sm" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#DEDBC8]/40 to-[#DEDBC8]/10 border border-[#DEDBC8]/30 flex items-center justify-center text-white font-bold text-xs">
              {userName?.charAt(0) || "U"}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
