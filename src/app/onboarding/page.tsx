"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Sparkles,
  Building, Target, Shield, ShieldCheck, Compass,
  Laptop, Globe, Plus, Trash2, Tag, Key, Info, HelpCircle,
  Loader2, Search, CheckCircle2, ChevronRight, Zap,
  Image as ImageIcon, FileText, Video, Type, Paintbrush,
  Layers, UploadCloud, Eye, Users, Palette, X, AlertTriangle
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

  // Color Palette Selection
  primaryColor: string;
  accentColor: string;

  // Brand Identity Studio
  logoUrl: string;
  productImages: string[];
  teamPhotos: string[];
  officeImages: string[];
  brandVideos: string[];
  fonts: string[];
  icons: string[];
  brandGuidelinesFile: string;

  // Moodboard Studio — user picks one of 3 preset options
  approvedMoodboard: { id: string; name: string; tagline: string; imageUrl: string | null } | null;
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

  // Color Palette Defaults
  primaryColor: "#0D0D0D",
  accentColor: "#C9A84C",
  
  products: [],
  services: [],
  pricing: "",
  
  targetAudience: "",
  customerPersonas: "",
  country: "",
  languages: [],
  
  platforms: [],
  competitors: [],
  mainGoal: "",

  // Brand Identity Studio defaults
  logoUrl: "",
  productImages: [],
  teamPhotos: [],
  officeImages: [],
  brandVideos: [],
  fonts: [],
  icons: [],
  brandGuidelinesFile: "",

  // Moodboard Studio defaults
  approvedMoodboard: null,
};

const PRESET_COLOR_PALETTES = [
  { name: "Gold & Obsidian", primary: "#0D0D0D", accent: "#C9A84C" },
  { name: "Navy & Gold", primary: "#0A192F", accent: "#D4AF37" },
  { name: "Sage & Charcoal", primary: "#2A2B2E", accent: "#A3B19B" },
  { name: "Midnight & Cyan", primary: "#090D16", accent: "#00F0FF" },
  { name: "Royal Violet", primary: "#1E1B4B", accent: "#8B5CF6" },
  { name: "Emerald & Mint", primary: "#064E3B", accent: "#10B981" },
  { name: "Monochrome Bold", primary: "#000000", accent: "#64748B" },
  { name: "Sunset Terracotta", primary: "#1C1917", accent: "#F97316" }
];




// Preset lists to avoid manual typing
const PRESET_VALUES = [
  "Innovation", "Trust & Integrity", "Simplicity", "Customer First", 
  "Eco-Friendly", "Premium Quality", "Accessibility", "Boldness", 
  "Transparency", "Data-Driven", "Community Focus", "Security"
];

const PRESET_LANGUAGES = [
  "English", "Hindi", "Spanish", "German", "French", "Japanese", "Arabic", 
  "Mandarin", "Portuguese", "Russian", "Italian", "Korean", "Dutch", 
  "Turkish", "Vietnamese", "Swedish", "Polish", "Indonesian"
];

const PRESET_COUNTRIES = [
  "Global", "India", "United States", "United Kingdom", "Canada", "Germany", 
  "Singapore", "Australia", "United Arab Emirates", "France", "Japan", 
  "Brazil", "Netherlands", "South Africa", "Saudi Arabia", "Mexico", 
  "Italy", "Spain", "Switzerland", "Sweden", "South Korea"
];

const BRAND_PERSONALITIES = [
  { id: "professional", label: "Professional", desc: "Formal, authoritative, trustworthy, and expert" },
  { id: "casual", label: "Casual", desc: "Approachable, conversational, warm, and friendly" },
  { id: "bold", label: "Bold & Adventurous", desc: "Disruptive, energetic, high-impact, and daring" },
  { id: "playful", label: "Playful", desc: "Creative, witty, fun-loving, and humorous" },
  { id: "elegant", label: "Elegant & Luxury", desc: "Sophisticated, exclusive, high-end, and prestigious" },
  { id: "minimalist", label: "Minimalist & Clean", desc: "Simple, honest, transparent, and essential" },
  { id: "tech", label: "Innovative & Tech-Forward", desc: "Futuristic, visionary, analytical, and advanced" },
  { id: "traditional", label: "Traditional & Heritage", desc: "Classic, established, stable, and historic" },
];

const PRICING_PRESETS = [
  "Subscription / SaaS", 
  "One-Time Purchase", 
  "Usage-Based / Credits", 
  "Free / Ad-Supported", 
  "Enterprise / Custom Quote",
  "Freemium (Free + Paid Tier)",
  "Tiered Flat Rate",
  "Commission / Transaction Fee",
  "Licensing / Royalty Model"
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

const MOODBOARD_PRESETS: Record<string, {
  colors: { name: string; hex: string }[];
  gradients: { name: string; style: string }[];
  typography: { headline: string; body: string; desc: string };
  essence: string[];
  summary: string;
  imageryTags: string[];
  themeClass: string;
  themeTitleColor: string;
  themeBg: string;
}> = {
  option_1: {
    colors: [
      { name: "Gold Leaf", hex: "#C9A84C" },
      { name: "Obsidian", hex: "#0D0D0D" },
      { name: "Champagne", hex: "#F5E6C4" },
      { name: "Charcoal", hex: "#1A1A1A" },
      { name: "Bronze", hex: "#8C6D39" },
      { name: "Ivory", hex: "#FFFFFA" }
    ],
    gradients: [
      { name: "Metallic Gold", style: "linear-gradient(135deg, #C9A84C 0%, #F5E6C4 50%, #8C6D39 100%)" },
      { name: "Deep Charcoal", style: "linear-gradient(135deg, #0D0D0D 0%, #1E1E1E 100%)" }
    ],
    typography: {
      headline: "Cinzel",
      body: "Montserrat",
      desc: "Cinzel is an elegant, editorial serif conveying heritage, exclusivity, and prestige. Montserrat provides high-contrast clean geometric details."
    },
    essence: ["HERITAGE", "EXCLUSIVITY", "ELEGANCE", "INNOVATION"],
    summary: "Dark Premium delivers an authoritative, high-end aesthetic. Dominated by obsidian shades and gold accents, this direction positions the brand in the luxury tier of high-growth enterprises.",
    imageryTags: ["Luxurious", "Timeless", "Exclusive", "Experiential"],
    themeClass: "bg-[#090A0C] text-[#E4E4E7] border-[#1F2937]",
    themeTitleColor: "text-[#C9A84C]",
    themeBg: "#090A0C"
  },
  option_2: {
    colors: [
      { name: "Sage Green", hex: "#A3B19B" },
      { name: "Warm Off-White", hex: "#F8F7F4" },
      { name: "Graphite", hex: "#2A2B2E" },
      { name: "Sand", hex: "#E3DFD5" },
      { name: "Moss", hex: "#5C6B57" },
      { name: "Slate", hex: "#7E848C" }
    ],
    gradients: [
      { name: "Sage Grass", style: "linear-gradient(135deg, #A3B19B 0%, #E3DFD5 100%)" },
      { name: "Linen White", style: "linear-gradient(135deg, #F8F7F4 0%, #E3DFD5 100%)" }
    ],
    typography: {
      headline: "Playfair Display",
      body: "Inter",
      desc: "Playfair Display brings warm, contemporary editorial grace. Inter offsets it with pure, clean neutral lines, creating an atmosphere of balance, clarity, and transparency."
    },
    essence: ["SIMPLICITY", "TRANSPARENCY", "QUALITY", "BALANCE"],
    summary: "Clean Minimal uses organic textures and generous whitespace. It communicates approachability, focus, and modern design, suitable for customer-first enterprises.",
    imageryTags: ["Natural", "Calm", "Organic", "Aspirational"],
    themeClass: "bg-[#F3F4F6] text-[#E1E0CC] border-[#E1E0CC]/20",
    themeTitleColor: "text-[#5C6B57]",
    themeBg: "#F3F4F6"
  },
  option_3: {
    colors: [
      { name: "Electric Cyan", hex: "#0A0A0A" },
      { name: "Deep Space", hex: "#090D16" },
      { name: "Neon Violet", hex: "#8B5CF6" },
      { name: "Vivid Magenta", hex: "#EC4899" },
      { name: "Electric Blue", hex: "#3B82F6" },
      { name: "White Glow", hex: "#FFFFFF" }
    ],
    gradients: [
      { name: "Neon Glow", style: "linear-gradient(135deg, #0A0A0A 0%, #8B5CF6 50%, #EC4899 100%)" },
      { name: "Space Dark", style: "linear-gradient(135deg, #090D16 0%, #1E293B 100%)" }
    ],
    typography: {
      headline: "Outfit",
      body: "Inter",
      desc: "Outfit is a modern, geometric tech-oriented sans-serif with rounded, futuristic terminals. Inter provides clean, readable body typography."
    },
    essence: ["FUTURE-FORWARD", "ENERGY", "DISRUPTION", "AGILITY"],
    summary: "Vibrant Digital embraces saturated neon gradients and futuristic glassmorphic UI cards. Perfect for digital-native products requiring dynamic energy and high impact.",
    imageryTags: ["Dynamic", "Futuristic", "High-Contrast", "Vivid"],
    themeClass: "bg-[#030712] text-[#C7D2FE] border-[#1E1B4B]",
    themeTitleColor: "text-[#0A0A0A]",
    themeBg: "#030712"
  }
};

export default function OnboardingPage() {
  const router = useRouter();
  const formatFetchError = (errStr: string | null | undefined) => {
    if (!errStr) return "Failed to execute request.";
    const s = errStr.toLowerCase();
    if (s.includes("fetch failed") || s.includes("timeout") || s.includes("connect")) {
      return "Network connection issue: The server was unable to reach the external API. Please check your internet connection or turn off/configure your VPN/firewall to allow outgoing requests.";
    }
    return errStr;
  };
  const getPersonalityFont = (personality: string) => {
    const p = (personality || "").toLowerCase();
    if (p.includes("elegant") || p.includes("luxury") || p.includes("classic") || p.includes("prestige")) {
      return { 
        name: "Cinzel", 
        family: "'Cinzel', serif", 
        import: "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');",
        textStyle: "tracking-[0.15em] font-black uppercase text-sm"
      };
    }
    if (p.includes("bold") || p.includes("disruptive") || p.includes("energy") || p.includes("creative")) {
      return { 
        name: "Syne", 
        family: "'Syne', sans-serif", 
        import: "@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');",
        textStyle: "tracking-wider font-extrabold uppercase text-sm"
      };
    }
    if (p.includes("minimalist") || p.includes("clean") || p.includes("simple")) {
      return { 
        name: "Montserrat", 
        family: "'Montserrat', sans-serif", 
        import: "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;400;700&display=swap');",
        textStyle: "tracking-[0.2em] font-light uppercase text-xs"
      };
    }
    // Default/Modern/Tech: Outfit
    return { 
      name: "Outfit", 
      family: "'Outfit', sans-serif", 
      import: "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&display=swap');",
      textStyle: "tracking-widest font-black uppercase text-sm"
    };
  };
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Autofill / Upload Loading States
  const [scanningUrl, setScanningUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [customValueInput, setCustomValueInput] = useState("");
  const [newProductInput, setNewProductInput] = useState("");
  const [newServiceInput, setNewServiceInput] = useState("");
  const [newCompetitorInput, setNewCompetitorInput] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // ── Brand Logo Studio: Color Decision ──
  const [userPrimaryColor, setUserPrimaryColor] = useState("#0F172A");
  const [userSecondaryColor, setUserSecondaryColor] = useState("#0A0A0A");

  // ── Moodboard Studio — inspect modal ──
  const [inspectingMoodboard, setInspectingMoodboard] = useState<{ id: string; name: string; tagline: string; imageUrl: string | null } | null>(null);

  // ── Tagline Generator ──
  const [isGeneratingTaglines, setIsGeneratingTaglines] = useState(false);
  const [taglineSuggestions, setTaglineSuggestions] = useState<string[]>([]);
  const [taglineError, setTaglineError] = useState<string | null>(null);
  const [showTaglinePicker, setShowTaglinePicker] = useState(false);
  const [hasTagline, setHasTagline] = useState<"yes" | "no" | null>(null);

  useEffect(() => {
    // Wipe stale keys from all old schema versions
    ["automarc_onboarding_v1", "automarc_onboarding_v2", "automarc_onboarding_v3", "automarc_onboarding_v4", "automarc_onboarding_v5"].forEach(
      (k) => localStorage.removeItem(k)
    );
    const saved = localStorage.getItem("automarc_onboarding_v6");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.brandName && parsed.brandName.trim().length > 0) {
          setData(parsed);
          if (parsed.usp && parsed.usp.trim().length > 0) {
            setHasTagline("yes");
          }
        } else {
          setData(INITIAL_DATA);
        }
      } catch (e) {
        console.error(e);
        localStorage.removeItem("automarc_onboarding_v6");
        setData(INITIAL_DATA);
      }
    } else {
      setData(INITIAL_DATA);
    }
  }, []);

  // Sync to localStorage
  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => {
      const updated = { ...prev, ...fields };
      localStorage.setItem("automarc_onboarding_v6", JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetCache = () => {
    if (window.confirm("Are you sure you want to clear your local onboarding draft cache and start a fresh brand?")) {
      localStorage.removeItem("automarc_onboarding_v6");
      setData(INITIAL_DATA);
      setStep(1);
      window.location.reload();
    }
  };

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };


  // Real Website Crawler & Brand DNA Generator
  const runAiScanner = async () => {
    if (!scanningUrl.trim()) return;
    setIsScanning(true);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: scanningUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to scan website");
      }

      const scraped = await response.json();

      updateData({
        brandName: scraped.brandName || "",
        website: scraped.website || "",
        industry: scraped.industry || "Technology",
        category: scraped.category || "",
        subCategory: scraped.subCategory || "",
        businessDescription: scraped.businessDescription || "",
        mission: scraped.mission || "",
        vision: scraped.vision || "",
        usp: scraped.usp || "",
        brandValues: scraped.brandValues || [],
        products: scraped.products || [],
        services: scraped.services || [],
        customerPersonas: scraped.customerPersonas || "",
        competitors: scraped.competitors || [],
      });
    } catch (e) {
      console.error(e);
      alert("Could not extract details. Please enter manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateTaglines = async () => {
    setIsGeneratingTaglines(true);
    setTaglineError(null);
    setShowTaglinePicker(true);
    try {
      const res = await fetch("/api/generate-taglines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: data.brandName,
          industry: data.industry,
          businessDescription: data.businessDescription,
          brandPersonality: Array.isArray(data.brandPersonality)
            ? (data.brandPersonality as string[]).join(", ")
            : String(data.brandPersonality || "Professional"),
          brandValues: Array.isArray(data.brandValues) ? data.brandValues : [],
          mission: data.mission,
          targetAudience: data.targetAudience,
          existingTagline: data.usp,
        }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setTaglineSuggestions(result.taglines || []);
    } catch (e: any) {
      setTaglineError(e.message || "Failed to generate taglines");
    } finally {
      setIsGeneratingTaglines(false);
    }
  };

  // Real file upload to Supabase Storage
  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadingField(field);

    try {
      const { supabase } = await import("@/lib/supabase");
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from("brand-assets")
        .upload(filePath, file);

      if (error) {
        console.error("Storage upload error:", error);
        alert(`Upload failed: ${error.message}`);
        setUploadingField(null);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      if (field === "logo") {
        updateData({ logoUrl: publicUrl });
      } else if (field === "guidelines") {
        updateData({ brandGuidelinesFile: publicUrl });
      } else {
        const currentList = (data as any)[field] || [];
        updateData({ [field]: [...currentList, publicUrl] });
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploadingField(null);
    }
  };

  const removeUploadedFile = (field: string, index?: number) => {
    if (field === "logo") {
      updateData({ logoUrl: "" });
    } else if (field === "guidelines") {
      updateData({ brandGuidelinesFile: "" });
    } else {
      const currentList = (data as any)[field] || [];
      const updated = currentList.filter((_: any, i: number) => i !== index);
      updateData({ [field]: updated });
    }
  };

  const isPersonalitySelected = (id: string) => {
    if (!data.brandPersonality) return false;
    const list = data.brandPersonality.split(",").map(s => s.trim()).filter(Boolean);
    return list.includes(id);
  };

  const toggleBrandPersonality = (id: string) => {
    const currentList = data.brandPersonality 
      ? data.brandPersonality.split(",").map(s => s.trim()).filter(Boolean)
      : [];
    let newList: string[];
    if (currentList.includes(id)) {
      newList = currentList.filter(item => item !== id);
    } else {
      newList = [...currentList, id];
    }
    if (newList.length === 0) {
      newList = ["professional"];
    }
    updateData({ brandPersonality: newList.join(", ") });
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
      case 5:
        return (data.logoUrl || "").trim().length > 0;
      case 6:
        // Moodboard Studio â€” must approve one moodboard
        return data.approvedMoodboard !== null;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      
      // Get current user and default workspace
      const { data: { user } } = await supabase.auth.getUser();
      let workspaceId = null;
      let orgIdForWs = null;

      if (user) {
        // Step 1: Ensure the user belongs to an org. If not, auto-create one.
        try {
          const wsRes = await fetch("/api/workspace");
          if (wsRes.ok) {
            const dataRes = await wsRes.json();
            if (dataRes.organizations && dataRes.organizations.length > 0) {
              orgIdForWs = dataRes.organizations[0].orgId;
            }
          }
        } catch (err) {
          console.error("Failed to fetch workspaces from API", err);
        }

        // No org found — auto-create one for this new user
        if (!orgIdForWs) {
          try {
            const initRes = await fetch("/api/workspace/init", { method: "POST" });
            if (initRes.ok) {
              const initData = await initRes.json();
              orgIdForWs = initData.orgId;
            } else {
              const errText = await initRes.text();
              console.error("Failed to initialize organization:", errText);
            }
          } catch (err) {
            console.error("Failed to call /api/workspace/init", err);
          }
        }

        // Step 2: Create a workspace inside that org
        if (orgIdForWs) {
          try {
            const createWsRes = await fetch("/api/workspace", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orgId: orgIdForWs, name: data.brandName })
            });
            if (createWsRes.ok) {
              const newWs = await createWsRes.json();
              workspaceId = newWs.data.id;
            }
          } catch (err) {
            console.error("Failed to create workspace", err);
          }
        }
      }

      if (!workspaceId) {
        alert("Failed to initialize workspace. Please ensure you belong to an organization.");
        setIsSubmitting(false);
        return;
      }

      // TRANSACTION STEP 1: Insert Brand DNA profile (Via Backend API to ensure AI design language assignment)
      let dnaResult;
      try {
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
            customer_personas: data.customerPersonas || null,
            country: data.country,
            languages: data.languages,
            competitors: (data.competitors || []).filter(c => c.trim().length > 0),
            platforms: data.platforms || [],
            main_goal: data.mainGoal,
            approved_moodboard: data.approvedMoodboard || null,
          })
        });

        if (!brandRes.ok) {
          const errorText = await brandRes.text();
          throw new Error(errorText || "Failed to create brand via API");
        }
        dnaResult = await brandRes.json();
      } catch (dnaError: any) {
        console.error("Database DNA insert error via API:", dnaError);
        alert(`Failed to save Brand DNA profile. Error: ${dnaError?.message || 'Unknown database error'} (Workspace: ${workspaceId})`);
        setIsSubmitting(false);
        return;
      }

      // Check if we successfully got dnaResult
      if (!dnaResult || !dnaResult.id) {
        console.error("No DNA result returned from API");
        alert(`Failed to save Brand DNA profile. (Workspace: ${workspaceId})`);
        setIsSubmitting(false);
        return;
      }

      // TRANSACTION STEP 2: Insert Brand Assets linked to DNA ID
      const { error: assetsError } = await supabase.from("brand_assets").insert({
        brand_dna_id: dnaResult.id,
        logo_url: data.logoUrl || "",
        product_images: data.productImages,
        team_photos: data.teamPhotos,
        office_images: data.officeImages,
        brand_videos: data.brandVideos,
        fonts: data.fonts,
        icons: data.icons,
        brand_guidelines: data.brandGuidelinesFile || "",
        logo_studio_data: {
          uploadUrl: data.logoUrl || "",
          colors: {
            primaryHex: data.primaryColor || "#0D0D0D",
            secondaryHex: data.accentColor || "#DEDBC8",
          }
        },
      });

      if (assetsError) {
        console.error("Database Assets insert error:", assetsError);
        alert("Failed to save Brand Studio assets. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // TRANSACTION STEP 3: Auto-trigger initial 30-day strategy & content-mix recommendations
      try {
        await fetch("/api/strategy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandDnaId: dnaResult.id })
        });
        await fetch("/api/content-mix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandDnaId: dnaResult.id, action: "generate" })
        });
      } catch (err) {
        console.error("Failed to compile initial marketing strategy:", err);
      }

      localStorage.removeItem("automarc_onboarding_v6");
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#E1E0CC] flex flex-col justify-between">
      <Navbar />

      {/* Top Bar with Back Link & Progress */}
      <div className="w-full bg-[#000000] border-b border-[#E1E0CC]/10 px-6 py-3 flex items-center justify-between">
        <a 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E1E0CC]/60 hover:text-[#E1E0CC] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </a>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetCache}
            className="text-[10px] font-mono text-[#E1E0CC]/70 hover:text-[#E1E0CC]/70 hover:underline tracking-wider uppercase transition-colors"
          >
            Clear Cache & Reset
          </button>
          <span className="text-[10px] font-mono text-[#E1E0CC]/20">|</span>
          <div className="text-[10px] font-mono text-[#DEDBC8] tracking-widest uppercase">
            STEP {step} OF 7
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[#1c1e21] relative">
        <div
          className="h-full bg-[#DEDBC8] transition-all duration-300 ease-out"
          style={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center p-6 max-w-4xl mx-auto w-full">
        <div className="bg-[#101010] border border-[#E1E0CC]/10 rounded-2xl p-8 shadow-2xl w-full text-[#E1E0CC]">

          {/* â”€â”€â”€ Step 1: Magic Website Crawler / Manual Profile â”€â”€â”€ */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#0A0A0A] fill-[#0A0A0A]/10" />
                  Magic Autofill DNA
                </h2>
                <p className="text-xs text-[#E1E0CC]/40 mt-1">
                  Enter your website URL. Our AI engine will auto-scan your product info, values, pricing models, and target audience setup instantly!
                </p>
              </div>

              {/* Crawler Bar */}
              <div className="p-5 bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)]/80 rounded-2xl space-y-4">
                <label className="block text-xs font-bold text-[#ffffff]/80 uppercase tracking-[0.2em]">
                  Company Website URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#E1E0CC]/40 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. mybrand.com"
                      disabled={isScanning}
                      value={scanningUrl}
                      onChange={(e) => setScanningUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E1E0CC]/5 focus:border-[#E1E0CC]/20 focus:bg-black text-sm bg-[#1c1e21] text-[#ffffff] outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={runAiScanner}
                    disabled={!scanningUrl.trim() || isScanning}
                    className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-[#E1E0CC]/5 shadow-none
                      enabled:bg-[#1c1e21] enabled:text-[#ffffff] enabled:hover:bg-black enabled:hover:border-[#E1E0CC]/15
                      disabled:bg-[#1c1e21]/50 disabled:text-[#ffffff]/30 disabled:cursor-not-allowed"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        Scan Site
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t border-[#E1E0CC]/10 pt-5 space-y-4">
                <p className="text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-widest">Verify / Edit Details</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Automarc"
                      value={data.brandName}
                      onChange={(e) => updateData({ brandName: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-[#E1E0CC]/5 focus:border-[#E1E0CC]/20 focus:bg-black text-sm bg-[#1c1e21] text-[#ffffff] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Website URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://mybrand.com"
                      value={data.website}
                      onChange={(e) => {
                        updateData({ website: e.target.value });
                        // sync scanningUrl too
                        setScanningUrl(e.target.value);
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-[#E1E0CC]/5 focus:border-[#E1E0CC]/20 focus:bg-black text-sm bg-[#1c1e21] text-[#ffffff] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Industry *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SaaS, E-Commerce, Retail"
                      value={data.industry}
                      onChange={(e) => updateData({ industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-[#E1E0CC]/5 focus:border-[#E1E0CC]/20 focus:bg-black text-sm bg-[#1c1e21] text-[#ffffff] outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AI Content"
                        value={data.category}
                        onChange={(e) => updateData({ category: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-[#E1E0CC]/5 focus:border-[#E1E0CC]/20 focus:bg-black text-sm bg-[#1c1e21] text-[#ffffff] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                        Sub-Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Social Autopilot"
                        value={data.subCategory}
                        onChange={(e) => updateData({ subCategory: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#E1E0CC]/15 focus:border-[#E1E0CC] text-sm bg-[#101010] text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Business Description *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Briefly describe what your company does..."
                      value={data.businessDescription}
                      onChange={(e) => updateData({ businessDescription: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#E1E0CC]/15 focus:border-[#E1E0CC] text-sm bg-[#101010] text-white resize-none outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€â”€ Step 2: Brand Identity & Values â”€â”€â”€ */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#0A0A0A]" />
                  Brand Identity DNA
                </h2>
                <p className="text-xs text-[#E1E0CC]/40 mt-1">
                  Define your mission, core values (simply tap presets), and brand personality.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Mission Statement *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. To simplify organic marketing"
                      value={data.mission}
                      onChange={(e) => updateData({ mission: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#E1E0CC]/15 focus:border-[#E1E0CC] text-sm bg-[#101010] text-white outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Vision Statement
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. To become the leading autopilot engine globally"
                      value={data.vision}
                      onChange={(e) => updateData({ vision: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#E1E0CC]/15 focus:border-[#E1E0CC] text-sm bg-[#101010] text-white outline-none resize-none"
                    />
                  </div>

                  {/* ── Brand Tagline / USP — Choice toggle ── */}
                  <div className="md:col-span-2 space-y-4 border-t border-[#E1E0CC]/10 pt-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider">
                        Do you already have a brand tagline or USP? *
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setHasTagline("yes");
                            setShowTaglinePicker(false);
                          }}
                          className={`flex-1 py-2 px-4 rounded-2xl text-xs font-bold border transition-all ${
                            hasTagline === "yes"
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-[#101010] text-[#E1E0CC]/70 border-[#E1E0CC]/15 hover:bg-[#0a0a0a]"
                          }`}
                        >
                          Yes, I have one
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHasTagline("no");
                            updateData({ usp: "" });
                          }}
                          className={`flex-1 py-2 px-4 rounded-2xl text-xs font-bold border transition-all ${
                            hasTagline === "no"
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-[#101010] text-[#E1E0CC]/70 border-[#E1E0CC]/15 hover:bg-[#0a0a0a]"
                          }`}
                        >
                          No, generate one with AI
                        </button>
                      </div>
                    </div>

                    {hasTagline === "yes" && (
                      <div className="space-y-1.5 animate-fade-down">
                        <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider">
                          Enter your Tagline / USP *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Schedule-free autopilot campaign flow"
                          value={data.usp}
                          onChange={(e) => updateData({ usp: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E1E0CC]/5 focus:border-[#E1E0CC]/20 focus:bg-black text-sm bg-[#1c1e21] text-[#ffffff] outline-none transition-all"
                        />
                      </div>
                    )}

                    {hasTagline === "no" && (
                      <div className="space-y-2.5 animate-fade-down">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider">
                            Generated AI Tagline *
                          </label>
                          <button
                            type="button"
                            onClick={handleGenerateTaglines}
                            disabled={isGeneratingTaglines || !data.brandName}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-[#0A0A0A] hover:text-[#0A0A0A]/80 border border-[#0A0A0A]/30 hover:border-[#0A0A0A]/60 px-2.5 py-1 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isGeneratingTaglines ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                            ) : (
                              <><Sparkles className="w-3 h-3" /> AI Generate 5 Taglines</>
                            )}
                          </button>
                        </div>

                        <input
                          type="text"
                          readOnly
                          placeholder="Click 'AI Generate' above to create options, then pick one"
                          value={data.usp}
                          onClick={() => {
                            if (taglineSuggestions.length > 0) {
                              setShowTaglinePicker(true);
                            } else {
                              handleGenerateTaglines();
                            }
                          }}
                          className="w-full px-4 py-2.5 rounded-2xl border border-[#E1E0CC]/15 focus:border-[#0A0A0A] text-sm bg-[#0a0a0a] text-white outline-none cursor-pointer"
                        />

                        {/* ── Tagline suggestions picker ── */}
                        {showTaglinePicker && (
                          <div className="border border-[#E1E0CC]/15 rounded-2xl overflow-hidden bg-[#101010] shadow-lg">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-[#E1E0CC]/10 bg-[#0a0a0a]">
                              <span className="text-[10px] font-bold text-[#E1E0CC]/60 uppercase tracking-wider">
                                {isGeneratingTaglines ? "Generating AI taglines…" : "Select one of these 5 AI taglines"}
                              </span>
                              <button
                                onClick={() => { setShowTaglinePicker(false); setTaglineSuggestions([]); }}
                                className="text-[#E1E0CC]/40 hover:text-[#E1E0CC]/80"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {isGeneratingTaglines ? (
                              <div className="p-4 flex items-center gap-2 text-xs text-[#E1E0CC]/40">
                                <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
                                Crafting 5 unique taglines for {data.brandName}…
                              </div>
                            ) : taglineError ? (
                              <div className="p-4 text-xs text-[#E1E0CC]">{taglineError}</div>
                            ) : (
                              <div className="divide-y divide-gray-50">
                                {taglineSuggestions.map((t, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      updateData({ usp: t });
                                      setShowTaglinePicker(false);
                                      setTaglineSuggestions([]);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-[#E1E0CC]/80 hover:bg-[#0A0A0A]/5 hover:text-[#0A0A0A] transition-colors flex items-center justify-between group"
                                  >
                                    <span className="italic">"{t}"</span>
                                    <span className="text-[9px] font-bold text-gray-300 group-hover:text-[#0A0A0A] uppercase tracking-wider shrink-0 ml-2">Select</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
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
                              ? "bg-[#101010] text-white border-[#E1E0CC]/10"
                              : "bg-[#0a0a0a] text-[#E1E0CC]/70 border-[#E1E0CC]/15 hover:bg-gray-100"
                            }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Or add custom value..."
                      value={customValueInput}
                      onChange={(e) => setCustomValueInput(e.target.value)}
                      className="flex-1 px-4 py-1.5 rounded-lg border border-[#E1E0CC]/15 focus:border-[#0A0A0A] text-xs bg-[#101010] outline-none"
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
                      className="px-4 bg-[#E1E0CC] hover:bg-white text-[#101010] text-xs font-bold rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                    Brand Personality *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BRAND_PERSONALITIES.map((bp) => {
                      const isSelected = isPersonalitySelected(bp.id);
                      return (
                        <button
                          key={bp.id}
                          onClick={() => toggleBrandPersonality(bp.id)}
                          className={`text-left p-3 rounded-2xl border text-xs transition-all flex items-start gap-2.5
                            ${isSelected
                              ? "border-[#E1E0CC] bg-[#E1E0CC]/5 text-white"
                              : "border-[#E1E0CC]/15 text-[#E1E0CC]/60 hover:bg-[#0a0a0a]"
                            }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5
                            ${isSelected ? "border-[#E1E0CC] bg-[#E1E0CC] text-[#101010]" : "border-[#E1E0CC]/20 bg-[#101010]"}`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{bp.label}</p>
                            <p className="text-[10px] text-[#E1E0CC]/40 mt-0.5 leading-snug">{bp.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── COLOR PALETTE SELECTION (User Requested Feature) ── */}
                <div className="border border-[#E1E0CC]/15/80 rounded-2xl p-6 bg-[#101010] shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#E1E0CC]/40 uppercase tracking-[0.2em] block">
                        COLOR PALETTE
                      </span>
                      <p className="text-xs text-[#E1E0CC]/60 mt-0.5">
                        Customize your brand&apos;s primary and accent colors or tap a curated theme below.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-[#E1E0CC]/15 px-3 py-1 rounded-full">
                      <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: data.primaryColor || "#0D0D0D" }} />
                      <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: data.accentColor || "#C9A84C" }} />
                      <span className="text-[10px] font-bold text-[#E1E0CC]/70 uppercase ml-1">Active Theme</span>
                    </div>
                  </div>

                  {/* Dual Large Swatch Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Primary Color Card */}
                    <div className="space-y-2">
                      <div 
                        className="w-full h-28 rounded-2xl shadow-sm border border-white/10 transition-all duration-300 relative overflow-hidden group cursor-pointer"
                        style={{ backgroundColor: data.primaryColor || "#0D0D0D" }}
                      >
                        <input 
                          type="color" 
                          value={data.primaryColor || "#0D0D0D"}
                          onChange={(e) => updateData({ primaryColor: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute top-2 right-2 bg-white/50 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          Pick Color
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-white">PRIMARY</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-[#E1E0CC]/40 font-mono">HEX:</span>
                          <input 
                            type="text"
                            value={data.primaryColor || "#0D0D0D"}
                            onChange={(e) => updateData({ primaryColor: e.target.value })}
                            className="text-[11px] font-mono font-semibold text-[#E1E0CC]/70 uppercase bg-transparent outline-none w-20 hover:text-white focus:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Accent Color Card */}
                    <div className="space-y-2">
                      <div 
                        className="w-full h-28 rounded-2xl shadow-sm border border-white/10 transition-all duration-300 relative overflow-hidden group cursor-pointer"
                        style={{ backgroundColor: data.accentColor || "#C9A84C" }}
                      >
                        <input 
                          type="color" 
                          value={data.accentColor || "#C9A84C"}
                          onChange={(e) => updateData({ accentColor: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute top-2 right-2 bg-white/50 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          Pick Color
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-white">ACCENT</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-[#E1E0CC]/40 font-mono">HEX:</span>
                          <input 
                            type="text"
                            value={data.accentColor || "#C9A84C"}
                            onChange={(e) => updateData({ accentColor: e.target.value })}
                            className="text-[11px] font-mono font-semibold text-[#E1E0CC]/70 uppercase bg-transparent outline-none w-20 hover:text-white focus:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preset Palettes Quick Pick */}
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Curated Preset Palettes (Tap to Apply)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_COLOR_PALETTES.map((p) => {
                        const isSelected = data.primaryColor === p.primary && data.accentColor === p.accent;
                        return (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => updateData({ primaryColor: p.primary, accentColor: p.accent })}
                            className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer
                              ${isSelected ? "border-[#0A0A0A] bg-[#1C1C1C] text-white shadow-sm" : "border-[#E1E0CC]/15 hover:border-[#E1E0CC]/20 bg-[#0a0a0a] text-white"}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full border border-black/20 shadow-xs" style={{ backgroundColor: p.primary }} />
                              <div className="w-4 h-4 rounded-full border border-black/20 shadow-xs" style={{ backgroundColor: p.accent }} />
                            </div>
                            <div>
                              <p className={`text-[11px] font-bold truncate ${isSelected ? "text-white" : "text-white"}`}>{p.name}</p>
                              <p className={`text-[9px] font-mono uppercase ${isSelected ? "text-[#E1E0CC]/40" : "text-[#E1E0CC]/40"}`}>{p.primary} / {p.accent}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* â”€â”€â”€ Step 3: Audience Focus & Pricing â”€â”€â”€ */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#0A0A0A]" />
                  Audience & Pricing
                </h2>
                <p className="text-xs text-[#E1E0CC]/40 mt-1">
                  Define your customer profile and select pricing structures using fast presets.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Target Audience *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Small business owners, marketing managers in startups"
                      value={data.targetAudience}
                      onChange={(e) => updateData({ targetAudience: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#E1E0CC]/15 focus:border-[#E1E0CC] text-sm bg-[#101010] text-white outline-none resize-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Customer Personas
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Persona 1: Tech founder, age 30-40. Persona 2: Solo marketer..."
                      value={data.customerPersonas}
                      onChange={(e) => updateData({ customerPersonas: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#E1E0CC]/15 focus:border-[#E1E0CC] text-sm bg-[#101010] text-white resize-none outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Competitors
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add competitor name..."
                        value={newCompetitorInput}
                        onChange={(e) => setNewCompetitorInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-2xl border border-[#E1E0CC]/15 focus:border-[#E1E0CC] text-xs bg-[#101010] text-white outline-none"
                      />
                      <button
                        onClick={() => {
                          if (newCompetitorInput.trim()) {
                            const current = data.competitors || [];
                            if (!current.includes(newCompetitorInput.trim())) {
                              updateData({ competitors: [...current, newCompetitorInput.trim()] });
                            }
                            setNewCompetitorInput("");
                          }
                        }}
                        className="px-4 py-2.5 bg-[#E1E0CC] hover:bg-white text-[#101010] text-xs font-bold rounded-2xl transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(data.competitors || []).map((c) => (
                        <span key={c} className="px-2.5 py-1 rounded-lg bg-[#101010] border border-[#E1E0CC]/15 text-white text-[10px] font-semibold flex items-center gap-1">
                          {c}
                          <button
                            type="button"
                            onClick={() => {
                              updateData({ competitors: (data.competitors || []).filter((item) => item !== c) });
                            }}
                            className="text-[#E1E0CC]/40 hover:text-[#E1E0CC] font-bold"
                          >
                            Ã—
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Products
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add product name..."
                        value={newProductInput}
                        onChange={(e) => setNewProductInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-2xl border border-[#E1E0CC]/15 focus:border-[#E1E0CC] text-xs bg-[#101010] text-white outline-none"
                      />
                      <button
                        onClick={() => {
                          if (newProductInput.trim()) {
                            const current = data.products || [];
                            if (!current.includes(newProductInput.trim())) {
                              updateData({ products: [...current, newProductInput.trim()] });
                            }
                            setNewProductInput("");
                          }
                        }}
                        className="px-4 py-2.5 bg-[#E1E0CC] hover:bg-white text-[#101010] text-xs font-bold rounded-2xl transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(data.products || []).map((p) => (
                        <span key={p} className="px-2.5 py-1 rounded-lg bg-[#101010] border border-[#E1E0CC]/15 text-white text-[10px] font-semibold flex items-center gap-1">
                          {p}
                          <button
                            type="button"
                            onClick={() => {
                              updateData({ products: (data.products || []).filter((item) => item !== p) });
                            }}
                            className="text-[#E1E0CC]/40 hover:text-[#E1E0CC] font-bold"
                          >
                            Ã—
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                      Services
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add service name..."
                        value={newServiceInput}
                        onChange={(e) => setNewServiceInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-2xl border border-[#E1E0CC]/15 focus:border-[#E1E0CC] text-xs bg-[#101010] text-white outline-none"
                      />
                      <button
                        onClick={() => {
                          if (newServiceInput.trim()) {
                            const current = data.services || [];
                            if (!current.includes(newServiceInput.trim())) {
                              updateData({ services: [...current, newServiceInput.trim()] });
                            }
                            setNewServiceInput("");
                          }
                        }}
                        className="px-4 py-2.5 bg-[#E1E0CC] hover:bg-white text-[#101010] text-xs font-bold rounded-2xl transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(data.services || []).map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-[#101010] border border-[#E1E0CC]/15 text-white text-[10px] font-semibold flex items-center gap-1">
                          {s}
                          <button
                            type="button"
                            onClick={() => {
                              updateData({ services: (data.services || []).filter((item) => item !== s) });
                            }}
                            className="text-[#E1E0CC]/40 hover:text-[#E1E0CC] font-bold"
                          >
                            Ã—
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                    Country Focus *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COUNTRIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateData({ country: c })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                          ${data.country === c
                            ? "bg-[#101010] text-white border-[#E1E0CC]/10"
                            : "bg-[#0a0a0a] text-[#E1E0CC]/70 border-[#E1E0CC]/15 hover:bg-gray-100"
                          }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
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
                              ? "bg-[#101010] text-white border-[#E1E0CC]/10"
                              : "bg-[#0a0a0a] text-[#E1E0CC]/70 border-[#E1E0CC]/15 hover:bg-gray-100"
                            }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                    Pricing Model *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRICING_PRESETS.map((priceModel) => (
                      <button
                        key={priceModel}
                        onClick={() => updateData({ pricing: priceModel })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                          ${data.pricing === priceModel
                            ? "bg-[#101010] text-white border-[#E1E0CC]/10"
                            : "bg-[#0a0a0a] text-[#E1E0CC]/70 border-[#E1E0CC]/15 hover:bg-gray-100"
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

          {/* â”€â”€â”€ Step 4: Channels & Goal â”€â”€â”€ */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0A0A0A]" />
                  Channels & Goal
                </h2>
                <p className="text-xs text-[#E1E0CC]/40 mt-1">
                  Connect target channels and specify your marketing objective to compile the autopilot profile.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
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
                          className={`text-left p-4 rounded-2xl border transition-all flex items-center justify-between
                            ${selected
                              ? "border-[#0A0A0A] bg-[#0A0A0A]/5 text-white"
                              : "border-[#E1E0CC]/15 text-[#E1E0CC]/70 hover:bg-[#0a0a0a]"
                            }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{plat.label}</p>
                            <p className="text-[10px] text-[#E1E0CC]/40 mt-0.5">{plat.desc}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all
                            ${selected ? "border-[#0A0A0A] bg-[#0A0A0A] text-white" : "border-[#E1E0CC]/20"}`}>
                            {selected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-wider mb-2">
                    Primary Goal *
                  </label>
                  <div className="space-y-2.5">
                    {OBJECTIVES.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => updateData({ mainGoal: obj.id })}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3
                          ${data.mainGoal === obj.id
                            ? "border-[#0A0A0A] bg-[#0A0A0A]/5 text-white"
                            : "border-[#E1E0CC]/15 text-[#E1E0CC]/70 hover:bg-[#0a0a0a]"
                          }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center
                            ${data.mainGoal === obj.id ? "border-[#0A0A0A]" : "border-[#E1E0CC]/20"}`}>
                            {data.mainGoal === obj.id && <div className="w-2 h-2 rounded-full bg-[#0A0A0A]" />}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{obj.label}</p>
                          <p className="text-xs text-[#E1E0CC]/40 mt-0.5">{obj.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 5: Brand Identity Studio (Upload Only) ─── */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <span className="text-[9px] font-bold text-[#0A0A0A] uppercase tracking-widest bg-[#0A0A0A]/10 px-2.5 py-1 rounded-md">Phase 2</span>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-2">
                  <Paintbrush className="w-5 h-5 text-[#0A0A0A]" />
                  Brand Identity Studio
                </h2>
                <p className="text-xs text-[#E1E0CC]/40 mt-1">
                  Upload your brand logo and core visual assets. Keep it simple — you can add more specific photos (like team or office pictures) later when generating individual posts.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Primary Logo (Required) */}
                  <div className="border border-[#E1E0CC]/15/80 rounded-2xl p-4 flex flex-col justify-between bg-[#101010] min-h-[140px]">
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <ImageIcon className="w-4 h-4 text-[#0A0A0A]" />
                        Logo Graphic <span className="text-red-500">*</span>
                      </h4>
                      <p className="text-[10px] text-[#E1E0CC]/40 mt-0.5">Upload brand logo (SVG/PNG) for watermarks.</p>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      {data.logoUrl ? (
                        <div className="relative w-14 h-14 rounded-2xl border border-[#E1E0CC]/15 bg-[#0a0a0a] flex items-center justify-center p-1 group overflow-hidden shadow-sm shrink-0">
                          <img src={data.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                          <button
                            onClick={() => removeUploadedFile("logo")}
                            className="absolute inset-0 bg-[#E1E0CC]/10/90 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <label className={`px-3 py-1.5 bg-[#0a0a0a] border border-[#E1E0CC]/15 hover:bg-gray-100 text-[#E1E0CC]/80 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0
                          ${uploadingField === "logo" ? "opacity-50 cursor-not-allowed" : ""}`}>
                          {uploadingField === "logo" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0A0A0A]" /> : <UploadCloud className="w-3.5 h-3.5 text-[#E1E0CC]/40" />}
                          Upload Logo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleRealFileUpload(e, "logo")}
                            disabled={uploadingField !== null}
                          />
                        </label>
                      )}
                      {data.logoUrl && (
                        <span className="text-[10px] text-[#E1E0CC] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E1E0CC]" /> Loaded
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Images (Optional) */}
                  <div className="border border-[#E1E0CC]/15/80 rounded-2xl p-4 bg-[#101010] flex flex-col justify-between min-h-[140px]">
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <ImageIcon className="w-4 h-4 text-[#0A0A0A]" />
                        Product / Brand Assets
                        <span className="text-[8px] text-[#E1E0CC]/40 uppercase ml-1">(Optional)</span>
                      </h4>
                      <p className="text-[10px] text-[#E1E0CC]/40 mt-0.5">Upload product catalogs or key brand imagery.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-3">
                      {data.productImages.map((img, i) => (
                        <div key={i} className="relative w-12 h-12 rounded-lg border border-[#E1E0CC]/15 overflow-hidden group shrink-0">
                          <img src={img} alt="Product" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeUploadedFile("productImages", i)}
                            className="absolute inset-0 bg-[#E1E0CC]/10/90 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <label className={`w-12 h-12 border border-dashed border-[#E1E0CC]/20 hover:border-brand-secondary rounded-lg flex flex-col items-center justify-center text-[#E1E0CC]/40 hover:text-[#0A0A0A] transition-colors cursor-pointer shrink-0
                        ${uploadingField === "productImages" ? "opacity-50 cursor-not-allowed" : ""}`}>
                        {uploadingField === "productImages" ? <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" /> : <Plus className="w-4 h-4" />}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleRealFileUpload(e, "productImages")}
                          disabled={uploadingField !== null}
                        />
                      </label>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ─── Step 6: Moodboard Studio 🌟 ─── */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Paintbrush className="w-5 h-5 text-[#0A0A0A]" />
                  Social Media Visual Direction
                  <span className="ml-1 text-[9px] font-black text-[#0A0A0A] bg-[#0A0A0A]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Signature Feature</span>
                </h2>
                <p className="text-xs text-[#E1E0CC]/40 mt-1">
                  Choose your brand&apos;s visual style. The approved direction defines the aesthetic direction for all your marketing material.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(MOODBOARD_PRESETS).map(([key, preset]) => {
                    const isApproved = data.approvedMoodboard?.id === key;
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          updateData({
                            approvedMoodboard: {
                              id: key,
                              name: key === 'option_1' ? 'Dark Premium' : key === 'option_2' ? 'Clean Minimal' : 'Vibrant Digital',
                              tagline: preset.summary,
                              imageUrl: null,
                            }
                          });
                        }}
                        className={`bg-[#101010] border rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer hover:shadow-lg group relative
                          ${isApproved ? "border-brand-secondary ring-2 ring-brand-secondary/20 shadow-brand-secondary/10 shadow-lg" : "border-[#E1E0CC]/15/80"}`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">
                              {key === 'option_1' ? 'Dark Premium' : key === 'option_2' ? 'Clean Minimal' : 'Vibrant Digital'}
                            </span>
                            {isApproved && <CheckCircle2 className="w-4 h-4 text-brand-secondary" />}
                          </div>
                          
                          <p className="text-[10px] text-[#E1E0CC]/60 leading-tight">
                            {preset.summary}
                          </p>

                          <div className="space-y-2 pt-2">
                            <span className="text-[9px] font-bold text-[#E1E0CC]/40 uppercase tracking-widest">Color Palette</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {preset.colors.map((c, idx) => (
                                <div
                                  key={idx}
                                  className="w-5 h-5 rounded-full border border-white/10 shadow-sm"
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#E1E0CC]/10">
                            <span className="text-[9px] font-bold text-[#E1E0CC]/40 uppercase tracking-widest">Typography</span>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-[#E1E0CC]"><strong className="text-white">Headlines:</strong> {preset.typography.headline}</span>
                              <span className="text-[10px] text-[#E1E0CC]"><strong className="text-white">Body:</strong> {preset.typography.body}</span>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#E1E0CC]/10">
                            <span className="text-[9px] font-bold text-[#E1E0CC]/40 uppercase tracking-widest">Essence</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {preset.essence.map((e, idx) => (
                                <span key={idx} className="text-[9px] bg-[#E1E0CC]/5 text-[#E1E0CC]/80 px-2 py-0.5 rounded-full">
                                  {e}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}



          {/* â”€â”€â”€ Step 7: Review & Finalize â”€â”€â”€ */}
          {step === 7 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#E1E0CC]" />
                  Review & Finalize Setup
                </h2>
                <p className="text-xs text-[#E1E0CC]/40 mt-1">
                  Double check your profile details. Clicking complete will compile your dynamic marketing database.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border border-[#E1E0CC]/10 bg-[#0a0a0a]/50 p-6 rounded-2xl">
                {/* DNA Summary */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-widest">Brand DNA Profile</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[#E1E0CC]/40 block text-[9px]">BRAND NAME</span>
                      <span className="font-semibold text-[#E1E0CC] text-sm">{data.brandName}</span>
                    </div>
                    <div>
                      <span className="text-[#E1E0CC]/40 block text-[9px]">INDUSTRY / CATEGORY</span>
                      <span className="font-semibold text-[#E1E0CC]">{data.industry} {data.category ? `(${data.category})` : ""}</span>
                    </div>
                    <div>
                      <span className="text-[#E1E0CC]/40 block text-[9px]">USP</span>
                      <p className="text-[#E1E0CC]/70 font-medium leading-relaxed">{data.usp}</p>
                    </div>
                  </div>
                </div>

                {/* Identity Studio Summary */}
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-[#E1E0CC]/15/80 md:pl-6 pt-4 md:pt-0">
                  <p className="text-[10px] font-bold text-[#E1E0CC]/40 uppercase tracking-widest">Brand Kit Specifications</p>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-[#E1E0CC]/40 block text-[9px]">LOGO SOURCE</span>
                      <span className="font-semibold text-[#E1E0CC] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#E1E0CC]" />
                        {data.logoUrl ? "Uploaded Custom Logo" : "Not Provided"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approved Moodboard Summary */}
              {data.approvedMoodboard && (
                <div className="relative overflow-hidden rounded-2xl border border-[#E1E0CC]/15/80 bg-[#101010] p-5">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#0A0A0A] mb-1">Approved Moodboard Concept</p>
                      <p className="text-white font-bold text-base">{data.approvedMoodboard.name}</p>
                      <p className="text-[#E1E0CC]/60 text-xs mt-0.5">{data.approvedMoodboard.tagline}</p>
                    </div>
                    {data.approvedMoodboard.imageUrl && (
                      <div className="w-40 h-24 rounded-lg overflow-hidden border border-[#E1E0CC]/10 shrink-0">
                        <img
                          src={data.approvedMoodboard.imageUrl}
                          alt={data.approvedMoodboard.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-[#E1E0CC]/10 pt-6 mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className={`flex items-center gap-1 text-xs font-bold transition-all uppercase tracking-wider
                ${step === 1 || isSubmitting ? "text-gray-300 cursor-not-allowed" : "text-[#E1E0CC]/40 hover:text-[#E1E0CC]"}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {step < 7 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex items-center gap-1 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all
                  ${isStepValid()
                    ? "bg-[#E1E0CC] text-[#101010] hover:bg-white shadow-sm"
                    : "bg-[#1c1e21] text-[#E1E0CC]/30 cursor-not-allowed"
                  }`}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                className="flex items-center gap-1 px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all bg-[#E1E0CC] text-[#101010] hover:bg-white shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Compiling Brand Workspace..." : "Complete Setup"}
                {!isSubmitting && <Check className="w-4 h-4" />}
              </button>
            )}
          </div>

        </div>
      </main>

      <footer className="px-6 py-4 text-center border-t border-[#E1E0CC]/10 bg-[#101010]">
        <p className="text-[10px] text-[#E1E0CC]/40 flex items-center justify-center gap-1 font-semibold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-gray-300" />
          Secure 256-bit encryption Â· GDPR & DPDP compliant
        </p>
      </footer>
    </div>
  );
}

