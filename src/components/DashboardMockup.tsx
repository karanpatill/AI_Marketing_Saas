"use client";

import {
  Sparkles, Zap, BarChart3, Calendar,
  Brain, Target, Layers, Share2, Briefcase,
  ArrowUpRight, Cpu, Radio,
} from "lucide-react";

const SIDEBAR = [
  { icon: <BarChart3 className="w-3.5 h-3.5" />, label: "Mission Control", active: false },
  { icon: <Brain className="w-3.5 h-3.5" />,     label: "Brand Memory",    active: false },
  { icon: <Sparkles className="w-3.5 h-3.5" />,  label: "AI Content",      active: true  },
  { icon: <Target className="w-3.5 h-3.5" />,    label: "Competitors",     active: false },
  { icon: <Calendar className="w-3.5 h-3.5" />,  label: "Calendar",        active: false },
  { icon: <Layers className="w-3.5 h-3.5" />,    label: "Campaigns",       active: false },
];

export default function DashboardMockup() {
  return (
    <div
      className="animate-hero-rise [animation-delay:400ms]
                 w-full rounded-2xl overflow-hidden
                 bg-[#101010] border border-[#E1E0CC]/10
                 shadow-2xl font-sans text-[#E1E0CC]"
    >
      {/* ── Browser Chrome Header ── */}
      <div className="flex items-center justify-between bg-[#000000] px-4 py-3 border-b border-[#E1E0CC]/10">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E1E0CC]/10/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E1E0CC]/10/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E1E0CC]/10/60" />
        </div>
        
        {/* Address Bar */}
        <div className="flex items-center gap-2 bg-[#212121] border border-[#E1E0CC]/10 rounded-md px-5 py-1 text-[10px] text-[#E1E0CC]/50 tracking-wide font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DEDBC8] animate-pulse" />
          automarc.ai/app/dashboard
        </div>

        {/* Shortcut */}
        <div className="text-[#E1E0CC]/30 text-[9px] font-mono border border-[#E1E0CC]/10 px-1.5 py-0.5 rounded bg-[#212121]">
          ⌘K
        </div>
      </div>

      {/* ── App Layout ── */}
      <div className="flex min-h-[380px]">

        {/* Sidebar */}
        <div className="hidden sm:flex flex-col gap-0.5 bg-[#000000] border-r border-[#E1E0CC]/10 px-2 py-4 w-[150px] shrink-0">
          
          {/* Active Workspace Node */}
          <div className="px-3 pb-3 mb-2 border-b border-[#E1E0CC]/10 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-[#DEDBC8]" />
              <p className="text-[11px] font-medium text-[#E1E0CC] tracking-tight uppercase">Workspace 01</p>
            </div>
            <p className="text-[9px] text-[#E1E0CC]/40 font-mono tracking-wide">Status: Active</p>
          </div>

          {SIDEBAR.map(({ icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[10px] font-medium tracking-wide cursor-pointer transition-all duration-150
                ${active
                  ? "bg-[#212121] text-[#E1E0CC] border border-[#E1E0CC]/20"
                  : "text-[#E1E0CC]/60 hover:text-[#E1E0CC] hover:bg-white/5 border border-transparent"
                }`}
            >
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col gap-4 px-5 py-4 bg-[#101010]">

          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-[#E1E0CC]/10 pb-3">
            <div>
              <p className="text-xs font-medium text-[#E1E0CC] tracking-tight uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#DEDBC8]" />
                Automation Mission Control
              </p>
              <p className="text-[10px] text-[#E1E0CC]/40 font-mono mt-0.5">Core System: Active</p>
            </div>
            <button className="flex items-center gap-1.5 bg-[#DEDBC8] hover:bg-[#E1E0CC] text-black text-[10px] font-medium px-3.5 py-1.5 rounded-full transition-colors shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              Generate Post
            </button>
          </div>

          {/* Micro Chart Card */}
          <div className="bg-[#212121] border border-[#E1E0CC]/10 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-2.5 right-3 text-[8px] font-mono text-[#E1E0CC]/40 uppercase tracking-widest flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#E1E0CC]/70" />
              Live Performance Graph
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] text-[#E1E0CC]/60 uppercase font-medium tracking-wider">Automated Brand Reach</p>
              <p className="text-base font-bold text-[#E1E0CC] tabular-nums flex items-baseline gap-1.5">
                142.8k
                <span className="text-[9px] font-mono text-[#E1E0CC]/70 flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +12.4%
                </span>
              </p>
            </div>

            {/* Sparkline Graph */}
            <div className="h-12 w-full mt-3">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 50">
                <defs>
                  <linearGradient id="prisma-chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DEDBC8" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#DEDBC8" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                <path
                  d="M0,45 Q50,15 100,35 T200,20 T300,10 T400,5 L400,50 L0,50 Z"
                  fill="url(#prisma-chart-glow)"
                />
                <path
                  d="M0,45 Q50,15 100,35 T200,20 T300,10 T400,5"
                  fill="none"
                  stroke="#DEDBC8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="400" cy="5" r="3" fill="#DEDBC8" />
              </svg>
            </div>
          </div>

          {/* Connected Platform Status Pills */}
          <div className="flex gap-2">
            {[
              { icon: <Share2 className="w-3.5 h-3.5" />, label: "Instagram Link", status: "Active" },
              { icon: <Briefcase className="w-3.5 h-3.5" />, label: "LinkedIn Link", status: "Active" },
            ].map(({ icon, label, status }) => (
              <div key={label}
                   className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-[#212121] border border-[#E1E0CC]/10 text-[10px]">
                <div className="flex items-center gap-2 text-[#E1E0CC]/80">
                  <span>{icon}</span>
                  <span className="font-medium">{label}</span>
                </div>
                <span className="text-[9px] font-mono text-[#E1E0CC]/70 bg-[#E1E0CC]/10/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {status}
                </span>
              </div>
            ))}
          </div>

          {/* Automated Posting Queue */}
          <div>
            <p className="text-[9px] font-mono text-[#E1E0CC]/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#DEDBC8]" />
              Automated Posting Queue
            </p>
            
            <div className="rounded-2xl border border-[#E1E0CC]/10 bg-[#212121] overflow-hidden">
              {[
                { title: "Dynamic Brand Story Carousel", platform: "Instagram", status: "Published", dot: "bg-[#E1E0CC]/10" },
                { title: "SaaS Product Release Announcement", platform: "LinkedIn", status: "Scheduled", dot: "bg-[#DEDBC8]" },
                { title: "Customer Success Case Study", platform: "Instagram", status: "Generating", dot: "bg-[#E1E0CC]/40 animate-pulse" },
              ].map(({ title, platform, status, dot }, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-2.5 text-[10px] border-b border-[#E1E0CC]/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                  <span className="flex-1 font-medium text-[#E1E0CC] truncate">{title}</span>
                  <span className="text-[#E1E0CC]/40 font-mono text-[9px] shrink-0 uppercase tracking-wider">{platform}</span>
                  <span className="text-[#E1E0CC]/20 shrink-0 font-mono">/</span>
                  <span className="font-medium text-[#E1E0CC]/60 shrink-0 uppercase tracking-wider text-[9px]">{status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
