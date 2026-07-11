"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Zap, BarChart3, Calendar,
  Brain, Target, Layers, Share2, Briefcase,
  CheckCircle2, ArrowUpRight, Cpu, Radio,
  Loader2, LogOut, ArrowRight, ShieldCheck,
  Tag, Compass, HelpCircle, Users, Eye, Flag,
  Building, Image, FileText, Video,
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
];

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
                </div>                {/* Media Gallery & Resources Columns */}
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
