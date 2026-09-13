"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Sparkles, Send, Bot, User,
  Globe, Plus, Trash2, CheckCircle2,
  Image as ImageIcon, UploadCloud, Loader2, Play
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
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  productImages: string[];
  teamPhotos: string[];
  officeImages: string[];
  brandVideos: string[];
  fonts: string[];
  icons: string[];
  brandGuidelinesFile: string;
  approvedMoodboard: { id: string; name: string; tagline: string; imageUrl: string | null } | null;
};

const INITIAL_DATA: OnboardingData = {
  brandName: "", website: "", industry: "", category: "", subCategory: "", businessDescription: "",
  mission: "", vision: "", usp: "", brandPersonality: "", brandValues: [],
  primaryColor: "#0D0D0D", accentColor: "#C9A84C",
  products: [], services: [], pricing: "", targetAudience: "", customerPersonas: "", country: "", languages: [],
  platforms: [], competitors: [], mainGoal: "", logoUrl: "", productImages: [], teamPhotos: [], officeImages: [], brandVideos: [], fonts: [], icons: [], brandGuidelinesFile: "",
  approvedMoodboard: null,
};

const MOODBOARD_PRESETS = {
  option_1: { name: "Dark Premium", tagline: "Authoritative, high-end, exclusive", colors: ["#0D0D0D", "#C9A84C"] },
  option_2: { name: "Clean Minimal", tagline: "Approachable, transparent, modern", colors: ["#F3F4F6", "#5C6B57"] },
  option_3: { name: "Vibrant Digital", tagline: "Disruptive, energetic, neon", colors: ["#090D16", "#8B5CF6"] },
};

type ChatMessage = {
  id: string;
  role: "ai" | "user";
  type: "text" | "dna_card" | "logo_upload" | "moodboard_picker";
  content: string;
};

export default function ChatOnboarding() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputStr, setInputStr] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState<"url" | "dna" | "logo" | "moodboard" | "complete">("url");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Greeting
    setTimeout(() => {
      addMessage("ai", "text", "Welcome to Automarc. Let's build your autonomous marketing engine. To begin, what is your website URL? (e.g. lavivenzia.com)");
    }, 500);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (role: "ai" | "user", type: ChatMessage["type"], content: string) => {
    setMessages(prev => [...prev, { id: Math.random().toString(), role, type, content }]);
  };

  const handleSend = async () => {
    if (!inputStr.trim()) return;
    const userText = inputStr.trim();
    setInputStr("");
    addMessage("user", "text", userText);

    if (step === "url") {
      setIsTyping(true);
      setStep("dna");
      try {
        const response = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: userText }),
        });
        
        let scraped = null;
        if (response.ok) {
          scraped = await response.json();
        }

        const newData = {
          ...data,
          brandName: scraped?.brandName || userText.split(".")[0],
          website: userText,
          industry: scraped?.industry || "Technology",
          businessDescription: scraped?.businessDescription || "A modern brand.",
          mission: scraped?.mission || "To deliver excellence.",
          targetAudience: scraped?.targetAudience || "General consumers",
        };
        setData(newData);

        addMessage("ai", "text", `Awesome. I scanned ${userText} and extracted your Brand DNA.`);
        setTimeout(() => {
          addMessage("ai", "dna_card", "");
          setIsTyping(false);
        }, 800);
      } catch (e) {
        setIsTyping(false);
        addMessage("ai", "text", "I couldn't reach that website, but that's okay. Let's proceed manually. Check out your basic Brand DNA below.");
        addMessage("ai", "dna_card", "");
      }
    }
  };

  const handleApproveDna = () => {
    addMessage("user", "text", "DNA looks perfect. Let's continue.");
    setStep("logo");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "text", "Great. Next, I need your primary brand logo so we can watermark your content automatically.");
      addMessage("ai", "logo_upload", "");
    }, 1000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingLogo(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('brand-assets').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('brand-assets').getPublicUrl(filePath);
      
      setData(prev => ({ ...prev, logoUrl: publicUrlData.publicUrl }));
      setUploadingLogo(false);

      addMessage("user", "text", "Logo uploaded successfully.");
      setStep("moodboard");
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage("ai", "text", "Got it. Finally, choose a visual direction for your AI-generated posts.");
        addMessage("ai", "moodboard_picker", "");
      }, 1000);
    } catch (err) {
      setUploadingLogo(false);
      alert("Upload failed.");
    }
  };

  const handleSelectMoodboard = (key: string, mood: any) => {
    setData(prev => ({ ...prev, approvedMoodboard: { id: key, name: mood.name, tagline: mood.tagline, imageUrl: null } }));
    addMessage("user", "text", `I select ${mood.name}.`);
    setStep("complete");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "text", "Perfect. Your autonomous marketing engine is ready to deploy. Click below to initialize your workspace.");
    }, 1000);
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();
      let workspaceId = null;
      let orgIdForWs = null;

      if (user) {
        try {
          const wsRes = await fetch("/api/workspace");
          if (wsRes.ok) {
            const dataRes = await wsRes.json();
            if (dataRes.organizations && dataRes.organizations.length > 0) {
              orgIdForWs = dataRes.organizations[0].orgId;
            }
          }
        } catch (err) {}
        if (!orgIdForWs) {
          try {
            const initRes = await fetch("/api/workspace/init", { method: "POST" });
            if (initRes.ok) {
              const initData = await initRes.json();
              orgIdForWs = initData.orgId;
            }
          } catch (err) {}
        }
        if (orgIdForWs) {
          try {
            const createWsRes = await fetch("/api/workspace", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orgId: orgIdForWs, name: data.brandName || "My Brand" })
            });
            if (createWsRes.ok) {
              const newWs = await createWsRes.json();
              workspaceId = newWs.data.id;
            }
          } catch (err) {}
        }
      }

      if (!workspaceId) {
        alert("Failed to initialize workspace.");
        setIsSubmitting(false);
        return;
      }

      const brandRes = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspaceId,
          name: data.brandName,
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
          country: data.country,
          languages: data.languages,
          competitors: data.competitors,
          platforms: data.platforms || [],
          main_goal: data.mainGoal,
          approved_moodboard: data.approvedMoodboard || null,
        })
      });
      
      const dnaResult = await brandRes.json();
      if (!dnaResult || !dnaResult.id) throw new Error("DNA fail");

      await supabase.from("brand_assets").insert({
        brand_dna_id: dnaResult.id,
        logo_url: data.logoUrl || "",
        logo_studio_data: { uploadUrl: data.logoUrl || "", colors: { primaryHex: data.primaryColor, secondaryHex: data.accentColor } }
      });

      await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandDnaId: dnaResult.id })
      });

      router.push(`/dashboard/${workspaceId}`);
    } catch (err) {
      alert("Setup failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col font-sans text-white">
      <Navbar />
      <div className="flex-1 overflow-hidden flex flex-col max-w-3xl mx-auto w-full pt-10">
        
        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-32 space-y-8 scroll-smooth hide-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-brand-secondary/20 flex items-center justify-center mr-3 mt-1 shrink-0">
                  <Sparkles className="w-4 h-4 text-brand-secondary" />
                </div>
              )}
              
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-[#1C1C1C] border border-[#2A2A2A] text-white px-5 py-3 rounded-2xl rounded-tr-sm' : ''}`}>
                
                {msg.type === "text" && (
                  <p className={`${msg.role === 'ai' ? 'text-[15px] leading-relaxed text-[#E1E0CC]' : 'text-sm'}`}>
                    {msg.content}
                  </p>
                )}

                {msg.type === "dna_card" && (
                  <div className="bg-[#101010] border border-[#2A2A2A] p-6 rounded-2xl mt-2 w-full shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">DNA Extracted</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Brand Name</label>
                        <input className="w-full bg-transparent border-b border-[#2A2A2A] focus:border-brand-secondary outline-none py-1 text-sm text-white" value={data.brandName} onChange={e => setData({...data, brandName: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Mission</label>
                        <textarea className="w-full bg-transparent border-b border-[#2A2A2A] focus:border-brand-secondary outline-none py-1 text-sm text-white resize-none" value={data.mission} onChange={e => setData({...data, mission: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Target Audience</label>
                        <input className="w-full bg-transparent border-b border-[#2A2A2A] focus:border-brand-secondary outline-none py-1 text-sm text-white" value={data.targetAudience} onChange={e => setData({...data, targetAudience: e.target.value})} />
                      </div>
                    </div>
                    {step === "dna" && (
                      <button onClick={handleApproveDna} className="mt-6 w-full py-3 bg-[#E1E0CC] hover:bg-white text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        Approve & Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {msg.type === "logo_upload" && (
                  <div className="bg-[#101010] border border-[#2A2A2A] p-6 rounded-2xl mt-2 w-full flex flex-col items-center justify-center min-h-[160px]">
                    {data.logoUrl ? (
                      <div className="text-center">
                        <img src={data.logoUrl} alt="Logo" className="w-20 h-20 object-contain mx-auto mb-3" />
                        <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 justify-center"><CheckCircle2 className="w-4 h-4"/> Logo Saved</span>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center cursor-pointer ${uploadingLogo ? 'opacity-50' : ''}`}>
                        <div className="w-12 h-12 rounded-full bg-[#1C1C1C] flex items-center justify-center mb-3">
                          {uploadingLogo ? <Loader2 className="w-5 h-5 animate-spin text-brand-secondary" /> : <UploadCloud className="w-5 h-5 text-gray-400" />}
                        </div>
                        <span className="text-xs font-bold text-gray-400">Click to upload logo (SVG/PNG)</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                      </label>
                    )}
                  </div>
                )}

                {msg.type === "moodboard_picker" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 w-[600px] max-w-full">
                    {Object.entries(MOODBOARD_PRESETS).map(([key, mood]) => (
                      <div key={key} onClick={() => step === "moodboard" && handleSelectMoodboard(key, mood)} className={`p-4 rounded-xl border transition-all ${step === "moodboard" ? 'cursor-pointer hover:border-brand-secondary border-[#2A2A2A] bg-[#101010]' : 'border-[#2A2A2A] bg-[#101010] opacity-50'}`}>
                        <div className="flex gap-1 mb-3">
                          <div className="w-4 h-4 rounded-full" style={{ background: mood.colors[0] }}></div>
                          <div className="w-4 h-4 rounded-full" style={{ background: mood.colors[1] }}></div>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{mood.name}</h4>
                        <p className="text-[10px] text-gray-500">{mood.tagline}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-up">
              <div className="w-8 h-8 rounded-full bg-brand-secondary/20 flex items-center justify-center mr-3 shrink-0">
                <Sparkles className="w-4 h-4 text-brand-secondary animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-3">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="flex justify-center mt-10">
               <button onClick={handleSubmitAll} disabled={isSubmitting} className="px-8 py-4 bg-brand-secondary hover:bg-[#b59543] text-black text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                 {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin"/> Compiling Engine...</> : <><Play className="w-4 h-4 fill-black"/> Initialize Automarc</>}
               </button>
            </div>
          )}
        </div>

        {/* Input Area */}
        {step === "url" && (
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent">
            <div className="max-w-3xl mx-auto relative">
              <input
                type="text"
                placeholder="Enter your website URL or describe your business..."
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] focus:border-brand-secondary outline-none text-white px-6 py-4 rounded-2xl pr-14 shadow-2xl"
                value={inputStr}
                onChange={e => setInputStr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-secondary text-black rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
