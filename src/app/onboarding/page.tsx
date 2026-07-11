"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Sparkles,
  Building, Target, Shield, Compass,
  Laptop, Globe, Plus, Trash2, Tag, Key, Info, HelpCircle,
  Loader2, Search, CheckCircle2, ChevronRight, Zap
} from "lucide-react";
import Navbar from "@/components/Navbar";

// --- Types ---
type OnboardingData = {
  brandName: string;
  website: string;
  industry: string;
  category: string;
  subCategory: string;
  businessDescription: string;
  
  mission: string;
  vision: string;
  usp: string;
  brandPersonality: string;
  brandValues: string[];
  
  products: string[];
  services: string[];
  pricing: string;
  
  targetAudience: string;
  customerPersonas: string;
  country: string;
  languages: string[];
  
  platforms: string[];
  competitors: string[];
  mainGoal: string;
};

const INITIAL_DATA: OnboardingData = {
  brandName: "",
  website: "",
  industry: "",
  category: "",
  subCategory: "",
  businessDescription: "",
  
  mission: "",
  vision: "",
  usp: "",
  brandPersonality: "",
  brandValues: [],
  
  products: [],
  services: [],
  pricing: "",
  
  targetAudience: "",
  customerPersonas: "",
  country: "",
  languages: ["English"],
  
  platforms: [],
  competitors: [],
  mainGoal: "",
};

// Preset lists to avoid manual typing
const PRESET_VALUES = [
  "Innovation", "Trust & Integrity", "Simplicity", "Customer First", 
  "Eco-Friendly", "Premium Quality", "Accessibility", "Boldness", 
  "Transparency", "Data-Driven", "Community Focus", "Security"
];

const PRESET_LANGUAGES = ["English", "Hindi", "Spanish", "German", "French", "Japanese", "Arabic"];

const PRESET_COUNTRIES = ["Global", "India", "United States", "United Kingdom", "Canada", "Germany", "Singapore"];

const BRAND_PERSONALITIES = [
  { id: "professional", label: "Professional", desc: "Formal, authoritative, trustworthy, and expert" },
  { id: "casual", label: "Casual", desc: "Approachable, conversational, warm, and friendly" },
  { id: "bold", label: "Bold & Adventurous", desc: "Disruptive, energetic, high-impact, and daring" },
  { id: "playful", label: "Playful", desc: "Creative, witty, fun-loving, and humorous" },
];

const PRICING_PRESETS = ["Subscription / SaaS", "One-Time Purchase", "Usage-Based / Credits", "Free / Ad-Supported", "Enterprise / Custom Quote"];

const PLATFORMS = [
  { id: "instagram", label: "Instagram", desc: "Visual storytelling & community" },
  { id: "linkedin", label: "LinkedIn", desc: "B2B networking & thought leadership" },
];

const OBJECTIVES = [
  { id: "awareness", label: "Brand Awareness", desc: "Make your brand known and recognizable" },
  { id: "leads", label: "Lead Generation", desc: "Acquire emails, signups, and prospects" },
  { id: "sales", label: "Direct Sales", desc: "Convert audiences directly into paying customers" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Autofill states
  const [scanningUrl, setScanningUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanMessages, setScanMessages] = useState<string[]>([]);
  const [customValueInput, setCustomValueInput] = useState("");
  const [customLangInput, setCustomLangInput] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("automarc_onboarding_v3");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync to localStorage
  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => {
      const updated = { ...prev, ...fields };
      localStorage.setItem("automarc_onboarding_v3", JSON.stringify(updated));
      return updated;
    });
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Simulated Website Crawler & Brand DNA Generator
  const runAiScanner = () => {
    if (!scanningUrl.trim()) return;
    setIsScanning(true);
    setScanStep(1);
    setScanMessages(["Analyzing URL structure..."]);

    const steps = [
      { msg: "Extracting homepage copy and metadata...", delay: 1000 },
      { msg: "Identifying core product offerings & pricing models...", delay: 2200 },
      { msg: "Detecting target audience personas & brand tone...", delay: 3400 },
      { msg: "Synthesizing Mission, Vision, and USP configurations...", delay: 4600 },
      { msg: "Completed! Brand DNA populated successfully.", delay: 5800 },
    ];

    steps.forEach((stepItem, index) => {
      setTimeout(() => {
        setScanMessages((prev) => [...prev, stepItem.msg]);
        setScanStep(index + 2);

        if (index === steps.length - 1) {
          // Extract brand name from URL nicely
          let guessedName = "My Brand";
          try {
            const urlObj = new URL(
              scanningUrl.startsWith("http") ? scanningUrl : `https://${scanningUrl}`
            );
            guessedName = urlObj.hostname
              .replace("www.", "")
              .split(".")[0]
              .replace(/^\w/, (c) => c.toUpperCase());
          } catch (e) {}

          // Autofill Mock Data based on industry keywords or generic rich SaaS presets
          updateData({
            brandName: guessedName,
            website: scanningUrl.startsWith("http") ? scanningUrl : `https://${scanningUrl}`,
            industry: "Technology / SaaS",
            category: "Artificial Intelligence Software",
            subCategory: "Marketing Copilot Engine",
            businessDescription: `${guessedName} is an automated customer acquisition platform that helps teams coordinate campaigns and optimize brand consistency across multiple networks.`,
            mission: `To simplify brand intelligence and streamline campaign execution for growing teams.`,
            vision: `To become the standard AI autopilot system for multi-channel content management.`,
            usp: `Instant automated posting queues generated directly from live site data feeds.`,
            brandPersonality: "bold",
            brandValues: ["Innovation", "Simplicity", "Data-Driven"],
            products: ["AI Content Planner", "Marketing Analytics Panel"],
            pricing: "Subscription / SaaS",
            targetAudience: "Indie founders, startup marketers, and digital agency operators",
            customerPersonas: "Alex, 32, tech founder looking to scale organic reach without spending hours copy-editing daily.",
            country: "Global",
            languages: ["English"],
            competitors: ["buffer.com", "hootsuite.com"],
          });

          setTimeout(() => {
            setIsScanning(false);
            setScanMessages([]);
            setScanStep(0);
          }, 1000);
        }
      }, stepItem.delay);
    });
  };

  const togglePresetValue = (val: string) => {
    const list = data.brandValues || [];
    const next = list.includes(val) ? list.filter((v) => v !== val) : [...list, val];
    updateData({ brandValues: next });
  };

  const toggleLanguage = (lang: string) => {
    const list = data.languages || [];
    const next = list.includes(lang) ? list.filter((l) => l !== lang) : [...list, lang];
    updateData({ languages: next });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          (data.brandName || "").trim().length > 0 &&
          (data.industry || "").trim().length > 0 &&
          (data.businessDescription || "").trim().length > 0
        );
      case 2:
        return (
          (data.mission || "").trim().length > 0 &&
          (data.usp || "").trim().length > 0 &&
          data.brandPersonality !== "" &&
          (data.brandValues || []).length > 0
        );
      case 3:
        return (
          (data.targetAudience || "").trim().length > 0 &&
          (data.country || "").trim().length > 0 &&
          (data.languages || []).length > 0 &&
          (data.pricing || "").trim().length > 0
        );
      case 4:
        return (data.platforms || []).length > 0 && data.mainGoal !== "";
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      
      const { error } = await supabase.from("brand_dna").insert({
        brand_name: data.brandName,
        website: data.website || null,
        industry: data.industry,
        category: data.category || "General",
        sub_category: data.subCategory || null,
        business_description: data.businessDescription,
        
        mission: data.mission,
        vision: data.vision || null,
        usp: data.usp,
        brand_personality: data.brandPersonality,
        brand_values: data.brandValues,
        
        products: data.products,
        services: data.services,
        pricing: data.pricing,
        
        target_audience: data.targetAudience,
        customer_personas: data.customerPersonas || null,
        country: data.country,
        languages: data.languages,
        
        competitors: (data.competitors || []).filter(c => c.trim().length > 0),
        platforms: data.platforms || [],
        main_goal: data.mainGoal,
      });

      if (error) {
        console.error("Database insert error:", error);
        alert("Failed to save Brand DNA profile. Please try again.");
        setIsSubmitting(false);
        return;
      }

      localStorage.removeItem("automarc_onboarding_v3");
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      
      <Navbar />

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-100 relative">
        <div
          className="h-full bg-[#06B6D4] transition-all duration-300 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
        <div className="absolute right-6 -top-5 text-[9px] font-bold text-gray-400 tracking-wider">
          STEP {step} OF 4
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] w-full relative overflow-hidden">
          
          {/* AI SCANNING OVERLAY MODAL */}
          {isScanning && (
            <div className="absolute inset-0 bg-[#090D16] text-white p-8 flex flex-col justify-between z-50 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-[#06B6D4] animate-spin" />
                  <span className="text-xs font-mono font-bold tracking-widest text-[#06B6D4] uppercase">AI Scanner Core Active</span>
                </div>
                <div className="space-y-3 font-mono text-[11px] text-white/70 max-w-md">
                  <p className="text-white/40">&gt; curl -s -X GET "{scanningUrl}"</p>
                  {scanMessages.map((msg, i) => (
                    <p key={i} className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{msg}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[10px] font-mono text-white/30">
                <span>ANALYZING META-DATA...</span>
                <span>{scanStep * 20}%</span>
              </div>
            </div>
          )}

          {/* ─── Step 1: Magic Website Crawler / Manual Profile ─── */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#06B6D4] fill-[#06B6D4]/10" />
                  Magic Autofill DNA
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your website URL. Our AI engine will auto-scan your product info, values, pricing models, and target audience setup instantly!
                </p>
              </div>

              {/* Crawler Bar */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Company Website URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. mybrand.com"
                      value={scanningUrl}
                      onChange={(e) => setScanningUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary text-sm bg-white text-gray-900 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={runAiScanner}
                    disabled={!scanningUrl.trim()}
                    className={`px-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all
                      ${scanningUrl.trim()
                        ? "bg-[#06B6D4] text-[#090D16] hover:bg-[#06B6D4]/90"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                      }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    Scan Site
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verify / Edit Details</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Automarc"
                      value={data.brandName}
                      onChange={(e) => updateData({ brandName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Industry *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SaaS, E-Commerce, Retail"
                      value={data.industry}
                      onChange={(e) => updateData({ industry: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AI Content Tool"
                      value={data.category}
                      onChange={(e) => updateData({ category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Business Description *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Briefly describe what your company does..."
                      value={data.businessDescription}
                      onChange={(e) => updateData({ businessDescription: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 resize-none outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: Brand Identity & Values (Tag presets) ─── */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#06B6D4]" />
                  Brand Identity DNA
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Define your mission, core values (simply tap presets), and brand personality.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Mission Statement *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. To simplify organic marketing"
                      value={data.mission}
                      onChange={(e) => updateData({ mission: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      USP (Unique Value Offer) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Schedule-free autopilot campaign flow"
                      value={data.usp}
                      onChange={(e) => updateData({ usp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none"
                    />
                  </div>
                </div>

                {/* Values presets grid */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Brand Values * (Tap to Select)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_VALUES.map((val) => {
                      const selected = (data.brandValues || []).includes(val);
                      return (
                        <button
                          key={val}
                          onClick={() => togglePresetValue(val)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                            ${selected
                              ? "bg-brand-dark text-white border-brand-dark"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  {/* Custom values text input */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Or add custom value..."
                      value={customValueInput}
                      onChange={(e) => setCustomValueInput(e.target.value)}
                      className="flex-1 px-4 py-1.5 rounded-lg border border-gray-200 focus:border-[#06B6D4] text-xs bg-white outline-none"
                    />
                    <button
                      onClick={() => {
                        if (customValueInput.trim()) {
                          const current = data.brandValues || [];
                          if (!current.includes(customValueInput.trim())) {
                            updateData({ brandValues: [...current, customValueInput.trim()] });
                          }
                          setCustomValueInput("");
                        }
                      }}
                      className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Personality selector */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Brand Personality *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BRAND_PERSONALITIES.map((bp) => (
                      <button
                        key={bp.id}
                        onClick={() => updateData({ brandPersonality: bp.id })}
                        className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5
                          ${data.brandPersonality === bp.id
                            ? "border-[#06B6D4] bg-[#06B6D4]/5 text-gray-900"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5
                          ${data.brandPersonality === bp.id ? "border-[#06B6D4]" : "border-gray-300"}`}>
                          {data.brandPersonality === bp.id && <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-950">{bp.label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{bp.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 3: Audience Focus & Pricing ─── */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#06B6D4]" />
                  Audience & Pricing
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Define your customer profile and select pricing structures using fast presets.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Target Audience *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Small business owners, marketing managers in startups"
                    value={data.targetAudience}
                    onChange={(e) => updateData({ targetAudience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none"
                  />
                </div>

                {/* Country Presets */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Country Focus *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COUNTRIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateData({ country: c })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                          ${data.country === c
                            ? "bg-brand-dark text-white border-brand-dark"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages Presets */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Languages *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_LANGUAGES.map((lang) => {
                      const selected = (data.languages || []).includes(lang);
                      return (
                        <button
                          key={lang}
                          onClick={() => toggleLanguage(lang)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                            ${selected
                              ? "bg-brand-dark text-white border-brand-dark"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Presets */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Pricing Model *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRICING_PRESETS.map((priceModel) => (
                      <button
                        key={priceModel}
                        onClick={() => updateData({ pricing: priceModel })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                          ${data.pricing === priceModel
                            ? "bg-brand-dark text-white border-brand-dark"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        {priceModel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 4: Channels & Objectives ─── */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#06B6D4]" />
                  Channels & Goal
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Connect target channels and specify your marketing objective to compile the autopilot profile.
                </p>
              </div>

              <div className="space-y-5">
                {/* Platform select cards */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Target Publishing Channels *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((plat) => {
                      const selected = (data.platforms || []).includes(plat.id);
                      return (
                        <button
                          key={plat.id}
                          onClick={() => {
                            const current = data.platforms || [];
                            const next = selected ? current.filter((p) => p !== plat.id) : [...current, plat.id];
                            updateData({ platforms: next });
                          }}
                          className={`text-left p-4 rounded-xl border transition-all flex items-center justify-between
                            ${selected
                              ? "border-[#06B6D4] bg-[#06B6D4]/5 text-gray-900"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-950">{plat.label}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{plat.desc}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all
                            ${selected ? "border-[#06B6D4] bg-[#06B6D4] text-white" : "border-gray-300"}`}>
                            {selected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Goals select list */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Primary Goal *
                  </label>
                  <div className="space-y-2.5">
                    {OBJECTIVES.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => updateData({ mainGoal: obj.id })}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3
                          ${data.mainGoal === obj.id
                            ? "border-[#06B6D4] bg-[#06B6D4]/5 text-gray-900"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center
                            ${data.mainGoal === obj.id ? "border-[#06B6D4]" : "border-gray-300"}`}>
                            {data.mainGoal === obj.id && <div className="w-2 h-2 rounded-full bg-[#06B6D4]" />}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{obj.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{obj.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-1 text-xs font-bold transition-all uppercase tracking-wider
                ${step === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-800"}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex items-center gap-1 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                  ${isStepValid()
                    ? "bg-brand-dark text-white hover:bg-brand-darkHover shadow-sm"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className={`flex items-center gap-1 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all text-white
                  ${isStepValid() && !isSubmitting
                    ? "bg-[#06B6D4] text-[#090D16] hover:bg-[#06B6D4]/95 shadow-sm"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
              >
                {isSubmitting ? "Generating strategy..." : "Complete Setup"}
                {!isSubmitting && <Check className="w-4 h-4" />}
              </button>
            )}
          </div>

        </div>
      </main>

      <footer className="px-6 py-4 text-center border-t border-gray-100 bg-white">
        <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1 font-semibold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-gray-300" />
          Secure 256-bit encryption · GDPR & DPDP compliant
        </p>
      </footer>

    </div>
  );
}
