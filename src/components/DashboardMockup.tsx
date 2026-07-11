"use client";

import {
  Sparkles, Zap, BarChart3, Calendar,
  Brain, Target, Layers, Share2, Briefcase,
  CheckCircle2, ArrowUpRight, Cpu, Radio,
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
                 bg-[#090D16] border border-white/[0.08]
                 shadow-[0_24px_60px_rgba(6,182,212,0.12),inset_0_1px_1px_rgba(255,255,255,0.05)]
                 font-sans text-white/90"
    >
      {/* ── Browser Chrome Header ── */}
      <div className="flex items-center justify-between bg-[#0C1222] px-4 py-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80" />
        </div>
        
        {/* Dynamic Address Bar */}
        <div className="flex items-center gap-2 bg-[#121A30] border border-white/[0.04] rounded-md px-5 py-1 text-[10px] text-white/40 tracking-wide font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
          automarc.ai/app/dashboard
        </div>

        {/* Console Shortcut */}
        <div className="text-white/20 text-[9px] font-mono border border-white/[0.08] px-1.5 py-0.5 rounded bg-white/[0.02]">
          ⌘K
        </div>
      </div>

      {/* ── App Layout ── */}
      <div className="flex min-h-[380px]">

        {/* Sidebar */}
        <div className="hidden sm:flex flex-col gap-0.5 bg-[#070A12] border-r border-white/[0.06] px-2 py-4 w-[150px] shrink-0">
          
          {/* Active Brand Node */}
          <div className="px-3 pb-3 mb-2 border-b border-white/[0.06] flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-brand-secondary" />
              <p className="text-[11px] font-semibold text-white tracking-tight uppercase">Workspace 01</p>
            </div>
            <p className="text-[9px] text-white/30 font-mono tracking-wide">Status: Active</p>
          </div>

          {SIDEBAR.map(({ icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-semibold tracking-wide cursor-pointer transition-all duration-150
                ${active
                  ? "bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.03] border border-transparent"
                }`}
            >
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col gap-4 px-5 py-4">

          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div>
              <p className="text-xs font-semibold text-white tracking-tight uppercase flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-brand-secondary" />
                Automation Mission Control
              </p>
              <p className="text-[10px] text-white/30 font-mono mt-0.5">Core System: Idle</p>
            </div>
            <button className="flex items-center gap-1.5 bg-brand-secondary hover:bg-brand-secondary/90 text-[#090D16] text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all duration-150 shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-[#090D16]" />
              Generate Post
            </button>
          </div>

          {/* SVG Micro Chart (Beautiful visual metric representator) */}
          <div className="bg-[#0C1222] border border-white/[0.06] rounded-xl p-3.5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-2.5 right-3 text-[8px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1">
              <Radio className="w-3 h-3 text-brand-secondary" />
              Live performance graph
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">Automated Brand Reach</p>
              <p className="text-base font-bold text-white flex items-baseline gap-1">
                142.8k
                <span className="text-[9px] font-mono text-brand-secondary flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +12.4%
                </span>
              </p>
            </div>

            {/* Sparkline Graph */}
            <div className="h-12 w-full mt-3">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 50">
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Gradient area */}
                <path
                  d="M0,45 Q50,15 100,35 T200,20 T300,10 T400,5 L400,50 L0,50 Z"
                  fill="url(#chart-glow)"
                />
                {/* The main stroke */}
                <path
                  d="M0,45 Q50,15 100,35 T200,20 T300,10 T400,5"
                  fill="none"
                  stroke="rgb(6, 182, 212)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Glow Dot */}
                <circle cx="400" cy="5" r="3" fill="rgb(6, 182, 212)" />
                <circle cx="400" cy="5" r="7" fill="rgb(6, 182, 212)" className="animate-ping" style={{ transformOrigin: '400px 5px' }} />
              </svg>
            </div>
          </div>

          {/* Connected Platform status pills */}
          <div className="flex gap-2">
            {[
              { icon: <Share2 className="w-3.5 h-3.5" />, label: "Instagram Link", status: "Active", color: "#E1306C" },
              { icon: <Briefcase className="w-3.5 h-3.5" />, label: "LinkedIn Link", status: "Active", color: "#0077B5" },
            ].map(({ icon, label, status, color }) => (
              <div key={label}
                   className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg bg-[#0C1222] border border-white/[0.06] text-[10px]">
                <div className="flex items-center gap-2">
                  <span style={{ color }}>{icon}</span>
                  <span className="text-white/60 font-semibold">{label}</span>
                </div>
                <span className="text-[9px] font-mono text-brand-secondary border border-brand-secondary/20 bg-brand-secondary/5 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {status}
                </span>
              </div>
            ))}
          </div>

          {/* Modern list for Content Queue */}
          <div>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-brand-secondary" />
              Automated Posting Queue
            </p>
            
            <div className="rounded-xl border border-white/[0.06] bg-[#070A12] overflow-hidden">
              {[
                { title: "Dynamic Brand Story Carousel", platform: "Instagram", status: "Published", dot: "bg-brand-secondary" },
                { title: "SaaS Product Release Announcement", platform: "LinkedIn", status: "Scheduled", dot: "bg-amber-400" },
                { title: "Customer Success Case Study", platform: "Instagram", status: "Generating", dot: "bg-white/10" },
              ].map(({ title, platform, status, dot }, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-[10px] border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.01] transition-colors duration-150`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                  <span className="flex-1 font-semibold text-white/80 truncate">{title}</span>
                  <span className="text-white/30 font-mono text-[9px] shrink-0 uppercase tracking-wider">{platform}</span>
                  <span className="text-white/20 shrink-0 font-mono">/</span>
                  <span className="font-semibold text-white/40 shrink-0 uppercase tracking-wider text-[9px]">{status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
