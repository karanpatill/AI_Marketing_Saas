"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Zap, BarChart3, Calendar,
  Brain, Target, Layers, Share2, Briefcase,
  CheckCircle2, ArrowUpRight, Cpu, Radio,
  Loader2, LogOut, ArrowRight, ShieldCheck,
  Tag, Compass, HelpCircle, Users, Eye, Flag,
  Building, Image, FileText, Video, Plus,
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
  approved_moodboard: any;
};

// --- Brand Assets Type ---
type BrandAssets = {
  id: string;
  brand_dna_id: string;
  logo_url: string;
  product_images: string[];
  team_photos: string[];
  office_images: string[];
  brand_videos: string[];
  fonts: string[];
  icons: string[];
  brand_guidelines: string;
  logo_studio_data: any;
};

export default function DashboardPage() {
  const router = useRouter();
  const [dna, setDna] = useState<BrandDna | null>(null);
  const [assets, setAssets] = useState<BrandAssets | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"control" | "dna" | "campaigns" | "mix">("control");

  // Dynamic Lists for Strategy, Calendar & Mix
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [contentMix, setContentMix] = useState<any[]>([]);
  
  // Modal & Generation States
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignType, setCampaignType] = useState("Product Launch");
  const [campaignDesc, setCampaignDesc] = useState("");
  const [campaignPlatforms, setCampaignPlatforms] = useState<string[]>([]);
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<any | null>(null);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [generatingAssetId, setGeneratingAssetId] = useState<string | null>(null);
  const [videoTimer, setVideoTimer] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoTimer((prev) => {
          if (prev >= 30) return 0;
          return prev + 1;
        });
      }, 1000);
    } else {
      setVideoTimer(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVideoPlaying]);

  const getActiveSubtitleText = () => {
    if (!viewingAsset || viewingAsset.post_type !== "video") return "";
    const timings = viewingAsset.generated_assets?.script?.timings || [];
    if (timings.length === 0) return "";
    const active = timings.find((t: any) => {
      const match = t.time.match(/(\d+)s\s*-\s*(\d+)s/);
      if (match) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        return videoTimer >= start && videoTimer <= end;
      }
      return false;
    });
    return active ? active.subtitles : timings[0]?.subtitles || "";
  };

  // Helper to trigger refetches of dynamic tables
  const reloadDynamicData = async (dnaId: string) => {
    try {
      const campaignsRes = await fetch(`/api/campaigns?brandDnaId=${dnaId}`);
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());

      const calendarRes = await fetch(`/api/strategy?brandDnaId=${dnaId}`);
      if (calendarRes.ok) setCalendar(await calendarRes.json());

      const mixRes = await fetch(`/api/content-mix?brandDnaId=${dnaId}`);
      if (mixRes.ok) setContentMix(await mixRes.json());
    } catch (err) {
      console.error("Failed to reload strategy details", err);
    }
  };

  // Fetch latest DNA & Assets from Supabase
  useEffect(() => {
    async function fetchWorkspaceData() {
      try {
        const { supabase } = await import("@/lib/supabase");
        
        const { data: dnaData, error: dnaError } = await supabase
          .from("brand_dna")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (dnaError) {
          console.error("Error fetching brand DNA:", dnaError);
          setLoading(false);
          return;
        }

        if (dnaData) {
          setDna(dnaData);

          // Fetch assets linked to this DNA profile
          const { data: assetsData, error: assetsError } = await supabase
            .from("brand_assets")
            .select("*")
            .eq("brand_dna_id", dnaData.id)
            .maybeSingle();

          if (assetsError) {
            console.error("Error fetching brand assets:", assetsError);
          } else if (assetsData) {
            setAssets(assetsData);
          }

          // Trigger content and campaign fetches
          await reloadDynamicData(dnaData.id);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspaceData();
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

  // --- Parse approved moodboard if exists ---
  let moodboard: any = null;
  if (dna.approved_moodboard) {
    try {
      moodboard = typeof dna.approved_moodboard === "string" 
        ? JSON.parse(dna.approved_moodboard) 
        : dna.approved_moodboard;
    } catch (e) {
      console.error("Failed to parse approved moodboard", e);
    }
  }

  // --- Dynamic Color System ---
  const colors = assets?.logo_studio_data?.colors || (moodboard ? {
    primaryHex: moodboard.palette[0]?.hex || "#0D0D0D",
    secondaryHex: moodboard.palette[1]?.hex || "#C9A84C",
    primaryRgb: "13, 13, 13",
    secondaryRgb: "201, 168, 76",
    primaryCmyk: "70%, 50%, 0%, 95%",
    pantoneApprox: "Pantone Neutral Black"
  } : {
    primaryHex: "#0F172A",
    secondaryHex: "#06B6D4",
    primaryRgb: "15, 23, 42",
    secondaryRgb: "6, 182, 212",
    primaryCmyk: "64%, 45%, 0%, 84%",
    pantoneApprox: "Pantone 2965 C"
  });

  const typography = assets?.logo_studio_data?.typography || (moodboard ? {
    primaryFont: moodboard.typography?.headline || "Playfair Display",
    bodyFont: moodboard.typography?.body || "Cormorant Garamond",
    usage: `Use ${moodboard.typography?.headline || 'Playfair Display'} for headings and ${moodboard.typography?.body || 'Cormorant Garamond'} for body text.`
  } : {
    primaryFont: "Outfit",
    bodyFont: "Inter",
    usage: "Use Outfit for display headers, Inter for general text."
  });

  // --- Fallback Mood Images based on style ---
  const getStyleImages = (styleId: string) => {
    switch (styleId) {
      case "luxury":
        return [
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80",
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80"
        ];
      case "minimal":
        return [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80",
          "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80",
          "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=400&q=80"
        ];
      case "premium":
        return [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
          "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80",
          "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80"
        ];
      case "scandinavian":
        return [
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
          "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80",
          "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80",
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&q=80"
        ];
      default:
        return [
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
          "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80"
        ];
    }
  };

  const baseMoodImages = getStyleImages(moodboard?.id || "default");

  // Blend uploaded images into moodboard grid if they exist
  const moodImages = [
    assets?.office_images?.[0] || baseMoodImages[0],
    assets?.product_images?.[0] || baseMoodImages[1],
    assets?.team_photos?.[0] || baseMoodImages[2],
    assets?.office_images?.[1] || baseMoodImages[3]
  ];

  // Imagery Direction row (up to 5 images)
  const imageryDirection = [
    ...(assets?.product_images || []),
    ...(assets?.team_photos || []),
    ...(assets?.office_images || [])
  ].slice(0, 5);

  // If no uploaded imagery direction, use baseMoodImages as placeholders
  const activeImageryList = imageryDirection.length > 0 ? imageryDirection : baseMoodImages;

  const gradients = moodboard ? [
    { name: "Primary Gradient", style: moodboard.gradient },
    { name: "Accent Gradient", style: moodboard.accentGradient },
    { name: "Silk Soft", style: `linear-gradient(135deg, ${colors.primaryHex} 0%, #111827 100%)` },
    { name: "Gold Leather", style: `linear-gradient(135deg, ${colors.secondaryHex} 0%, #374151 100%)` }
  ] : [
    { name: "Primary Gradient", style: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" },
    { name: "Accent Gradient", style: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)" },
    { name: "Silk Soft", style: "linear-gradient(135deg, #0F172A 0%, #111827 100%)" },
    { name: "Gold Leather", style: "linear-gradient(135deg, #06B6D4 0%, #374151 100%)" }
  ];

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col justify-between">
      
      {/* Dynamic Header */}
      <Navbar />

      {/* Main Workspace Grid */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left App Sidebar */}
        <aside className="hidden md:flex flex-col justify-between w-[220px] bg-white border border-gray-200/80 rounded-2xl p-4 shrink-0 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="space-y-4">
            
            {/* Active Brand Card */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3">
              {assets?.logo_url ? (
                <img src={assets.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white border border-gray-200 p-0.5 shrink-0" />
              ) : assets?.logo_studio_data?.assets?.faviconSvg ? (
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center p-1 shrink-0" dangerouslySetInnerHTML={{ __html: assets.logo_studio_data.assets.faviconSvg }} />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4] shrink-0 font-bold text-xs uppercase">
                  {dna.brand_name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Active Brand</p>
                <h3 className="text-xs font-bold text-gray-900 truncate leading-tight">{dna.brand_name}</h3>
                <p className="text-[8px] text-[#06B6D4] font-mono font-bold tracking-wide uppercase truncate mt-0.5">{dna.industry}</p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("control")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "control"
                    ? "bg-brand-dark text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Mission Control</span>
              </button>

              <button
                onClick={() => setActiveTab("dna")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "dna"
                    ? "bg-brand-dark text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Brand DNA Details</span>
              </button>

              <button
                onClick={() => setActiveTab("campaigns")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "campaigns"
                    ? "bg-brand-dark text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Campaigns & Calendar</span>
              </button>

              <button
                onClick={() => setActiveTab("mix")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "mix"
                    ? "bg-brand-dark text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Content Mix Plan</span>
              </button>
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
                {dna.brand_name} Brand Dashboard
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

          {/* Tab 1: Mission Control (Visual Style Tile Moodboard) */}
          {activeTab === "control" && (
            <div className="bg-[#0b0c10] text-white rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden font-sans space-y-6">
              
              {/* Style Tile Main Header Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-b border-white/10 pb-6">
                
                {/* 1. Logo & Brand box */}
                <div className="space-y-4 pr-0 lg:pr-6 border-r border-white/0 lg:border-white/10">
                  <div className="flex items-center gap-3">
                    {assets?.logo_url ? (
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1.5 border border-white/10">
                        <img src={assets.logo_url} alt="Emblem" className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : assets?.logo_studio_data?.assets?.monogramSvg ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-900 border border-white/10 p-1" dangerouslySetInnerHTML={{ __html: assets.logo_studio_data.assets.monogramSvg }} />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#C9A84C] flex items-center justify-center text-black font-black text-sm uppercase">
                        {dna.brand_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl font-bold uppercase tracking-wider font-serif text-white">{dna.brand_name}</h1>
                      <p className="text-[9px] text-[#C9A84C] font-semibold uppercase tracking-widest leading-none mt-0.5">{dna.sub_category || dna.category}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Brand Tagline</p>
                    <p className="text-xs italic text-gray-300 leading-relaxed font-serif">&ldquo;{dna.usp}&rdquo;</p>
                  </div>
                </div>

                {/* 2. Color Palette Box */}
                <div className="space-y-3 px-0 lg:px-4 border-r border-white/0 lg:border-white/10">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Color Palette</span>
                  <div className="grid grid-cols-6 gap-1.5 h-12">
                    {/* Primary */}
                    <div className="rounded border border-white/10 flex flex-col justify-end p-1 relative group overflow-hidden" style={{ backgroundColor: colors.primaryHex }}>
                      <span className="text-[8px] font-bold text-white bg-black/60 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 left-1 font-mono">{colors.primaryHex}</span>
                    </div>
                    {/* Secondary */}
                    <div className="rounded border border-white/10 flex flex-col justify-end p-1 relative group overflow-hidden" style={{ backgroundColor: colors.secondaryHex }}>
                      <span className="text-[8px] font-bold text-white bg-black/60 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 left-1 font-mono">{colors.secondaryHex}</span>
                    </div>
                    {/* Swatches fallback */}
                    <div className="rounded border border-white/10" style={{ backgroundColor: "#5A2E17" }} />
                    <div className="rounded border border-white/10" style={{ backgroundColor: "#4B0E16" }} />
                    <div className="rounded border border-white/10" style={{ backgroundColor: "#0D0D0D" }} />
                    <div className="rounded border border-white/10" style={{ backgroundColor: "#F5ECD9" }} />
                  </div>
                  <div className="flex justify-between items-center text-[8px] text-gray-400 font-mono">
                    <span><strong>CMYK:</strong> {colors.primaryCmyk}</span>
                    <span><strong>PANTONE:</strong> {colors.pantoneApprox}</span>
                  </div>
                </div>

                {/* 3. Typography font showcase box */}
                <div className="space-y-3 pl-0 lg:pl-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Typography System</span>
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[8px] text-gray-400 uppercase tracking-wide">Headline:</span>
                        <h4 className="text-base font-bold text-white leading-none mt-0.5" style={{ fontFamily: typography.primaryFont }}>
                          {typography.primaryFont}
                        </h4>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-400 uppercase tracking-wide">Body Text:</span>
                        <p className="text-xs text-gray-300 leading-none mt-0.5" style={{ fontFamily: typography.bodyFont }}>
                          {typography.bodyFont}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[8px] text-gray-500 font-mono leading-tight">{typography.usage}</p>
                </div>

              </div>

              {/* Middle Section: Mood images, Visual Mockups, UI Elements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 4. Brand Mood Box */}
                <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Brand Mood & Tone</span>
                  
                  <div className="grid grid-cols-2 gap-2 my-auto">
                    {moodImages.map((img, idx) => (
                      <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-white/10 group">
                        <img src={img} alt="Mood" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-bold text-[#C9A84C] tracking-wide uppercase pt-1">
                    <span>Luxurious</span>
                    <span>•</span>
                    <span>Timeless</span>
                    <span>•</span>
                    <span>Exclusive</span>
                  </div>
                </div>

                {/* 5. Social Post & Carousel Direction */}
                <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-4 space-y-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Social Post Visual Direction</span>
                  
                  {/* Instagram / Social Frame */}
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 text-[9px] font-sans">
                    {/* Social Post Header */}
                    <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-white/15 border border-white/10 overflow-hidden">
                          {assets?.logo_url ? (
                            <img src={assets.logo_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[6px] font-bold text-white flex items-center justify-center h-full uppercase">{dna.brand_name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="leading-tight">
                          <p className="text-[8px] font-black text-white">{dna.brand_name.toLowerCase()}</p>
                          <p className="text-[6px] text-gray-400">Sponsored</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/50 font-bold leading-none select-none">•••</span>
                    </div>

                    {/* Social Post Body */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-transparent to-black" style={{ height: "135px" }}>
                      <img src={moodImages[0]} alt="Post visual" className="w-full h-full object-cover opacity-50 absolute inset-0 pointer-events-none" />
                      
                      {/* Brand Overlay Text */}
                      <div className="absolute inset-0 p-3 flex flex-col justify-between z-10 bg-gradient-to-t from-black/80 via-black/20 to-black/35">
                        <div className="flex justify-between items-center">
                          <span className="text-[6px] font-black text-[#C9A84C] border border-[#C9A84C]/30 px-1 py-0.5 rounded uppercase tracking-widest">Aesthetic Focus</span>
                          <span className="text-[6px] text-white/60">Slide 1 / 5</span>
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-white text-[10px] leading-tight max-w-[150px]" style={{ fontFamily: typography.primaryFont }}>
                            {dna.usp}
                          </h5>
                          <p className="text-[6px] text-white/70 leading-relaxed max-w-[165px] line-clamp-2">
                            {dna.business_description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Post Layout Elements Box */}
                <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-4 space-y-4">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Carousel & Post Components</span>
                  
                  <div className="space-y-3">
                    {/* Badge component */}
                    <div className="flex items-center justify-between bg-black/40 border border-white/5 p-2 rounded-lg">
                      <span className="text-[7px] text-gray-400 uppercase font-mono">Accent Graphic Badge</span>
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded" style={{ backgroundColor: colors.secondaryHex, color: "#000" }}>
                        {dna.brand_personality}
                      </span>
                    </div>

                    {/* Typography Card */}
                    <div className="bg-[#111] border border-white/10 p-3 rounded-lg text-center space-y-1">
                      <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">Text Slide Style</p>
                      <p className="text-white text-[9px] leading-normal font-serif italic mx-auto max-w-[150px]" style={{ fontFamily: typography.primaryFont }}>
                        &ldquo;{dna.mission.length > 55 ? `${dna.mission.slice(0, 52)}...` : dna.mission}&rdquo;
                      </p>
                    </div>

                    {/* Carousel Nav dots preview */}
                    <div className="flex items-center justify-between text-[7px] text-gray-400 bg-black/20 p-1.5 rounded-lg border border-white/5">
                      <span>Swipe for details</span>
                      <div className="flex gap-1">
                        <span className="w-1 h-1 rounded-full bg-[#C9A84C]" />
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Lower Section: Values, Image Direction, Component mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* 7. Brand Essence / Core values */}
                <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-4 space-y-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Brand Essence</span>
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#C9A84C] font-bold uppercase font-mono">{dna.brand_personality} personality</p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(dna.brand_values || []).map((val) => (
                        <span key={val} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[9px] text-gray-200 font-semibold">
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 8. Imagery Direction Row */}
                <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-4 space-y-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Imagery Direction</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {activeImageryList.map((img, i) => (
                      <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                        <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[7px] text-gray-500">
                    <span>Iconic</span>
                    <span>Curated</span>
                    <span>Authentic</span>
                    <span>Refined</span>
                  </div>
                </div>

                {/* 9. Components Box */}
                <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-4 space-y-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Components</span>
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-3 relative overflow-hidden" style={{ minHeight: "68px" }}>
                    <div className="absolute top-2 right-2 text-[#C9A84C] font-bold text-[8px] tracking-widest uppercase">LV 2026-001</div>
                    <p className="text-[7px] text-white/50">MEMBER CARD</p>
                    <p className="text-[10px] font-bold text-white mt-1 tracking-wide">{dna.brand_name.toUpperCase()}</p>
                    <div className="flex justify-between items-center mt-3 text-[6px] text-white/40">
                      <span>{dna.main_goal}</span>
                      <span>Synced DNA</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 10. Mood Summary Banner at bottom */}
              <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div>
                  <p className="text-[9px] font-black text-[#C9A84C] uppercase tracking-widest">Visual Brain Summary</p>
                  <p className="text-gray-300 mt-1 leading-relaxed max-w-2xl font-serif text-[11px] italic">
                    &ldquo;{dna.business_description}&rdquo;
                  </p>
                </div>
                <div className="flex gap-2">
                  {gradients.map((g, idx) => (
                    <div key={idx} className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ background: g.style }} title={g.name} />
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: Original Detailed Brand DNA Cards */}
          {activeTab === "dna" && (
            <div className="space-y-6">
              
              {/* Detailed Info Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Box 1: Company Definition */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-brand-secondary" />
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

              {/* Box 5: Brand Assets & Media Locker */}
              {assets && (
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 space-y-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-3">
                    <Image className="w-4 h-4 text-brand-secondary" />
                    Brand Assets & Media Locker
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    
                    {/* Logo & Guideline Column */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-400 block mb-1.5 font-semibold">Active Logo Graphic</span>
                        {assets.logo_url ? (
                          <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center p-2 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                            <img src={assets.logo_url} alt="Brand Logo" className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : assets.logo_studio_data?.assets?.primaryLogoSvg ? (
                          <div className="w-24 h-24 bg-gray-950 rounded-xl flex items-center justify-center p-2 shadow-sm" dangerouslySetInnerHTML={{ __html: assets.logo_studio_data.assets.primaryLogoSvg }} />
                        ) : (
                          <span className="text-gray-400 italic text-[10px]">No logo uploaded or generated</span>
                        )}
                      </div>

                      <div className="pt-1">
                        <span className="text-gray-400 block mb-1.5 font-semibold">Brand Stylebook / Guidelines</span>
                        {assets.brand_guidelines ? (
                          <a
                            href={assets.brand_guidelines}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-brand-secondary" />
                            View Guidelines PDF
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-[10px] block">No guidelines document uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Media Gallery & Resources Columns */}
                    <div className="md:col-span-2 space-y-4">
                      {/* Row 1: Images Gallery */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Product Photos */}
                        <div className="space-y-1.5">
                          <span className="text-gray-400 block font-semibold">Product Images ({assets.product_images?.length || 0})</span>
                          {assets.product_images && assets.product_images.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.product_images.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-gray-150 overflow-hidden bg-gray-50 block hover:opacity-80">
                                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[9px] block">No product images</span>
                          )}
                        </div>

                        {/* Team Photos */}
                        <div className="space-y-1.5">
                          <span className="text-gray-400 block font-semibold">Team Photos ({assets.team_photos?.length || 0})</span>
                          {assets.team_photos && assets.team_photos.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.team_photos.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-gray-150 overflow-hidden bg-gray-50 block hover:opacity-80">
                                  <img src={img} alt="Team" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[9px] block">No team photos</span>
                          )}
                        </div>

                        {/* Office Workspace */}
                        <div className="space-y-1.5">
                          <span className="text-gray-400 block font-semibold">Office Images ({assets.office_images?.length || 0})</span>
                          {assets.office_images && assets.office_images.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.office_images.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-gray-150 overflow-hidden bg-gray-50 block hover:opacity-80">
                                  <img src={img} alt="Office" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[9px] block">No office images</span>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Videos, Fonts & Icons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-3">
                        {/* Brand Videos */}
                        <div className="space-y-1.5">
                          <span className="text-gray-400 block font-semibold">Brand Videos ({assets.brand_videos?.length || 0})</span>
                          {assets.brand_videos && assets.brand_videos.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.brand_videos.map((vid, i) => (
                                <a key={i} href={vid} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-gray-950 flex items-center justify-center text-white/50 hover:bg-gray-900">
                                  <Video className="w-4 h-4" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[9px] block">No videos uploaded</span>
                          )}
                        </div>

                        {/* Custom Fonts */}
                        <div className="space-y-1.5">
                          <span className="text-gray-400 block font-semibold">Brand Fonts ({assets.fonts?.length || 0})</span>
                          {assets.fonts && assets.fonts.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.fonts.map((f, i) => (
                                <a key={i} href={f} target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-gray-50 border border-gray-200 text-[8px] font-mono font-bold text-gray-700 hover:bg-gray-100">
                                  FONT {i + 1}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[9px] block">No fonts uploaded</span>
                          )}
                        </div>

                        {/* Custom Icons */}
                        <div className="space-y-1.5">
                          <span className="text-gray-400 block font-semibold">Brand Icons ({assets.icons?.length || 0})</span>
                          {assets.icons && assets.icons.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.icons.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-gray-150 overflow-hidden bg-gray-50 block hover:opacity-80">
                                  <img src={img} alt="Icon" className="w-full h-full object-contain p-1" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[9px] block">No icons uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* If generated via AI Logo Studio, show colors & typographies specifications */}
                  {assets.logo_studio_data?.colors && (
                    <div className="border-t border-gray-100 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] text-gray-400 font-mono">
                      <div>
                        <span className="text-[9px] text-gray-400 block font-sans">PRIMARY HEX</span>
                        <div className="flex items-center gap-1.5 font-bold text-gray-800">
                          <span className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: assets.logo_studio_data.colors.primaryHex }} />
                          {assets.logo_studio_data.colors.primaryHex}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block font-sans">SECONDARY HEX</span>
                        <div className="flex items-center gap-1.5 font-bold text-gray-800">
                          <span className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: assets.logo_studio_data.colors.secondaryHex }} />
                          {assets.logo_studio_data.colors.secondaryHex}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block font-sans">CMYK</span>
                        <div className="font-bold text-gray-700">{assets.logo_studio_data.colors.primaryCmyk}</div>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block font-sans">PANTONE APPROX</span>
                        <div className="font-bold text-gray-700">{assets.logo_studio_data.colors.pantoneApprox}</div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* Tab 3: Campaigns & Calendar (Phase 5 & 8) */}
          {activeTab === "campaigns" && (
            <div className="space-y-6">
              
              {/* Campaigns Panel Header */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Briefcase className="w-4 h-4 text-brand-primary" />
                    AI Campaigns Planner
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Automated marketing strategy campaigns and content calendar grids.</p>
                </div>
                <button
                  onClick={() => setIsCampaignModalOpen(true)}
                  className="px-4 py-2 bg-brand-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-darkHover transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Plan New Campaign
                </button>
              </div>

              {/* Campaigns list and stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Active Campaigns Column */}
                <div className="md:col-span-1 bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Campaigns ({campaigns.length})</h4>
                  <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
                    {campaigns.length === 0 ? (
                      <p className="text-gray-400 italic text-xs py-4 text-center">No campaigns planned yet. Click button to begin.</p>
                    ) : (
                      campaigns.map((camp) => (
                        <div key={camp.id} className="p-3.5 bg-gray-50 border border-gray-150 rounded-xl space-y-2 hover:border-gray-300 transition-colors">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black text-[#06B6D4] uppercase bg-[#06B6D4]/5 px-2 py-0.5 rounded border border-[#06B6D4]/10">{camp.platforms?.[0] || "Campaign"}</span>
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 text-[8px] px-1.5 py-0.5 rounded capitalize">{camp.status}</span>
                          </div>
                          <h5 className="font-bold text-gray-900 text-xs leading-snug">{camp.title}</h5>
                          <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">{camp.description}</p>
                          {camp.theme && (
                            <p className="text-[9px] text-[#C9A84C] font-semibold tracking-wide mt-1.5">Theme: {camp.theme}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Calendar Grid Column */}
                <div className="md:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col justify-between" style={{ minHeight: "450px" }}>
                  <div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Content Calendar Grid (30 Days)</h4>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">UTC Timeline Mode</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1" style={{ maxHeight: "360px" }}>
                      {calendar.length === 0 ? (
                        <div className="sm:col-span-2 text-center py-12 space-y-3">
                          <Loader2 className="w-6 h-6 text-brand-secondary animate-spin mx-auto" />
                          <p className="text-gray-400 italic text-xs font-mono">Compiling strategy calendar timeline...</p>
                        </div>
                      ) : (
                        calendar.map((item) => (
                          <div key={item.id} className="p-3 bg-gray-50/50 border border-gray-200/80 rounded-xl space-y-2 hover:border-gray-300 transition-colors flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-mono font-bold text-gray-400">{item.date}</span>
                                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded
                                  ${item.post_type === "video" ? "bg-red-50 text-red-600 border border-red-100" :
                                    item.post_type === "carousel" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
                                >
                                  {item.post_type}
                                </span>
                              </div>
                              <h5 className="font-bold text-gray-800 text-xs truncate mt-1">{item.title}</h5>
                              <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{item.concept_brief}</p>
                            </div>

                            <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between">
                              {item.status === "completed" && item.post ? (
                                <button
                                  onClick={() => {
                                    setViewingAsset(item.post);
                                    setActiveSlide(0);
                                    setIsVideoPlaying(false);
                                    setVideoTimer(0);
                                  }}
                                  className="text-[9px] font-black text-brand-secondary uppercase hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  View Assets
                                </button>
                              ) : (
                                <button
                                  disabled={generatingAssetId === item.id}
                                  onClick={async () => {
                                    setGeneratingAssetId(item.id);
                                    try {
                                      const res = await fetch("/api/content/generate", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ calendarItemId: item.id })
                                      });
                                      if (res.ok) {
                                        await reloadDynamicData(dna.id);
                                      } else {
                                        alert("Generation failed");
                                      }
                                    } catch (e) {
                                      console.error(e);
                                    } finally {
                                      setGeneratingAssetId(null);
                                    }
                                  }}
                                  className="text-[9px] font-black text-brand-primary uppercase hover:underline disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {generatingAssetId === item.id ? (
                                    <>
                                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    "Generate with AI"
                                  )}
                                </button>
                              )}
                              <span className={`text-[8px] font-bold uppercase ${item.status === "completed" ? "text-emerald-500" : "text-amber-500"}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Tab 4: Content Mix Configuration (Phase 7) */}
          {activeTab === "mix" && (
            <div className="space-y-6 animate-fade-up">
              
              {/* Header card */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-brand-primary" />
                  Content Mix Recommendations & Overrides
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Review AI optimal post ratios and override configurations manually to adjust targets.</p>
              </div>

              {/* Ratios grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentMix.length === 0 ? (
                  <div className="sm:col-span-3 text-center py-12 bg-white border border-gray-200 rounded-2xl">
                    <Loader2 className="w-6 h-6 text-brand-secondary animate-spin mx-auto" />
                    <p className="text-gray-400 italic text-xs font-mono mt-2">Loading active content mix rules...</p>
                  </div>
                ) : (
                  contentMix.map((mix, index) => (
                    <div key={index} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">{mix.platform}</span>
                          <span className="text-[9px] font-black uppercase text-brand-secondary bg-brand-secondary/5 px-2 py-0.5 rounded">{mix.postType}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-[8px] text-gray-400 block uppercase font-bold">AI Recommended</span>
                            <span className="text-xl font-black text-gray-800">{mix.recommendedCount}</span>
                          </div>
                          <div className="p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                            <span className="text-[8px] text-brand-primary block uppercase font-bold">Active Target</span>
                            <span className="text-xl font-black text-brand-primary">{mix.overrideCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Override controls */}
                      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                        <button
                          onClick={async () => {
                            const newCount = Math.max(0, mix.overrideCount - 1);
                            const updatedMix = contentMix.map((m, i) => i === index ? { ...m, overrideCount: newCount } : m);
                            setContentMix(updatedMix);
                            await fetch("/api/content-mix", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ brandDnaId: dna.id, action: "override", platform: mix.platform, postType: mix.postType, count: newCount })
                            });
                          }}
                          className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 cursor-pointer animate-scale"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-bold text-xs text-gray-800">{mix.overrideCount} posts</span>
                        <button
                          onClick={async () => {
                            const newCount = mix.overrideCount + 1;
                            const updatedMix = contentMix.map((m, i) => i === index ? { ...m, overrideCount: newCount } : m);
                            setContentMix(updatedMix);
                            await fetch("/api/content-mix", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ brandDnaId: dna.id, action: "override", platform: mix.platform, postType: mix.postType, count: newCount })
                            });
                          }}
                          className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 cursor-pointer animate-scale"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </main>

        {/* Campaign Planning Modal Overlay */}
        {isCampaignModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  Plan Custom AI Campaign
                </h3>
                <p className="text-xs text-gray-400 mt-1">AI generates a detailed campaign and schedules 5 target post concepts.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-500 font-bold block">Campaign Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Launching AI Scraper V2"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 font-bold block">Campaign Type</label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 outline-none focus:border-brand-primary"
                  >
                    <option>Product Launch</option>
                    <option>Sales & Promotion</option>
                    <option>Educational</option>
                    <option>Urgency/Awareness</option>
                    <option>Hiring</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 font-bold block">Campaign Brief / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your campaign objectives, USPs to highlight..."
                    value={campaignDesc}
                    onChange={(e) => setCampaignDesc(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 outline-none focus:border-brand-primary resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-500 font-bold block">Target Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {["instagram", "linkedin", "x", "youtube", "facebook"].map(platform => {
                      const active = campaignPlatforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          onClick={() => {
                            if (active) {
                              setCampaignPlatforms(campaignPlatforms.filter(p => p !== platform));
                            } else {
                              setCampaignPlatforms([...campaignPlatforms, platform]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border font-bold capitalize transition-all
                            ${active ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "bg-gray-50 border-gray-200 text-gray-500"}`}
                        >
                          {platform}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-4">
                <button
                  disabled={isSubmittingCampaign}
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmittingCampaign || !campaignTitle || !campaignDesc || campaignPlatforms.length === 0}
                  onClick={async () => {
                    setIsSubmittingCampaign(true);
                    try {
                      const res = await fetch("/api/campaigns", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          brandDnaId: dna.id,
                          title: campaignTitle,
                          campaignType,
                          description: campaignDesc,
                          platforms: campaignPlatforms
                        })
                      });
                      if (res.ok) {
                        setIsCampaignModalOpen(false);
                        setCampaignTitle("");
                        setCampaignDesc("");
                        setCampaignPlatforms([]);
                        await reloadDynamicData(dna.id);
                      } else {
                        alert("Failed to plan campaign");
                      }
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsSubmittingCampaign(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-brand-dark hover:bg-brand-darkHover text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmittingCampaign ? "AI Planning..." : "Generate Campaign"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Asset Viewer Modal Overlay */}
        {viewingAsset && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono">Assets Preview</span>
                  <h3 className="text-base font-bold text-gray-900 capitalize">{viewingAsset.post_type} Asset Details</h3>
                </div>
                <button
                  onClick={() => setViewingAsset(null)}
                  className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Copy Caption */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Social Caption</label>
                  <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl font-sans text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {viewingAsset.caption}
                  </div>
                </div>

                {/* Hooks & CTAs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Alternative Hook Idea</label>
                    <div className="p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-gray-600 font-medium leading-relaxed italic">
                      {viewingAsset.hooks?.[0] || "None generated"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Primary CTA</label>
                    <div className="p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-[#06B6D4] font-bold">
                      {viewingAsset.ctas?.[0] || "None generated"}
                    </div>
                  </div>
                </div>

                {/* Live Media Asset Render */}
                {viewingAsset.generated_assets && (
                  <div className="space-y-4">
                    {/* Format 1: Static Post Preview */}
                    {viewingAsset.post_type === "static" && viewingAsset.generated_assets.imageUrl && (
                      <div className="space-y-1">
                        <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Static Feed Post Preview</label>
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-gray-200 bg-slate-900 shadow-inner">
                          {/* Base Image */}
                          <img
                            src={viewingAsset.generated_assets.imageUrl}
                            alt="AI Background"
                            className="w-full h-full object-cover opacity-75"
                          />
                          {/* Sleek Overlay Branding */}
                          <div className="absolute inset-0 p-5 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/40">
                            {/* Header */}
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white text-xs">
                                {dna?.brand_name?.[0] || "A"}
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-xs font-sans tracking-wide leading-none">{dna?.brand_name || "Asenra"}</h4>
                                <span className="text-[8px] text-gray-300 font-medium font-sans">Sponsored</span>
                              </div>
                            </div>
                            {/* Overlay Content Card */}
                            <div className="bg-white/10 backdrop-blur-lg border border-white/25 p-4 rounded-xl space-y-1.5 shadow-xl">
                              <h4 className="font-bold text-white text-sm font-sans tracking-wide leading-tight">
                                {viewingAsset.title}
                              </h4>
                              <p className="text-[10px] text-gray-200 font-medium leading-relaxed line-clamp-3">
                                {viewingAsset.caption}
                              </p>
                              <div className="pt-2 flex justify-between items-center border-t border-white/10">
                                <span className="text-[9px] text-[#C9A84C] font-bold tracking-wider uppercase font-mono">{viewingAsset.ctas?.[0] || "Learn More"}</span>
                                <div className="px-3 py-1 bg-white text-black font-bold text-[9px] rounded-lg shadow-sm hover:scale-105 transition-transform uppercase tracking-wider">
                                  {viewingAsset.ctas?.[0] || "Learn More"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Format 2: Carousel Post Slider */}
                    {viewingAsset.post_type === "carousel" && viewingAsset.generated_assets.slides && (
                      <div className="space-y-1">
                        <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Interactive Carousel Post Preview</label>
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-gray-200 bg-slate-950 shadow-2xl flex flex-col justify-between p-5">
                          {/* Background image */}
                          <img
                            src={viewingAsset.generated_assets.coverUrl || viewingAsset.generated_assets.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"}
                            alt="Background Texture"
                            className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
                          />
                          
                          {/* Gradient Backdrop */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />

                          {/* Header */}
                          <div className="relative flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white text-[10px]">
                                {dna?.brand_name?.[0] || "A"}
                              </div>
                              <span className="text-[10px] font-bold text-white tracking-wider">{dna?.brand_name || "Asenra"}</span>
                            </div>
                            <span className="text-[9px] font-mono bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full text-white/90 border border-white/10">
                              {activeSlide + 1} / {viewingAsset.generated_assets.slides.length}
                            </span>
                          </div>

                          {/* Animated Slide Content Overlay */}
                          <div className="relative my-auto py-4 px-2 space-y-3">
                            <span className="text-[8px] font-black text-[#C9A84C] tracking-widest uppercase font-mono bg-[#C9A84C]/10 border border-[#C9A84C]/25 px-2.5 py-0.5 rounded-full inline-block">
                              Slide {viewingAsset.generated_assets.slides[activeSlide]?.slideNumber || (activeSlide + 1)}
                            </span>
                            <h3 className="text-base font-black text-white leading-tight font-sans tracking-wide">
                              {viewingAsset.generated_assets.slides[activeSlide]?.headline || "Slide Title"}
                            </h3>
                            <p className="text-[10px] text-gray-300 leading-relaxed font-sans font-medium">
                              {viewingAsset.generated_assets.slides[activeSlide]?.bodyText || "Slide Body Text..."}
                            </p>
                          </div>

                          {/* Footer & Navigation Controls */}
                          <div className="relative flex justify-between items-center border-t border-white/10 pt-3">
                            <span className="text-[8px] text-[#C9A84C] font-bold uppercase tracking-wider font-mono">Swipe to read</span>
                            <div className="flex space-x-2">
                              <button
                                disabled={activeSlide === 0}
                                onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                                className="w-7 h-7 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all"
                              >
                                &larr;
                              </button>
                              <button
                                disabled={activeSlide === viewingAsset.generated_assets.slides.length - 1}
                                onClick={() => setActiveSlide(prev => Math.min(viewingAsset.generated_assets.slides.length - 1, prev + 1))}
                                className="w-7 h-7 rounded-full bg-[#C9A84C] hover:bg-[#e0bc58] text-black flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all"
                              >
                                &rarr;
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Format 3: Video Reels Preview */}
                    {viewingAsset.post_type === "video" && (
                      <div className="space-y-1">
                        <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Video Reels Mock Player</label>
                        <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto rounded-3xl overflow-hidden border-4 border-slate-800 bg-black shadow-2xl flex flex-col justify-between p-4">
                          {/* Background B-roll thumbnail */}
                          <img
                            src={viewingAsset.generated_assets.thumbnailUrl || viewingAsset.generated_assets.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"}
                            alt="B-roll Background"
                            className="absolute inset-0 w-full h-full object-cover opacity-65 pointer-events-none"
                          />

                          {/* Header overlay */}
                          <div className="relative flex items-center justify-between text-white text-[10px]">
                            <span className="font-bold tracking-wider font-sans">Reels</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                              <span className="text-[9px] uppercase font-mono tracking-wider font-bold">Preview</span>
                            </div>
                          </div>

                          {/* Play overlay / Dynamic subtitle container */}
                          <div className="relative flex flex-col items-center justify-center my-auto space-y-4 min-h-[120px] w-full">
                            {!isVideoPlaying ? (
                              <button
                                onClick={() => setIsVideoPlaying(true)}
                                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-lg hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
                              >
                                &#9654;
                              </button>
                            ) : (
                              <div 
                                onClick={() => setIsVideoPlaying(false)}
                                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                              />
                            )}

                            {/* Captions Subtitles Overlay */}
                            {isVideoPlaying && (
                              <div className="bg-black/75 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl max-w-[90%] text-center animate-fade-in shadow-2xl pointer-events-none">
                                <p className="text-white text-xs font-bold leading-normal tracking-wide font-sans">
                                  {getActiveSubtitleText()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Footer Info Overlay */}
                          <div className="relative space-y-2 text-white">
                            {/* Brand bar */}
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-[9px]">
                                {dna?.brand_name?.[0] || "A"}
                              </div>
                              <span className="text-[9px] font-bold tracking-wide">{dna?.brand_name || "Asenra"}</span>
                              <button className="px-2 py-0.5 bg-white/25 rounded-md text-[8px] font-bold uppercase tracking-wider">Follow</button>
                            </div>
                            {/* Audio track label */}
                            <p className="text-[8px] text-gray-300 flex items-center space-x-1 truncate font-mono">
                              <span>&#9835;</span> <span>Original Audio - {dna?.brand_name || "Asenra"}</span>
                            </p>
                            {/* Interactive timeline bar */}
                            <div className="h-1 bg-white/25 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#C9A84C] transition-all duration-1000 ease-linear"
                                style={{ width: `${(videoTimer / 30) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[7px] text-gray-400 font-mono">
                              <span>0:{videoTimer < 10 ? `0${videoTimer}` : videoTimer}</span>
                              <span>0:30</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Visual Prompt (for Static/Images or Reels B-rolls) */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">AI Visual Prompt (Stable Diffusion / LongCat)</label>
                  <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl font-mono text-[10px] text-slate-600 leading-normal">
                    {viewingAsset.visual_prompt}
                  </div>
                </div>

                {/* Format Specific Details (e.g. Slides JSON or Video Script timings) */}
                {viewingAsset.post_type === "carousel" && viewingAsset.generated_assets?.slides && (
                  <div className="space-y-2">
                    <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Slides Blueprint ({viewingAsset.generated_assets.slides.length})</label>
                    <div className="space-y-2">
                      {viewingAsset.generated_assets.slides.map((slide: any, idx: number) => (
                        <div key={idx} className="p-3 bg-[#111] border border-white/10 rounded-xl space-y-1 text-white">
                          <span className="text-[8px] font-black text-[#C9A84C] uppercase tracking-wider font-mono">Slide {slide.slideNumber}</span>
                          <h4 className="font-bold text-xs text-white">{slide.headline}</h4>
                          <p className="text-[10px] text-gray-300 leading-normal">{slide.bodyText}</p>
                          <p className="text-[8px] text-gray-500 italic mt-1">Graphic: {slide.visualDescription}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingAsset.post_type === "video" && viewingAsset.generated_assets?.script && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Voiceover Script</label>
                      <div className="p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-gray-700 italic">
                        &ldquo;{viewingAsset.generated_assets.script.voiceover}&rdquo;
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Subtitle Timings</label>
                      <div className="grid grid-cols-1 gap-1">
                        {viewingAsset.generated_assets.script.timings?.map((t: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 border border-gray-150 rounded-lg">
                            <span className="font-mono text-[9px] text-[#06B6D4] font-bold shrink-0">{t.time}</span>
                            <span className="text-gray-600 font-medium text-right ml-4 truncate">{t.subtitles}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Hashtags</label>
                  <div className="flex flex-wrap gap-1">
                    {viewingAsset.hashtags?.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500 font-mono text-[9px] font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              <div className="border-t border-gray-100 pt-3 flex">
                <button
                  onClick={() => setViewingAsset(null)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-dark hover:bg-brand-darkHover text-white font-bold text-xs uppercase"
                >
                  Close Asset Preview
                </button>
              </div>
            </div>
          </div>
        )}

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
