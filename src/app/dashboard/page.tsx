"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Zap, BarChart3, Calendar,
  Brain, Target, Layers, Share2, Briefcase,
  CheckCircle2, ArrowUpRight, Cpu, Radio,
  Loader2, LogOut, ArrowRight, ShieldCheck,
  Tag, Compass, HelpCircle, Users, Eye, Flag,
} from "lucide-react";
import Navbar from "@/components/Navbar";

// --- Types ---
type BrandDna = {
  id: string;
  brand_name: string;
  website: string;
  industry: string;
  category: string;
  sub_category: string;
  business_description: string;
  
  mission: string;
  vision: string;
  usp: string;
  brand_personality: string;
  brand_values: string[];
  
  products: string[];
  services: string[];
  pricing: string;
  
  target_audience: string;
  customer_personas: string;
  country: string;
  languages: string[];
  
  competitors: string[];
  platforms: string[];
  main_goal: string;
  created_at: string;
};

const SIDEBAR = [
  { icon: <BarChart3 className="w-3.5 h-3.5" />, label: "Mission Control", active: true },
  { icon: <Brain className="w-3.5 h-3.5" />,     label: "Brand Memory",    active: false },
  { icon: <Sparkles className="w-3.5 h-3.5" />,  label: "AI Content",      active: false },
  { icon: <Target className="w-3.5 h-3.5" />,    label: "Competitors",     active: false },
  { icon: <Calendar className="w-3.5 h-3.5" />,  label: "Calendar",        active: false },
  { icon: <Layers className="w-3.5 h-3.5" />,    label: "Campaigns",       active: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const [dna, setDna] = useState<BrandDna | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the latest Brand DNA profile from Supabase
  useEffect(() => {
    async function fetchBrandDna() {
      try {
        const { supabase } = await import("@/lib/supabase");
        
        const { data, error } = await supabase
          .from("brand_dna")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching brand DNA:", error);
        } else if (data) {
          setDna(data);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBrandDna();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-secondary animate-spin" />
        <p className="text-xs text-gray-400 mt-2 font-mono">Loading Workspace Dashboard...</p>
      </div>
    );
  }

  // If no onboarding data exists, redirect to onboarding flow
  if (!dna) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary mx-auto">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Configure Brand DNA</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            You haven't completed the Brand DNA onboarding. Set up your marketing profile to unlock the AI dashboard.
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-dark hover:bg-brand-darkHover text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Start Setup
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col justify-between">
      
      {/* Dynamic Header */}
      <Navbar />

      {/* Main Workspace Grid */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-5 sm:px-8 lg:px-16 py-6 gap-6">
        
        {/* Left App Sidebar */}
        <aside className="hidden md:flex flex-col justify-between w-[220px] bg-white border border-gray-200/80 rounded-2xl p-4 shrink-0 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="space-y-4">
            
            {/* Active Brand Card */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Workspace</p>
              <h3 className="text-sm font-bold text-gray-900 truncate">{dna.brand_name}</h3>
              <p className="text-[9px] text-[#06B6D4] font-mono font-bold tracking-wide uppercase">{dna.industry}</p>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              {SIDEBAR.map(({ icon, label, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all
                    ${active
                      ? "bg-brand-dark text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                >
                  {icon}
                  <span>{label}</span>
                </div>
              ))}
            </nav>
          </div>

          {/* Reset profile */}
          <button
            onClick={() => router.push("/onboarding")}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Reset Brand DNA
          </button>
        </aside>

        {/* Right Dashboard Area */}
        <main className="flex-1 space-y-6">

          {/* Top Info Banner */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                {dna.brand_name} Brand DNA Dashboard
              </h2>
              <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
                <span><strong>Category:</strong> {dna.category}</span>
                {dna.sub_category && (
                  <>
                    <span>•</span>
                    <span><strong>Sub-category:</strong> {dna.sub_category}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold tracking-tight shrink-0 self-start sm:self-center">
              <ShieldCheck className="w-4 h-4" />
              Memory Synced
            </div>
          </div>

          {/* Detailed Info Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Box 1: Company Definition */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-secondary" />
                Company Definition
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-medium">Business Description</span>
                  <p className="text-gray-700 leading-relaxed">{dna.business_description}</p>
                </div>
                {dna.website && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-400">Website</span>
                    <a href={dna.website} target="_blank" rel="noreferrer" className="text-brand-secondary hover:underline font-semibold">{dna.website}</a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">USP (Unique Value)</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[200px]">{dna.usp}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Mission, Vision & Personality */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-secondary" />
                Brand Identity DNA
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-medium">Mission</span>
                  <p className="text-gray-700 font-medium">{dna.mission}</p>
                </div>
                {dna.vision && (
                  <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
                    <span className="text-gray-400 font-medium">Vision</span>
                    <p className="text-gray-700">{dna.vision}</p>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Brand Personality</span>
                  <span className="font-semibold text-gray-800 capitalize">{dna.brand_personality}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-gray-400">Core Brand Values</span>
                  <div className="flex flex-wrap gap-1">
                    {(dna.brand_values || []).map((v) => (
                      <span key={v} className="px-2 py-1 rounded bg-gray-50 border border-gray-200 text-[10px] text-gray-600 font-semibold">{v}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: Offerings & Pricing */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-brand-secondary" />
                Offerings & Commercials
              </h3>
              
              <div className="space-y-3 text-xs">
                {dna.products && dna.products.length > 0 && (
                  <div className="flex flex-col gap-1.5 border-b border-gray-100 pb-2">
                    <span className="text-gray-400">Products</span>
                    <div className="flex flex-wrap gap-1">
                      {dna.products.map(p => (
                        <span key={p} className="px-2 py-1 rounded bg-blue-50/50 border border-blue-100 text-[10px] text-blue-700 font-semibold">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {dna.services && dna.services.length > 0 && (
                  <div className="flex flex-col gap-1.5 border-b border-gray-100 pb-2">
                    <span className="text-gray-400">Services</span>
                    <div className="flex flex-wrap gap-1">
                      {dna.services.map(s => (
                        <span key={s} className="px-2 py-1 rounded bg-emerald-50/50 border border-emerald-100 text-[10px] text-emerald-700 font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Pricing Strategy</span>
                  <span className="font-semibold text-gray-800">{dna.pricing}</span>
                </div>
              </div>
            </div>

            {/* Box 4: Target Audience Profile */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-secondary" />
                Target Audience & Market
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-medium">Target Demographics</span>
                  <p className="text-gray-700">{dna.target_audience}</p>
                </div>
                {dna.customer_personas && (
                  <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
                    <span className="text-gray-400 font-medium">Customer Persona</span>
                    <p className="text-gray-600 italic leading-relaxed">{dna.customer_personas}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 block mb-1">Country Focus</span>
                    <span className="font-semibold text-gray-800">{dna.country}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Languages</span>
                    <span className="font-semibold text-gray-800">{(dna.languages || []).join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Micro Simulation queue */}
          <div className="bg-[#090D16] border border-white/[0.08] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            
            <div className="absolute top-4 right-4 text-[8px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#06B6D4]" />
              Simulation Monitor
            </div>

            <div className="border-b border-white/[0.06] pb-4 mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#06B6D4]" />
                  AI Content Generation
                </h3>
                <p className="text-[10px] text-white/30 font-mono mt-0.5">Workspace Node: {dna.brand_name}</p>
              </div>
              <button className="flex items-center gap-1 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-[#090D16] text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors">
                <Sparkles className="w-3.5 h-3.5 fill-[#090D16]" />
                Generate Campaign Post
              </button>
            </div>

            {/* Simulated reach metrics & active platform lists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex flex-col justify-between">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Automated Reach</p>
                <div className="flex items-baseline justify-between mt-2">
                  <p className="text-base font-bold">142.8k</p>
                  <span className="text-[9px] font-mono text-[#06B6D4] flex items-center gap-0.5 font-bold">
                    <ArrowUpRight className="w-2.5 h-2.5" /> +12.4%
                  </span>
                </div>
                <div className="h-5 w-full mt-3">
                  <svg className="w-full h-full" viewBox="0 0 100 20">
                    <path d="M0,18 Q20,5 40,15 T80,10 T100,5" fill="none" stroke="#06B6D4" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex flex-col justify-between">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Channels</p>
                <div className="flex items-baseline justify-between mt-2">
                  <p className="text-base font-bold">{(dna.platforms || []).length} API Linked</p>
                  <span className="text-[9px] font-mono text-[#06B6D4] font-bold">ONLINE</span>
                </div>
                <div className="flex gap-1.5 mt-4">
                  {(dna.platforms || []).map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded bg-white/[0.06] text-[8px] font-mono text-white/50 uppercase">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex flex-col justify-between">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Competitors Monitored</p>
                <div className="flex items-baseline justify-between mt-2">
                  <p className="text-base font-bold">{(dna.competitors || []).length} Active</p>
                  <span className="text-[9px] font-mono text-white/20">LIVE</span>
                </div>
                <div className="flex gap-1 mt-4 truncate max-w-full">
                  {(dna.competitors || []).map((c) => (
                    <span key={c} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[8px] font-mono text-white/30 truncate max-w-[80px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Posting Queue representation */}
            <div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#06B6D4]" />
                Brand Active Post Queue
              </p>
              
              <div className="rounded-xl border border-white/[0.06] bg-[#070A12] overflow-hidden">
                {[
                  { title: `${dna.brand_name} E-Commerce Showcase`, plat: "Instagram", type: "Carousel", status: "Published", dot: "bg-[#06B6D4]" },
                  { title: `${dna.industry} Insights & Tips`, plat: "LinkedIn", type: "Post", status: "Scheduled", dot: "bg-amber-400" },
                  { title: `AUTOPILOT: Promotional Video Content`, plat: "Instagram", type: "Reel", status: "Generating", dot: "bg-white/10" },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-4 py-3 text-[10px] border-b border-white/[0.04] last:border-b-0">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.dot}`} />
                    <span className="flex-1 font-semibold text-white/80 truncate">{row.title}</span>
                    <span className="text-white/30 font-mono text-[9px] shrink-0 uppercase tracking-wider">{row.plat}</span>
                    <span className="text-white/20 shrink-0">/</span>
                    <span className="text-white/30 shrink-0">{row.type}</span>
                    <span className="text-white/20 shrink-0">/</span>
                    <span className="font-semibold text-white/40 shrink-0 uppercase tracking-wider text-[9px]">{row.status}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>

      </div>

      {/* GDPR Footer */}
      <footer className="px-6 py-4 text-center border-t border-gray-100 bg-white">
        <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1 font-semibold uppercase tracking-wider">
          Secure 256-bit encryption · GDPR & DPDP compliant
        </p>
      </footer>

    </div>
  );
}
