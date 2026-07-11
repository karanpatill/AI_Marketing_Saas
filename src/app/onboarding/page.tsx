"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Sparkles,
  Building, Target, Shield, Compass,
  Laptop, Globe, Plus, Trash2, Tag, Key, Info, HelpCircle
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
  brandValues: [""],
  
  products: [""],
  services: [""],
  pricing: "",
  
  targetAudience: "",
  customerPersonas: "",
  country: "",
  languages: [""],
  
  platforms: [],
  competitors: [""],
  mainGoal: "",
};

const BRAND_PERSONALITIES = [
  { id: "professional", label: "Professional", desc: "Formal, authoritative, trustworthy, and expert" },
  { id: "casual", label: "Casual", desc: "Approachable, conversational, warm, and friendly" },
  { id: "bold", label: "Bold & Adventurous", desc: "Disruptive, energetic, high-impact, and daring" },
  { id: "playful", label: "Playful", desc: "Creative, witty, fun-loving, and humorous" },
];

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

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("automarc_onboarding_v2");
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
      localStorage.setItem("automarc_onboarding_v2", JSON.stringify(updated));
      return updated;
    });
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Step validation
  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          (data.brandName || "").trim().length > 0 &&
          (data.industry || "").trim().length > 0 &&
          (data.category || "").trim().length > 0 &&
          (data.businessDescription || "").trim().length > 0
        );
      case 2:
        return (
          (data.mission || "").trim().length > 0 &&
          (data.usp || "").trim().length > 0 &&
          data.brandPersonality !== "" &&
          (data.brandValues || []).filter(v => v.trim().length > 0).length > 0
        );
      case 3:
        return (
          (data.products.filter(p => p.trim().length > 0).length > 0 ||
           data.services.filter(s => s.trim().length > 0).length > 0) &&
          (data.pricing || "").trim().length > 0
        );
      case 4:
        return (
          (data.targetAudience || "").trim().length > 0 &&
          (data.country || "").trim().length > 0 &&
          (data.languages || []).filter(l => l.trim().length > 0).length > 0
        );
      case 5:
        return (data.platforms || []).length > 0;
      case 6:
        return data.mainGoal !== "";
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
        category: data.category,
        sub_category: data.subCategory || null,
        business_description: data.businessDescription,
        
        mission: data.mission,
        vision: data.vision || null,
        usp: data.usp,
        brand_personality: data.brandPersonality,
        brand_values: (data.brandValues || []).filter(v => v.trim().length > 0),
        
        products: (data.products || []).filter(p => p.trim().length > 0),
        services: (data.services || []).filter(s => s.trim().length > 0),
        pricing: data.pricing,
        
        target_audience: data.targetAudience,
        customer_personas: data.customerPersonas || null,
        country: data.country,
        languages: (data.languages || []).filter(l => l.trim().length > 0),
        
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

      localStorage.removeItem("automarc_onboarding_v2");
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      
      {/* Global Navbar */}
      <Navbar />

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-100 relative">
        <div
          className="h-full bg-brand-primary transition-all duration-300 ease-out"
          style={{ width: `${(step / 6) * 100}%` }}
        />
        <div className="absolute right-6 -top-5 text-[9px] font-bold text-gray-400 tracking-wider">
          STEP {step} OF 6
        </div>
      </div>

      {/* Onboarding Container */}
      <main className="flex-1 flex items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] w-full">

          {/* ─── Step 1: Company Profile ─── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-up">
              <div>

                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-brand-primary" />
                  Company Profile
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Tell us who you are and describe your business model.
                </p>
              </div>

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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://automarc.ai"
                    value={data.website}
                    onChange={(e) => updateData({ website: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Industry *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Marketing Automation, Retail"
                    value={data.industry}
                    onChange={(e) => updateData({ industry: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B2B SaaS"
                    value={data.category}
                    onChange={(e) => updateData({ category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Sub-category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Social Scheduler"
                    value={data.subCategory}
                    onChange={(e) => updateData({ subCategory: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Business Description *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what your company does and who you serve..."
                    value={data.businessDescription}
                    onChange={(e) => updateData({ businessDescription: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: Brand Identity ─── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-brand-primary" />
                  Brand DNA & Identity
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Define your mission, core values, USP, and personality tone.
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
                      placeholder="e.g. To democratize high-end marketing"
                      value={data.mission}
                      onChange={(e) => updateData({ mission: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Vision Statement
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Empowering 10M brands globally"
                      value={data.vision}
                      onChange={(e) => updateData({ vision: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Unique Selling Proposition (USP) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Autopilot brand generation setup in under 5 minutes"
                    value={data.usp}
                    onChange={(e) => updateData({ usp: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Brand Values * (Add at least one value)
                  </label>
                  <div className="space-y-2">
                    {(data.brandValues || []).map((val, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Absolute Trust, Radical Simplicity"
                          value={val}
                          onChange={(e) => {
                            const list = [...data.brandValues];
                            list[idx] = e.target.value;
                            updateData({ brandValues: list });
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                        />
                        {data.brandValues.length > 1 && (
                          <button
                            onClick={() => {
                              const list = data.brandValues.filter((_, i) => i !== idx);
                              updateData({ brandValues: list });
                            }}
                            className="px-3 text-red-500 hover:bg-red-50 border border-gray-200 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => updateData({ brandValues: [...data.brandValues, ""] })}
                      className="text-xs font-semibold text-brand-primary hover:underline"
                    >
                      + Add another value
                    </button>
                  </div>
                </div>

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
                            ? "border-brand-primary bg-brand-primary/5 text-gray-900"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5
                          ${data.brandPersonality === bp.id ? "border-brand-primary" : "border-gray-300"}`}>
                          {data.brandPersonality === bp.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
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

          {/* ─── Step 3: Offerings & Pricing ─── */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-brand-primary" />
                  Offerings & Pricing
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Specify products, services, and pricing model so we know how to write promotions.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Products
                  </label>
                  <div className="space-y-2">
                    {data.products.map((p, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Marketing Dashboard Pro"
                          value={p}
                          onChange={(e) => {
                            const list = [...data.products];
                            list[idx] = e.target.value;
                            updateData({ products: list });
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                        />
                        {data.products.length > 1 && (
                          <button
                            onClick={() => {
                              const list = data.products.filter((_, i) => i !== idx);
                              updateData({ products: list });
                            }}
                            className="px-3 text-red-500 hover:bg-red-50 border border-gray-200 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => updateData({ products: [...data.products, ""] })}
                      className="text-xs font-semibold text-brand-primary hover:underline"
                    >
                      + Add product
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Services
                  </label>
                  <div className="space-y-2">
                    {data.services.map((s, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Custom Automation Integration"
                          value={s}
                          onChange={(e) => {
                            const list = [...data.services];
                            list[idx] = e.target.value;
                            updateData({ services: list });
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                        />
                        {data.services.length > 1 && (
                          <button
                            onClick={() => {
                              const list = data.services.filter((_, i) => i !== idx);
                              updateData({ services: list });
                            }}
                            className="px-3 text-red-500 hover:bg-red-50 border border-gray-200 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => updateData({ services: [...data.services, ""] })}
                      className="text-xs font-semibold text-brand-primary hover:underline"
                    >
                      + Add service
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Pricing Model *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Subscription $49/mo, Custom Enterprise Quote"
                    value={data.pricing}
                    onChange={(e) => updateData({ pricing: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 4: Target Market ─── */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-brand-primary" />
                  Target Market & Audience
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Define who you sell to, their profile, country, and languages.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Target Audience Description *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Small business owners, marketing managers in startups"
                    value={data.targetAudience}
                    onChange={(e) => updateData({ targetAudience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Customer Personas (Describe briefly)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 'Rahul, 34, Startup Founder, struggles with posting daily because of busy schedule...'"
                    value={data.customerPersonas}
                    onChange={(e) => updateData({ customerPersonas: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Country Focus *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. India, United States, or Global"
                      value={data.country}
                      onChange={(e) => updateData({ country: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Languages *
                    </label>
                    <div className="space-y-2">
                      {data.languages.map((l, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. English, Hindi"
                            value={l}
                            onChange={(e) => {
                              const list = [...data.languages];
                              list[idx] = e.target.value;
                              updateData({ languages: list });
                            }}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                          />
                          {data.languages.length > 1 && (
                            <button
                              onClick={() => {
                                const list = data.languages.filter((_, i) => i !== idx);
                                updateData({ languages: list });
                              }}
                              className="px-3 text-red-500 hover:bg-red-50 border border-gray-200 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => updateData({ languages: [...data.languages, ""] })}
                        className="text-xs font-semibold text-brand-primary hover:underline"
                      >
                        + Add language
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 5: Channels & Competitors ─── */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-primary" />
                  Channels & Competitors
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Connect targets and add top competitor URLs for automated analysis.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Publishing Platforms *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((plat) => {
                      const selected = (data.platforms || []).includes(plat.id);
                      return (
                        <button
                          key={plat.id}
                          onClick={() => {
                            const currentPlatforms = data.platforms || [];
                            const nextPlats = selected
                              ? currentPlatforms.filter((p) => p !== plat.id)
                              : [...currentPlatforms, plat.id];
                            updateData({ platforms: nextPlats });
                          }}
                          className={`text-left p-4 rounded-xl border transition-all flex items-center justify-between
                            ${selected
                              ? "border-brand-primary bg-brand-primary/5 text-gray-900"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-950">{plat.label}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{plat.desc}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all
                            ${selected ? "border-brand-primary bg-brand-primary text-white" : "border-gray-300"}`}>
                            {selected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Competitors
                  </label>
                  <div className="space-y-2">
                    {data.competitors.map((comp, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. competitor.com"
                          value={comp}
                          onChange={(e) => {
                            const list = [...data.competitors];
                            list[idx] = e.target.value;
                            updateData({ competitors: list });
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm bg-white text-gray-900 transition-all outline-none"
                        />
                        {data.competitors.length > 1 && (
                          <button
                            onClick={() => {
                              const list = data.competitors.filter((_, i) => i !== idx);
                              updateData({ competitors: list });
                            }}
                            className="px-3 text-red-500 hover:bg-red-50 border border-gray-200 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {data.competitors.length < 3 && (
                      <button
                        onClick={() => updateData({ competitors: [...data.competitors, ""] })}
                        className="text-xs font-semibold text-brand-primary hover:underline"
                      >
                        + Add competitor ({data.competitors.length}/3)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 6: Goal Selection ─── */}
          {step === 6 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  Primary Goal
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  How should Automarc organize your marketing campaigns?
                </p>
              </div>

              <div className="space-y-2.5">
                {OBJECTIVES.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => updateData({ mainGoal: obj.id })}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3
                      ${data.mainGoal === obj.id
                        ? "border-brand-primary bg-brand-primary/5 text-gray-900"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center
                        ${data.mainGoal === obj.id ? "border-brand-primary" : "border-gray-300"}`}>
                        {data.mainGoal === obj.id && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
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
          )}

          {/* Navigation buttons */}
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

            {step < 6 ? (
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
                    ? "bg-brand-secondary text-[#090D16] hover:bg-brand-secondary/95 shadow-sm"
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

      {/* Security Footer */}
      <footer className="px-6 py-4 text-center border-t border-gray-100 bg-white">
        <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1 font-semibold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-gray-300" />
          Secure 256-bit encryption · GDPR & DPDP compliant
        </p>
      </footer>

    </div>
  );
}
