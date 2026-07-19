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
type LogoOption = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  svgContent?: string | null; // raw SVG string for inline rendering
  error: string | null;
};

type MoodboardOption = {
  id: string;
  name: string;
  tagline: string;
  imageUrl: string | null;
  error: string | null;
};

type BrandKit = {
  kitVariant?: "A" | "B";
  colors: {
    primaryHex: string;
    secondaryHex: string;
    primaryRgb: string;
    secondaryRgb: string;
    primaryCmyk: string;
    secondaryCmyk: string;
    pantoneApprox: string;
  };
  typography: {
    primaryFont: string;
    bodyFont: string;
    usage: string;
  };
  // guidelines is optional (AI response may not always include it)
  guidelines?: {
    safeZone: string;
    minSize: string;
    rules: string[];
  };
  // assets stored flat from API or under assets key
  assets?: {
    primaryLogoSvg: string;
    secondaryLogoSvg: string;
    monogramSvg: string;
    iconSvg: string;
    faviconSvg: string;
    socialIconsSvg: string;
    appIconSvg: string;
  };
  // API returns these at top level
  primaryLogoSvg?: string;
  secondaryLogoSvg?: string;
  monogramSvg?: string;
  iconSvg?: string;
  faviconSvg?: string;
  socialIconsSvg?: string;
  appIconSvg?: string;
};

type MoodboardPalette = { name: string; hex: string; role: string };
type MoodboardStyle = {
  id: string;
  name: string;
  tagline: string;
  palette: MoodboardPalette[];
  typography: { headline: string; body: string; style: string };
  keywords: string[];
  gradient: string;
  accentGradient: string;
  texture: string;
  imagePrompt: string;
  generatedImageUrl: string | null;
};

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

  // Brand Identity Studio
  kitType: "upload" | "generate";
  logoUrl: string;
  productImages: string[];
  teamPhotos: string[];
  officeImages: string[];
  brandVideos: string[];
  fonts: string[];
  icons: string[];
  brandGuidelinesFile: string;
  // Selected logo from fal.ai generation
  selectedLogo: { id: string; name: string; imageUrl: string } | null;

  // Moodboard Studio â€” user picks one of 3 AI-generated options
  approvedMoodboard: { id: string; name: string; tagline: string; imageUrl: string } | null;
};

const INITIAL_DATA: OnboardingData = {
  brandName: "Aethera",
  website: "aethera.design",
  industry: "B2B SaaS & Tech",
  category: "AI Design Studio",
  subCategory: "Premium Branding Automations",
  businessDescription: "Aethera is a high-end generative design suite creating production-grade visual assets and coordinated brand systems for boutique businesses.",
  
  mission: "To bring editorial design quality and premium aesthetics to every digital interface.",
  vision: "To be the defining standard of quality for automated visual communication.",
  usp: "Pristine, human-grade design taste powered by state-of-the-art visual models.",
  brandPersonality: "professional",
  brandValues: ["Innovation", "Exclusivity", "Elegance", "Trust"],
  
  products: ["Aethera Canvas", "Aesthetics Engine", "Coordinated Brand Kits"],
  services: ["Visual Identity Consultations", "Premium Content Scaling"],
  pricing: "Subscription / SaaS",
  
  targetAudience: "Boutique fashion labels, design agencies, and premium SaaS developers.",
  customerPersonas: "Creative directors, VPs of Marketing, and design-conscious founders.",
  country: "United States",
  languages: ["English"],
  
  platforms: ["instagram", "linkedin"],
  competitors: ["Canva Enterprise", "Adobe Firefly Studio"],
  mainGoal: "leads",

  // Brand Identity Studio defaults
  kitType: "generate",
  logoUrl: "",
  productImages: [],
  teamPhotos: [],
  officeImages: [],
  brandVideos: [],
  fonts: [],
  icons: [],
  brandGuidelinesFile: "",
  selectedLogo: null,

  // Moodboard Studio defaults
  approvedMoodboard: null,
};




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
    themeClass: "bg-[#F3F4F6] text-gray-800 border-gray-300",
    themeTitleColor: "text-[#5C6B57]",
    themeBg: "#F3F4F6"
  },
  option_3: {
    colors: [
      { name: "Electric Cyan", hex: "#06B6D4" },
      { name: "Deep Space", hex: "#090D16" },
      { name: "Neon Violet", hex: "#8B5CF6" },
      { name: "Vivid Magenta", hex: "#EC4899" },
      { name: "Electric Blue", hex: "#3B82F6" },
      { name: "White Glow", hex: "#FFFFFF" }
    ],
    gradients: [
      { name: "Neon Glow", style: "linear-gradient(135deg, #06B6D4 0%, #8B5CF6 50%, #EC4899 100%)" },
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
    themeTitleColor: "text-[#06B6D4]",
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

  // â”€â”€ Brand Logo Studio: 3-phase flow â”€â”€
  // Phase A: Color Decision
  const [hasDecidedColors, setHasDecidedColors] = useState<boolean | null>(null);
  const [userPrimaryColor, setUserPrimaryColor] = useState("#0F172A");
  const [userSecondaryColor, setUserSecondaryColor] = useState("#06B6D4");
  // Phase B: Generation
  const [isGeneratingKits, setIsGeneratingKits] = useState(false);
  
  // ── Brand Logo Studio (fal.ai image generation) ──
  const [isGeneratingLogos, setIsGeneratingLogos] = useState(false);
  const [logoOptions, setLogoOptions] = useState<LogoOption[]>([]);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isLogoApproved, setIsLogoApproved] = useState(false);

  // ── Moodboard Studio (fal.ai — 3 options) ──
  const [isGeneratingMoods, setIsGeneratingMoods] = useState(false);
  const [moodOptions, setMoodOptions] = useState<MoodboardOption[]>([]);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [moodboardImages, setMoodboardImages] = useState<Record<string, string | null>>({});
  const [moodboardGeneratingId, setMoodboardGeneratingId] = useState<string | null>(null);
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);
  const [inspectingMoodboard, setInspectingMoodboard] = useState<MoodboardOption | null>(null);

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
          if (parsed.selectedLogo) {
            setIsLogoApproved(true);
            setLogoOptions([parsed.selectedLogo]);
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
      setLogoOptions([]);
      setMoodOptions([]);
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

  // ── fal.ai Logo and Moodboard Generation Handlers ──
  const handleGenerateLogos = async () => {
    setIsGeneratingLogos(true);
    setLogoError(null);
    try {
      const res = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: data.brandName,
          industry: data.industry,
          businessDescription: data.businessDescription,
          brandPersonality: Array.isArray(data.brandPersonality)
            ? (data.brandPersonality as string[]).join(", ")
            : String(data.brandPersonality || "Modern"),
          brandValues: Array.isArray(data.brandValues) ? data.brandValues : [],
          usp: data.usp,
          mission: data.mission,
          userPrimaryColor: userPrimaryColor,
          userSecondaryColor: userSecondaryColor,
          kitVariant: "A",
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server returned ${res.status}`);
      }
      const result = await res.json();
      if (result.error) {
        throw new Error(result.error);
      }
      // API now returns { logos: LogoOption[], kitData: {...} }
      const logos = result.logos || [];
      setLogoOptions(logos);
    } catch (e: any) {
      console.error("Logo generation error:", e);
      setLogoError(e.message || "Failed to generate logos");
    } finally {
      setIsGeneratingLogos(false);
    }
  };

  const handleGenerateMoodboards = async () => {
    setIsGeneratingMoods(true);
    setMoodError(null);
    try {
      const res = await fetch("/api/generate-moodboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: data.brandName,
          industry: data.industry,
          brandPersonality: data.brandPersonality,
          brandValues: data.brandValues,
          usp: data.usp,
          website: data.website,
          mission: data.mission,
          vision: data.vision,
          targetAudience: data.targetAudience,
          customerPersonas: data.customerPersonas,
          competitors: data.competitors,
          primaryColor: userPrimaryColor,
          secondaryColor: userSecondaryColor,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server returned ${res.status}`);
      }
      const result = await res.json();
      if (result.error) {
        throw new Error(result.error);
      }
      const moods = result.moodboards || [];
      setMoodOptions(moods);
      if (moods.length > 0) {
        updateData({ 
          approvedMoodboard: {
            id: moods[0].id,
            name: moods[0].name,
            tagline: moods[0].tagline,
            imageUrl: moods[0].imageUrl
          }
        });
      }
    } catch (e: any) {
      console.error("Moodboard generation error:", e);
      setMoodError(e.message || "Failed to generate moodboards");
    } finally {
      setIsGeneratingMoods(false);
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
        if (data.kitType === "upload") return (data.logoUrl || "").trim().length > 0;
        // For generate mode: must have selected a logo
        return data.selectedLogo !== null;
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
      if (user) {
        const { data: workspaces } = await supabase
          .from("workspaces")
          .select("id")
          .limit(1);
        if (workspaces && workspaces.length > 0) {
          workspaceId = workspaces[0].id;
        }
      }

      // TRANSACTION STEP 1: Insert Brand DNA profile
      const { data: dnaResult, error: dnaError } = await supabase
        .from("brand_dna")
        .insert({
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
          approved_moodboard: data.approvedMoodboard || null,
          workspace_id: workspaceId,
        })
        .select()
        .single();

      if (dnaError || !dnaResult) {
        console.error("Database DNA insert error:", dnaError);
        alert("Failed to save Brand DNA profile. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // TRANSACTION STEP 2: Insert Brand Assets linked to DNA ID
      const { error: assetsError } = await supabase.from("brand_assets").insert({
        brand_dna_id: dnaResult.id,
        logo_url: data.kitType === "generate" ? (data.selectedLogo?.imageUrl || "") : data.logoUrl,
        product_images: data.productImages,
        team_photos: data.teamPhotos,
        office_images: data.officeImages,
        brand_videos: data.brandVideos,
        fonts: data.fonts,
        icons: data.icons,
        brand_guidelines: data.brandGuidelinesFile || "",
        logo_studio_data: data.kitType === "generate" ? (data.selectedLogo || {}) : {},
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
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      <Navbar />

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-100 relative">
        <div
          className="h-full bg-[#06B6D4] transition-all duration-300 ease-out"
          style={{ width: `${(step / 7) * 100}%` }}
        />
        <div className="absolute right-6 -top-5.5 flex items-center gap-2.5">
          <button
            onClick={handleResetCache}
            className="text-[9px] font-extrabold text-red-500 hover:text-red-700 hover:underline tracking-wider uppercase transition-colors"
          >
            Clear Cache & Reset
          </button>
          <span className="text-[9px] font-bold text-gray-300">|</span>
          <div className="text-[9px] font-bold text-gray-400 tracking-wider">
            STEP {step} OF 7
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-6 max-w-4xl mx-auto w-full">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] w-full">

          {/* â”€â”€â”€ Step 1: Magic Website Crawler / Manual Profile â”€â”€â”€ */}
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
                      disabled={isScanning}
                      value={scanningUrl}
                      onChange={(e) => setScanningUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={runAiScanner}
                    disabled={!scanningUrl.trim() || isScanning}
                    className={`px-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all
                      ${scanningUrl.trim() && !isScanning
                        ? "bg-[#06B6D4] text-[#090D16] hover:bg-[#06B6D4]/90"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                      }`}
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

              <div className="border-t border-gray-100 pt-5 space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verify / Edit Details</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AI Content"
                        value={data.category}
                        onChange={(e) => updateData({ category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Sub-Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Social Autopilot"
                        value={data.subCategory}
                        onChange={(e) => updateData({ subCategory: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none"
                      />
                    </div>
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

          {/* â”€â”€â”€ Step 2: Brand Identity & Values â”€â”€â”€ */}
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
                      Vision Statement
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. To become the leading autopilot engine globally"
                      value={data.vision}
                      onChange={(e) => updateData({ vision: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none"
                    />
                  </div>

                  {/* ── Brand Tagline / USP — Choice toggle ── */}
                  <div className="md:col-span-2 space-y-4 border-t border-gray-100 pt-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Do you already have a brand tagline or USP? *
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setHasTagline("yes");
                            setShowTaglinePicker(false);
                          }}
                          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
                            hasTagline === "yes"
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
                          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
                            hasTagline === "no"
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          No, generate one with AI
                        </button>
                      </div>
                    </div>

                    {hasTagline === "yes" && (
                      <div className="space-y-1.5 animate-fade-down">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Enter your Tagline / USP *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Schedule-free autopilot campaign flow"
                          value={data.usp}
                          onChange={(e) => updateData({ usp: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 outline-none"
                        />
                      </div>
                    )}

                    {hasTagline === "no" && (
                      <div className="space-y-2.5 animate-fade-down">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Generated AI Tagline *
                          </label>
                          <button
                            type="button"
                            onClick={handleGenerateTaglines}
                            disabled={isGeneratingTaglines || !data.brandName}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-[#06B6D4] hover:text-[#06B6D4]/80 border border-[#06B6D4]/30 hover:border-[#06B6D4]/60 px-2.5 py-1 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-gray-50 text-gray-900 outline-none cursor-pointer"
                        />

                        {/* ── Tagline suggestions picker ── */}
                        {showTaglinePicker && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                {isGeneratingTaglines ? "Generating AI taglines…" : "Select one of these 5 AI taglines"}
                              </span>
                              <button
                                onClick={() => { setShowTaglinePicker(false); setTaglineSuggestions([]); }}
                                className="text-gray-400 hover:text-gray-700"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {isGeneratingTaglines ? (
                              <div className="p-4 flex items-center gap-2 text-xs text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin text-[#06B6D4]" />
                                Crafting 5 unique taglines for {data.brandName}…
                              </div>
                            ) : taglineError ? (
                              <div className="p-4 text-xs text-red-500">{taglineError}</div>
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
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#06B6D4]/5 hover:text-[#06B6D4] transition-colors flex items-center justify-between group"
                                  >
                                    <span className="italic">"{t}"</span>
                                    <span className="text-[9px] font-bold text-gray-300 group-hover:text-[#06B6D4] uppercase tracking-wider shrink-0 ml-2">Select</span>
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

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Brand Personality *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BRAND_PERSONALITIES.map((bp) => {
                      const isSelected = isPersonalitySelected(bp.id);
                      return (
                        <button
                          key={bp.id}
                          onClick={() => toggleBrandPersonality(bp.id)}
                          className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5
                            ${isSelected
                              ? "border-[#06B6D4] bg-[#06B6D4]/5 text-gray-900"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5
                            ${isSelected ? "border-[#06B6D4] bg-[#06B6D4] text-white" : "border-gray-300 bg-white"}`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-950">{bp.label}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{bp.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€â”€ Step 3: Audience Focus & Pricing â”€â”€â”€ */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
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

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Customer Personas
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Persona 1: Tech founder, age 30-40. Persona 2: Solo marketer..."
                      value={data.customerPersonas}
                      onChange={(e) => updateData({ customerPersonas: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-sm bg-white text-gray-900 resize-none outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Competitors
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add competitor name..."
                        value={newCompetitorInput}
                        onChange={(e) => setNewCompetitorInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-xs bg-white text-gray-900 outline-none"
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
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(data.competitors || []).map((c) => (
                        <span key={c} className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-semibold flex items-center gap-1">
                          {c}
                          <button
                            type="button"
                            onClick={() => {
                              updateData({ competitors: (data.competitors || []).filter((item) => item !== c) });
                            }}
                            className="text-gray-400 hover:text-red-500 font-bold"
                          >
                            Ã—
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Products
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add product name..."
                        value={newProductInput}
                        onChange={(e) => setNewProductInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-xs bg-white text-gray-900 outline-none"
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
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(data.products || []).map((p) => (
                        <span key={p} className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-semibold flex items-center gap-1">
                          {p}
                          <button
                            type="button"
                            onClick={() => {
                              updateData({ products: (data.products || []).filter((item) => item !== p) });
                            }}
                            className="text-gray-400 hover:text-red-500 font-bold"
                          >
                            Ã—
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Services
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add service name..."
                        value={newServiceInput}
                        onChange={(e) => setNewServiceInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-xs bg-white text-gray-900 outline-none"
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
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(data.services || []).map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-semibold flex items-center gap-1">
                          {s}
                          <button
                            type="button"
                            onClick={() => {
                              updateData({ services: (data.services || []).filter((item) => item !== s) });
                            }}
                            className="text-gray-400 hover:text-red-500 font-bold"
                          >
                            Ã—
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

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

          {/* â”€â”€â”€ Step 4: Channels & Goal â”€â”€â”€ */}
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

          {/* â”€â”€â”€ Step 5: Brand Identity Studio (Upload or Generate with AI) â”€â”€â”€ */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-up">
              {(() => {
                const fontInfo = getPersonalityFont(data.brandPersonality);
                return <style dangerouslySetInnerHTML={{ __html: fontInfo.import }} />;
              })()}
              <div>
                <span className="text-[9px] font-bold text-[#06B6D4] uppercase tracking-widest bg-[#06B6D4]/10 px-2.5 py-1 rounded-md">Phase 2</span>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mt-2">
                  <Paintbrush className="w-5 h-5 text-[#06B6D4]" />
                  Brand Identity Studio
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Upload your pre-existing graphics or trigger the one-click AI generation engine to assemble your Brand Kit instantly.
                </p>
              </div>

              {/* Toggle Controls */}
              <div className="flex border border-gray-200/80 bg-white p-1 rounded-xl max-w-xs">
                <button
                  onClick={() => updateData({ kitType: "generate" })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all
                    ${data.kitType === "generate" ? "bg-brand-dark text-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                >
                  AI Logo Studio
                </button>
                <button
                  onClick={() => updateData({ kitType: "upload" })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all
                    ${data.kitType === "upload" ? "bg-brand-dark text-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                >
                  Upload Assets
                </button>
              </div>
              
              {/* ── SUB-TAB: AI LOGO STUDIO (fal.ai Image Generation) ── */}
              {data.kitType === "generate" && (
                <div className="space-y-6">
                  {/* Case 1: Logo is approved */}
                  {isLogoApproved && data.selectedLogo ? (
                    (() => {
                      const fontInfo = getPersonalityFont(data.brandPersonality);
                      const displayBrandName = fontInfo.name === "Montserrat" ? data.brandName.toUpperCase() : data.brandName;
                      return (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              <h4 className="text-sm font-bold text-gray-900">
                                Approved Brand Logo: {data.selectedLogo.name}
                              </h4>
                            </div>
                            <button
                              onClick={() => {
                                updateData({ selectedLogo: null });
                                setIsLogoApproved(false);
                              }}
                              className="text-[10px] text-gray-400 hover:text-gray-700 font-bold flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Sparkles className="w-3 h-3" /> Change Logo
                            </button>
                          </div>

                          <div className="max-w-md bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="bg-white border border-gray-100 rounded-xl aspect-square w-full flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-inner bg-gradient-to-b from-white to-gray-50/30">
                              {/* Logo Symbol Mark */}
                              <div className="flex-1 flex items-center justify-center w-full">
                                <img
                                  src={data.selectedLogo.imageUrl}
                                  alt="Symbol Mark"
                                  className="max-h-[55%] max-w-[55%] object-contain"
                                />
                              </div>
                              {/* Styled Brand Typography */}
                              <div className="pt-2 pb-4 text-center">
                                <span 
                                  className={`text-gray-900 ${fontInfo.textStyle}`}
                                  style={{ fontFamily: fontInfo.family, fontSize: "1.25rem", lineHeight: "1.75rem" }}
                                >
                                  {displayBrandName}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <div>
                                <span className="text-gray-400 block text-[9px]">LOGO STYLE</span>
                                <span className="font-bold text-gray-800">{data.selectedLogo.name}</span>
                              </div>
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" /> Approved & Selected
                              </span>
                            </div>
                          </div>

                          {/* Logo Variations Suite (12+ Custom Layouts & Formats) */}
                          <div className="border-t border-gray-150 pt-6 mt-6 space-y-4">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">Dynamic Logo Variations Suite</h4>
                              <p className="text-xs text-gray-400 mt-0.5">Your brand identity package has been successfully compiled into 12 custom layout and color formats.</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                              {/* 1. Primary Full Color */}
                              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-lg border border-gray-100">
                                  <img src={data.selectedLogo.imageUrl} alt="Primary" className="max-w-full max-h-full object-contain" />
                                </div>
                                <span className="text-[8px] font-bold text-gray-500 mt-2 block">Primary Full Color</span>
                              </div>

                              {/* 2. Solid Black */}
                              <div className="bg-white border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-lg">
                                  <img src={data.selectedLogo.imageUrl} alt="Solid Black" className="max-w-full max-h-full object-contain" style={{ filter: "grayscale(1) contrast(1000%)" }} />
                                </div>
                                <span className="text-[8px] font-bold text-gray-500 mt-2 block">Black Version</span>
                              </div>

                              {/* 3. Solid White Inverted */}
                              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center p-1 bg-black rounded-lg">
                                  <img src={data.selectedLogo.imageUrl} alt="Solid White" className="max-w-full max-h-full object-contain" style={{ filter: "grayscale(1) contrast(1000%) invert(1)" }} />
                                </div>
                                <span className="text-[8px] font-bold text-gray-400 mt-2 block">White Inverted</span>
                              </div>

                              {/* 4. Grayscale */}
                              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-lg border border-gray-100">
                                  <img src={data.selectedLogo.imageUrl} alt="Grayscale" className="max-w-full max-h-full object-contain" style={{ filter: "grayscale(1)" }} />
                                </div>
                                <span className="text-[8px] font-bold text-gray-500 mt-2 block">Grayscale</span>
                              </div>

                              {/* 5. Watermark */}
                              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-lg border border-gray-100 relative">
                                  <img src={data.selectedLogo.imageUrl} alt="Watermark" className="max-w-full max-h-full object-contain opacity-20" />
                                </div>
                                <span className="text-[8px] font-bold text-gray-500 mt-2 block">Watermark (20% Op)</span>
                              </div>

                              {/* 6. Favicon / Icon */}
                              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center">
                                  <div className="w-7 h-7 rounded-lg bg-gray-900 border border-white/10 flex items-center justify-center p-0.5 overflow-hidden shadow-sm">
                                    <img src={data.selectedLogo.imageUrl} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                  </div>
                                </div>
                                <span className="text-[8px] font-bold text-gray-500 mt-2 block">Favicon / App Icon</span>
                              </div>

                              {/* 7. Wordmark / Text */}
                              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center">
                                  <span 
                                    className={`text-center font-extrabold text-gray-900 ${fontInfo.textStyle}`}
                                    style={{ fontFamily: fontInfo.family }}
                                  >
                                    {displayBrandName}
                                  </span>
                                </div>
                                <span className="text-[8px] font-bold text-gray-500 mt-2 block">Wordmark / Text</span>
                              </div>

                              {/* 8. Horizontal Layout */}
                              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm col-span-2 sm:col-span-1">
                                <div className="w-full h-12 flex items-center justify-center gap-1.5 px-1 bg-white rounded-lg border border-gray-100">
                                  <img src={data.selectedLogo.imageUrl} alt="Icon" className="w-4 h-4 object-contain" style={{ filter: "grayscale(1) contrast(1000%)" }} />
                                  <span 
                                    className="text-[9px] font-bold text-gray-900 truncate max-w-[50px] uppercase"
                                    style={{ fontFamily: fontInfo.family }}
                                  >
                                    {displayBrandName}
                                  </span>
                                </div>
                                <span className="text-[8px] font-bold text-gray-500 mt-2 block">Horizontal Layout</span>
                              </div>

                              {/* 9. Stacked / Vertical Layout */}
                              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 bg-white rounded-lg border border-gray-100">
                                  <img src={data.selectedLogo.imageUrl} alt="Icon" className="w-4 h-4 object-contain" style={{ filter: "grayscale(1) contrast(1000%)" }} />
                                  <span 
                                    className="text-[7px] font-bold text-gray-900 max-w-[45px] truncate text-center uppercase"
                                    style={{ fontFamily: fontInfo.family }}
                                  >
                                    {displayBrandName}
                                  </span>
                                </div>
                                <span className="text-[8px] font-bold text-gray-500 mt-2 block">Vertical Stacked</span>
                              </div>

                              {/* 10. Vintage Style */}
                              <div className="bg-[#FAF6EE] border border-[#EBE3D5] rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center p-1 bg-[#FAF6EE] rounded-lg">
                                  <img src={data.selectedLogo.imageUrl} alt="Vintage" className="max-w-full max-h-full object-contain" style={{ filter: "sepia(0.8) contrast(1.2)" }} />
                                </div>
                                <span className="text-[8px] font-bold text-amber-800 mt-2 block">Vintage / Retro</span>
                              </div>

                              {/* 11. Minimalist Style */}
                              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-lg border border-gray-100">
                                  <img src={data.selectedLogo.imageUrl} alt="Minimalist" className="max-w-full max-h-full object-contain" style={{ filter: "contrast(1.5) brightness(1.05)" }} />
                                </div>
                                <span className="text-[8px] font-bold text-gray-500 mt-2 block">Minimalist</span>
                              </div>

                              {/* 12. Emblem / Badge Layout */}
                              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center">
                                  <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center p-1 overflow-hidden">
                                    <img src={data.selectedLogo.imageUrl} alt="Emblem" className="max-w-full max-h-full object-contain" />
                                  </div>
                                </div>
                                <span className="text-[8px] font-bold text-gray-500 mt-2 block">Emblem Badge</span>
                              </div>

                            </div>

                            {/* Continue Button for Variations Suite View */}
                            <div className="pt-4 flex justify-end">
                              <button
                                onClick={() => setStep(6)}
                                className="px-6 py-2.5 bg-[#090D16] text-white hover:bg-gray-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                              >
                                Continue to Social Media Visual Direction <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    // Case 2: No logo selected yet
                    <div className="space-y-5">
                      {/* Generation Actions / Prompt Trigger */}
                      {logoOptions.length === 0 && !isGeneratingLogos && (
                        <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-7 text-center space-y-4">
                          <div className="w-14 h-14 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center mx-auto">
                            <Palette className="w-7 h-7 text-[#06B6D4]" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">Generate Bespoke Brand Logo with AI</h4>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
                              Our AI will generate a premium, high-quality bespoke logo tailored to your brand personality using fal.ai Flux Dev.
                            </p>
                          </div>
                          <button
                            onClick={handleGenerateLogos}
                            className="px-6 py-2.5 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 mx-auto shadow-lg shadow-[#06B6D4]/20"
                          >
                            <Sparkles className="w-4 h-4" />
                            Generate Custom Logo
                          </button>
                        </div>
                      )}

                      {/* Loading skeleton */}
                      {isGeneratingLogos && (
                        <div className="space-y-5">
                          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center space-y-2">
                            <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin mx-auto" />
                            <h4 className="text-sm font-bold text-white">Generating 6 Brand Logos in Parallel...</h4>
                            <p className="text-xs text-gray-500">Calling fal.ai Flux Dev API. Please wait up to 10 seconds.</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className="aspect-square bg-gray-900/50 border border-gray-800 rounded-xl animate-pulse flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Error state */}
                      {logoError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Failed to generate logos</p>
                            <p className="text-red-600 mt-1">{formatFetchError(logoError)}</p>
                            <button
                              onClick={handleGenerateLogos}
                              className="mt-2 text-[#06B6D4] hover:underline font-bold"
                            >
                              Try Again
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Selection grid */}
                      {logoOptions.length > 0 && !isGeneratingLogos && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">Review Generated Logo</h4>
                              <p className="text-xs text-gray-400 mt-0.5">Approve this custom logo to instantly compile your 12 brand assets.</p>
                            </div>
                            <button
                              onClick={handleGenerateLogos}
                              className="text-[10px] text-gray-500 hover:text-gray-800 font-bold flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg transition-all"
                            >
                              <Sparkles className="w-3 h-3" /> Regenerate
                            </button>
                          </div>

                          <div className="max-w-md mx-auto">
                            {logoOptions.map((opt) => (
                              <div
                                key={opt.id}
                                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4"
                              >
                                {/* Logo Symbol Mark — inline SVG, no text */}
                                <div className="bg-gray-50 border border-gray-100 rounded-xl aspect-square w-full flex items-center justify-center p-6 overflow-hidden shadow-inner">
                                  {opt.svgContent ? (
                                    <div
                                      className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-full [&>svg]:h-full"
                                      dangerouslySetInnerHTML={{ __html: opt.svgContent }}
                                    />
                                  ) : opt.imageUrl ? (
                                    <img
                                      src={opt.imageUrl}
                                      alt={opt.name}
                                      className="max-h-[85%] max-w-[85%] object-contain rounded-lg"
                                    />
                                  ) : opt.error ? (
                                    <div className="text-center p-2 text-[10px] text-red-500 bg-red-50 rounded w-full">
                                      {formatFetchError(opt.error)}
                                    </div>
                                  ) : (
                                    <div className="text-center text-[10px] text-gray-400">No preview</div>
                                  )}
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <div>
                                    <span className="text-gray-400 block text-[9px]">LOGO STYLE</span>
                                    <span className="font-bold text-gray-800">{opt.name}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const svgForStorage = opt.svgContent
                                        ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(opt.svgContent)}`
                                        : opt.imageUrl;
                                      if (svgForStorage) {
                                        updateData({
                                          selectedLogo: {
                                            id: opt.id,
                                            name: opt.name,
                                            imageUrl: svgForStorage,
                                          },
                                        });
                                        setIsLogoApproved(true);
                                      }
                                    }}
                                    disabled={!opt.svgContent && !opt.imageUrl}
                                    className="px-5 py-2.5 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-[#06B6D4]/10 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Logo
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* ── SUB-TAB: MANUAL UPLOADS ── */}
              {data.kitType === "upload" && (
                <div className="space-y-6">
                  {/* Category 1: Core Branding Assets */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">1. Core Branding Assets</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {/* Primary Logo */}
                      <div className="border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between bg-white min-h-[140px]">
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                            <ImageIcon className="w-4 h-4 text-[#06B6D4]" />
                            Logo Graphic *
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Upload brand logo (SVG/PNG).</p>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                          {data.logoUrl ? (
                            <div className="relative w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center p-1 group overflow-hidden shadow-sm shrink-0">
                              <img src={data.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                              <button
                                onClick={() => removeUploadedFile("logo")}
                                className="absolute inset-0 bg-red-600/90 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <label className={`px-3 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0
                              ${uploadingField === "logo" ? "opacity-50 cursor-not-allowed" : ""}`}>
                              {uploadingField === "logo" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06B6D4]" /> : <UploadCloud className="w-3.5 h-3.5 text-gray-400" />}
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
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" /> Loaded
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Visual Media Assets */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">2. Visual Media Assets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Images */}
                      <div className="border border-gray-200/80 rounded-xl p-4 bg-white space-y-3">
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                            <ImageIcon className="w-4 h-4 text-[#06B6D4]" />
                            Product Images
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Upload product captures or catalogs.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {data.productImages.map((img, i) => (
                            <div key={i} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden group shrink-0">
                              <img src={img} alt="Product" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeUploadedFile("productImages", i)}
                                className="absolute inset-0 bg-red-600/90 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <label className={`w-12 h-12 border border-dashed border-gray-300 hover:border-brand-secondary rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-[#06B6D4] transition-colors cursor-pointer shrink-0
                            ${uploadingField === "productImages" ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {uploadingField === "productImages" ? <Loader2 className="w-4 h-4 animate-spin text-brand-secondary" /> : <Plus className="w-4 h-4" />}
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

                      {/* Team Photos */}
                      <div className="border border-gray-200/80 rounded-xl p-4 bg-white space-y-3">
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                            <Users className="w-4 h-4 text-[#06B6D4]" />
                            Team Photos
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Upload headshots or group captures.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {data.teamPhotos.map((img, i) => (
                            <div key={i} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden group shrink-0">
                              <img src={img} alt="Team" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeUploadedFile("teamPhotos", i)}
                                className="absolute inset-0 bg-red-600/90 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <label className={`w-12 h-12 border border-dashed border-gray-300 hover:border-brand-secondary rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-[#06B6D4] transition-colors cursor-pointer shrink-0
                            ${uploadingField === "teamPhotos" ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {uploadingField === "teamPhotos" ? <Loader2 className="w-4 h-4 animate-spin text-brand-secondary" /> : <Plus className="w-4 h-4" />}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleRealFileUpload(e, "teamPhotos")}
                              disabled={uploadingField !== null}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Office Images */}
                      <div className="border border-gray-200/80 rounded-xl p-4 bg-white space-y-3">
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                            <Building className="w-4 h-4 text-[#06B6D4]" />
                            Office & Workspace Images
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Upload building, workplace, or setup photos.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {data.officeImages.map((img, i) => (
                            <div key={i} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden group shrink-0">
                              <img src={img} alt="Office" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeUploadedFile("officeImages", i)}
                                className="absolute inset-0 bg-red-600/90 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <label className={`w-12 h-12 border border-dashed border-gray-300 hover:border-brand-secondary rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-[#06B6D4] transition-colors cursor-pointer shrink-0
                            ${uploadingField === "officeImages" ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {uploadingField === "officeImages" ? <Loader2 className="w-4 h-4 animate-spin text-brand-secondary" /> : <Plus className="w-4 h-4" />}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleRealFileUpload(e, "officeImages")}
                              disabled={uploadingField !== null}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Brand Videos */}
                      <div className="border border-gray-200/80 rounded-xl p-4 bg-white space-y-3">
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                            <Video className="w-4 h-4 text-[#06B6D4]" />
                            Brand Videos
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Upload promotional videos or teasers.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {data.brandVideos.map((vid, i) => (
                            <div key={i} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-900 flex items-center justify-center group shrink-0">
                              <Video className="w-5 h-5 text-white/50" />
                              <button
                                onClick={() => removeUploadedFile("brandVideos", i)}
                                className="absolute inset-0 bg-red-600/90 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <label className={`w-12 h-12 border border-dashed border-gray-300 hover:border-brand-secondary rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-[#06B6D4] transition-colors cursor-pointer shrink-0
                            ${uploadingField === "brandVideos" ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {uploadingField === "brandVideos" ? <Loader2 className="w-4 h-4 animate-spin text-brand-secondary" /> : <Plus className="w-4 h-4" />}
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => handleRealFileUpload(e, "brandVideos")}
                              disabled={uploadingField !== null}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category 3: Design System Resources */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">3. Design System Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Fonts */}
                      <div className="border border-gray-200/80 rounded-xl p-4 bg-white space-y-3">
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                            <Type className="w-4 h-4 text-[#06B6D4]" />
                            Brand Fonts
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Upload custom typography font files.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {data.fonts.map((f, i) => (
                            <div key={i} className="relative w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center group shrink-0">
                              <Type className="w-5 h-5 text-gray-400" />
                              <button
                                onClick={() => removeUploadedFile("fonts", i)}
                                className="absolute inset-0 bg-red-600/90 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <label className={`w-12 h-12 border border-dashed border-gray-300 hover:border-brand-secondary rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-[#06B6D4] transition-colors cursor-pointer shrink-0
                            ${uploadingField === "fonts" ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {uploadingField === "fonts" ? <Loader2 className="w-4 h-4 animate-spin text-brand-secondary" /> : <Plus className="w-4 h-4" />}
                            <input
                              type="file"
                              accept=".woff,.woff2,.ttf,.otf"
                              className="hidden"
                              onChange={(e) => handleRealFileUpload(e, "fonts")}
                              disabled={uploadingField !== null}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Icons */}
                      <div className="border border-gray-200/80 rounded-xl p-4 bg-white space-y-3">
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                            <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                            Brand Icons
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Upload custom SVG/PNG icon sets.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {data.icons.map((img, i) => (
                            <div key={i} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden group shrink-0">
                              <img src={img} alt="Icon" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeUploadedFile("icons", i)}
                                className="absolute inset-0 bg-red-600/90 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <label className={`w-12 h-12 border border-dashed border-gray-300 hover:border-brand-secondary rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-[#06B6D4] transition-colors cursor-pointer shrink-0
                            ${uploadingField === "icons" ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {uploadingField === "icons" ? <Loader2 className="w-4 h-4 animate-spin text-brand-secondary" /> : <Plus className="w-4 h-4" />}
                            <input
                              type="file"
                              accept="image/*,.svg"
                              className="hidden"
                              onChange={(e) => handleRealFileUpload(e, "icons")}
                              disabled={uploadingField !== null}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 6: Moodboard Studio 🌟 ─── */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Paintbrush className="w-5 h-5 text-[#06B6D4]" />
                  Social Media Visual Direction
                  <span className="ml-1 text-[9px] font-black text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Signature Feature</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Choose your brand&apos;s visual style. The approved direction defines the aesthetic direction for all your marketing material.
                </p>
              </div>

              {/* Case 1: Moodboard is selected */}
              {data.approvedMoodboard ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold text-gray-900">Approved Moodboard: {data.approvedMoodboard.name}</span>
                    </div>
                    <button
                      onClick={() => updateData({ approvedMoodboard: null })}
                      className="text-[10px] text-gray-400 hover:text-gray-700 font-bold flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Change Moodboard
                    </button>
                  </div>

                  {/* ── PREMIUM APPROVED MOODBOARD DISPLAY ── */}
                  <div className="relative overflow-hidden rounded-2xl border border-[#C9A84C]/30 shadow-2xl shadow-black/20 bg-gray-950">
                    {data.approvedMoodboard.imageUrl ? (
                      <>
                        {/* Thin gold top bar */}
                        <div className="absolute top-0 left-0 right-0 z-10 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

                        {/* Full-size moodboard image — shown large and dominant */}
                        <img
                          src={data.approvedMoodboard.imageUrl}
                          alt={data.approvedMoodboard.name}
                          className="w-full block object-cover object-top"
                        />

                        {/* Bottom overlay with branding */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent px-5 py-4 pt-16">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#C9A84C] mb-1.5 flex items-center gap-1">
                                <span>✦</span> Approved Visual Direction
                              </p>
                              <p className="text-white font-bold text-sm leading-tight">{data.approvedMoodboard.name}</p>
                              <p className="text-white/55 text-[10px] mt-0.5 max-w-xs">{data.approvedMoodboard.tagline}</p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1.5">
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                              <span className="text-[8px] text-[#C9A84C]/60 font-mono">{data.brandName}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-xs">
                        No image generated — click &quot;Change Moodboard&quot; and regenerate.
                      </div>
                    )}
                  </div>

                  {/* Bottom nudge */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 px-0.5">
                    <span>Visual direction locked for <strong className="text-gray-700">{data.brandName}</strong></span>
                    <span className="text-[#06B6D4] font-bold">Continue to finalize →</span>
                  </div>
                </div>
              ) : (
                // Case 2: No moodboard approved yet
                <div className="space-y-5">
                  {/* Action Trigger button */}
                  {moodOptions.length === 0 && !isGeneratingMoods && (
                    <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-7 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center mx-auto">
                        <Sparkles className="w-7 h-7 text-[#06B6D4]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Generate Custom Brand Moodboard with AI</h4>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
                          Our AI will generate a highly detailed visual moodboard matching your brand values, personality, and industry using fal.ai Flux.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateMoodboards}
                        className="px-6 py-2.5 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 mx-auto shadow-lg shadow-[#06B6D4]/20"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Custom Moodboard
                      </button>
                    </div>
                  )}

                  {/* Loading State */}
                  {isGeneratingMoods && (
                    <div className="space-y-5">
                      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center space-y-2">
                        <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin mx-auto" />
                        <h4 className="text-sm font-bold text-white">Generating 3 Moodboard Concepts in Parallel...</h4>
                        <p className="text-xs text-gray-500">Processing with fal.ai Flux. This may take up to 10 seconds.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="aspect-video bg-gray-900/50 border border-gray-800 rounded-xl animate-pulse flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {moodError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Failed to generate moodboards</p>
                        <p className="text-red-600 mt-1">{formatFetchError(moodError)}</p>
                        <button
                          onClick={handleGenerateMoodboards}
                          className="mt-2 text-[#06B6D4] hover:underline font-bold"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Moodboard Options grid */}
                  {moodOptions.length > 0 && !isGeneratingMoods && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">Select Visual Concept</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Select the concept that represents your brand values best. Click "Inspect Brand Board" to view the full design system dashboard.</p>
                        </div>
                        <button
                          onClick={handleGenerateMoodboards}
                          className="text-[10px] text-gray-500 hover:text-gray-800 font-bold flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Sparkles className="w-3 h-3" /> Regenerate
                        </button>
                      </div>

                      <div className={moodOptions.length === 1 ? "max-w-sm mx-auto w-full" : "grid grid-cols-1 md:grid-cols-3 gap-6"}>
                        {moodOptions.map((opt) => {
                          const preset = MOODBOARD_PRESETS[opt.id] || MOODBOARD_PRESETS.option_1;
                          const isApproved = data.approvedMoodboard?.id === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`bg-white border rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-lg group relative
                                ${isApproved ? "border-[#06B6D4] ring-2 ring-[#06B6D4]/20" : "border-gray-200/80"}`}
                            >
                              <div>
                                <div className="aspect-video bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-3 relative group-hover:scale-[1.01] transition-transform duration-300">
                                  {opt.imageUrl ? (
                                    <>
                                      <img
                                        src={opt.imageUrl}
                                        alt={opt.name}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setInspectingMoodboard(opt);
                                          }}
                                          className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-[10px] font-bold shadow-md hover:bg-gray-100 transition-colors"
                                        >
                                          Inspect Brand Board
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center p-2 text-[10px] text-red-500 bg-red-50 rounded">
                                      {formatFetchError(opt.error || "Failed to render")}
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-900">{opt.name}</span>
                                    {isApproved && <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Active</span>}
                                  </div>
                                  <p className="text-[9px] text-gray-400 leading-tight">{opt.tagline}</p>
                                </div>

                                {/* Micro Color & Font swatches */}
                                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                                  <div className="flex gap-1">
                                    {preset.colors.slice(0, 4).map((c, idx) => (
                                      <div
                                        key={idx}
                                        className="w-3.5 h-3.5 rounded-full border border-white shadow-sm shrink-0"
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[9px] text-gray-400 font-mono">
                                    {preset.typography.headline} / {preset.typography.body}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4 flex gap-2 w-full">
                                <button
                                  onClick={() => setInspectingMoodboard(opt)}
                                  className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg border border-gray-200 transition-colors"
                                >
                                  Inspect Board
                                </button>
                                <button
                                  disabled={!opt.imageUrl}
                                  onClick={() => {
                                    if (opt.imageUrl) {
                                      updateData({
                                        approvedMoodboard: {
                                          id: opt.id,
                                          name: opt.name,
                                          tagline: opt.tagline,
                                          imageUrl: opt.imageUrl,
                                        },
                                      });
                                    }
                                  }}
                                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors
                                    ${isApproved 
                                      ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                                      : "bg-brand-dark text-white hover:bg-brand-darkHover"}`}
                                >
                                  {isApproved ? "Approved" : "Approve & Select"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ─── LIVE BRAND BOARD SHEET PREVIEW MODAL 🎨 ─── */}
                  {inspectingMoodboard && (() => {
                    const preset = MOODBOARD_PRESETS[inspectingMoodboard.id] || MOODBOARD_PRESETS.option_1;
                    const isApproved = (data.approvedMoodboard as any)?.id === inspectingMoodboard.id;
                    const logoGraphic = (data.selectedLogo as any)?.imageUrl || data.logoUrl;
                    return (
                      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
                        <div 
                          className="w-full max-w-6xl rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl transition-all relative bg-white/95 backdrop-blur-lg text-slate-800"
                        >
                          {/* Close button top right */}
                          <button
                            onClick={() => setInspectingMoodboard(null)}
                            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>

                          {/* Top Header Section */}
                          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                                  Brand Board Direction
                                </span>
                                <span className="text-[10px] text-slate-400">Preset ID: {inspectingMoodboard.id}</span>
                              </div>
                              <h2 className="text-xl font-extrabold mt-1 text-slate-900">{inspectingMoodboard.name}</h2>
                              <p className="text-xs text-slate-500 font-medium">{inspectingMoodboard.tagline}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setInspectingMoodboard(null)}
                                className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-bold transition-all"
                              >
                                Close Board
                              </button>
                              <button
                                onClick={() => {
                                  if (inspectingMoodboard.imageUrl) {
                                    updateData({
                                      approvedMoodboard: {
                                        id: inspectingMoodboard.id,
                                        name: inspectingMoodboard.name,
                                        tagline: inspectingMoodboard.tagline,
                                        imageUrl: inspectingMoodboard.imageUrl,
                                      },
                                    });
                                    setInspectingMoodboard(null);
                                  }
                                }}
                                className="px-5 py-2 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-gray-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                              >
                                {isApproved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                {isApproved ? "Approved Direction" : "Approve & Apply Direction"}
                              </button>
                            </div>
                          </div>

                          {/* ── BRAND BOARD CANVAS GRID ── */}
                          <div className="p-5 md:p-7 grid grid-cols-1 md:grid-cols-12 gap-5 max-h-[72vh] overflow-y-auto">

                            {/* ── ROW 1 ── */}

                            {/* BLOCK A: Logo + Brand Identity (4 cols) */}
                            <div className="md:col-span-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Brand Identity</p>

                              {/* Logo circle — large and filled */}
                              <div className="flex flex-col items-center gap-3">
                                <div
                                  className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200 shadow-md bg-white"
                                  style={{ backgroundColor: userPrimaryColor || "#111" }}
                                >
                                  {(() => {
                                    const svgLogoOpt = logoOptions[0];
                                    const svgStr = (svgLogoOpt as any)?.svgContent;
                                    if (svgStr) {
                                      return (
                                        <div
                                          className="w-16 h-16 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                                          dangerouslySetInnerHTML={{ __html: svgStr }}
                                        />
                                      );
                                    }
                                    if (logoGraphic) {
                                      return <img src={logoGraphic} alt="Logo" className="w-14 h-14 object-contain" />;
                                    }
                                    return (
                                      <span className="text-2xl font-black text-white" style={{ fontFamily: "serif" }}>
                                        {(data.brandName || "B").charAt(0).toUpperCase()}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <div className="text-center">
                                  <p className="text-slate-800 font-bold text-base tracking-tight">{data.brandName}</p>
                                  <p className="text-slate-500 text-[10px] mt-0.5 italic max-w-[160px] text-center leading-snug">
                                    {data.usp ? `"${data.usp}"` : "No tagline set"}
                                  </p>
                                </div>
                              </div>

                              <div className="border-t border-slate-100 pt-3 space-y-1">
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-slate-400 uppercase tracking-wider">Industry</span>
                                  <span className="text-slate-700 font-bold">{data.industry}</span>
                                </div>
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-slate-400 uppercase tracking-wider">Personality</span>
                                  <span className="text-slate-700 font-bold capitalize">
                                    {Array.isArray(data.brandPersonality) ? (data.brandPersonality as string[]).join(", ") : String(data.brandPersonality)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* BLOCK B: Color Palette — from brand data (5 cols) */}
                            <div className="md:col-span-5 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Color Palette</p>
                              <div className="grid grid-cols-2 gap-3 flex-1">
                                {/* Primary color from user selection */}
                                <div className="space-y-2">
                                  <div
                                    className="h-20 w-full rounded-xl border border-slate-200 shadow-inner"
                                    style={{ backgroundColor: userPrimaryColor || "#1A0A00" }}
                                  />
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">Primary</p>
                                    <p className="text-[8px] text-slate-400 font-mono mt-0.5">{userPrimaryColor || "#1A0A00"}</p>
                                  </div>
                                </div>
                                {/* Secondary / accent */}
                                <div className="space-y-2">
                                  <div
                                    className="h-20 w-full rounded-xl border border-slate-200 shadow-inner"
                                    style={{ backgroundColor: userSecondaryColor || "#C9A84C" }}
                                  />
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">Accent</p>
                                    <p className="text-[8px] text-slate-400 font-mono mt-0.5">{userSecondaryColor || "#C9A84C"}</p>
                                  </div>
                                </div>
                                {/* Dark neutral */}
                                <div className="space-y-2">
                                  <div className="h-14 w-full rounded-xl border border-slate-200 bg-slate-900" />
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">Background</p>
                                    <p className="text-[8px] text-slate-400 font-mono mt-0.5">#0F172A</p>
                                  </div>
                                </div>
                                {/* White/light */}
                                <div className="space-y-2">
                                  <div className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50" />
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">Highlight</p>
                                    <p className="text-[8px] text-slate-400 font-mono mt-0.5">#F8FAFC</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* BLOCK C: Typography (3 cols) */}
                            <div className="md:col-span-3 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Typography System</p>
                              <div className="space-y-4 flex-1">
                                <div>
                                  <span className="text-[8px] text-slate-400 block mb-1 uppercase tracking-wider">Headline</span>
                                  <span className="text-lg font-bold text-slate-900 block tracking-tight" style={{ fontFamily: preset.typography.headline }}>
                                    {preset.typography.headline}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono block mt-1">AaBbCc 123</span>
                                </div>
                                <div>
                                  <span className="text-[8px] text-slate-400 block mb-1 uppercase tracking-wider">Body</span>
                                  <span className="text-sm text-slate-700 block" style={{ fontFamily: preset.typography.body }}>
                                    {preset.typography.body}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono block mt-1">aAbBcC 456</span>
                                </div>
                              </div>
                              <p className="text-[8px] text-slate-500 border-t border-slate-100 pt-2 leading-relaxed">
                                {preset.typography.desc}
                              </p>
                            </div>

                            {/* ── ROW 2 ── */}

                            {/* BLOCK D: Brand Mood & Tone — TEXT ONLY (5 cols) */}
                            <div className="md:col-span-5 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Brand Mood & Tone</p>

                              {/* Personality tags */}
                              <div className="flex flex-wrap gap-2">
                                {(Array.isArray(data.brandValues) ? data.brandValues : []).map((v: string) => (
                                  <span
                                    key={v}
                                    className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border bg-cyan-50/50 text-[#06B6D4] border-cyan-100/60"
                                  >
                                    {v}
                                  </span>
                                ))}
                              </div>

                              {/* Tone descriptors */}
                              <div className="space-y-2 flex-1">
                                <p className="text-[8px] text-slate-400 uppercase tracking-wider">Voice Attributes</p>
                                <div className="space-y-1.5">
                                  {[
                                    { label: "Tone", value: Array.isArray(data.brandPersonality) ? (data.brandPersonality as string[]).join(", ") : String(data.brandPersonality || "Professional") },
                                    { label: "Audience", value: data.targetAudience || "Not defined" },
                                    { label: "Mission", value: data.mission || "Not defined" },
                                  ].map(({ label, value }) => (
                                    <div key={label} className="flex gap-2 text-[9px]">
                                      <span className="text-slate-400 uppercase tracking-wider w-14 shrink-0">{label}</span>
                                      <span className="text-slate-600 leading-snug line-clamp-2">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Separator words */}
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                {preset.imageryTags.slice(0, 4).map((tag) => (
                                  <span key={tag} className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{tag}</span>
                                ))}
                              </div>
                            </div>

                            {/* BLOCK E: Social Post Visual Direction — approved moodboard (7 cols) */}
                            <div className="md:col-span-7 bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                              <div className="px-5 pt-5 pb-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Social Post Visual Direction</p>
                              </div>
                              {(() => {
                                const mb = data.approvedMoodboard as { id: string; name: string; tagline: string; imageUrl: string } | null;
                                return mb?.imageUrl ? (
                                  <div className="flex-1 relative">
                                    {/* Show the approved moodboard — NO logo overlay */}
                                    <img
                                      src={mb.imageUrl}
                                      alt="Approved Moodboard"
                                      className="w-full h-full object-cover object-top"
                                      style={{ minHeight: "200px", maxHeight: "280px" }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 py-3">
                                      <p className="text-[9px] text-[#C9A84C] font-black uppercase tracking-wider">✦ Approved Visual Direction</p>
                                      <p className="text-white text-[10px] font-bold mt-0.5">{mb.name}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex-1 flex items-center justify-center p-6 text-center">
                                    <div>
                                      <p className="text-slate-400 text-xs font-semibold">No moodboard approved yet.</p>
                                      <p className="text-slate-500 text-[10px] mt-1 leading-snug">Generate and approve a direction in the Social Media Visual Direction studio to see it here.</p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* ── ROW 3 — Full width: Visual Brain Summary ── */}
                            <div className="md:col-span-12 bg-slate-50/80 border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-5 shadow-sm">
                              <div className="space-y-2 flex-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual Brand Summary</p>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                  {data.businessDescription || preset.summary || `${data.brandName} is a ${data.industry} brand with a ${Array.isArray(data.brandPersonality) ? (data.brandPersonality as string[]).join(", ") : String(data.brandPersonality || "professional")} identity, serving ${data.targetAudience || "a global audience"}.`}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 md:shrink-0">
                                <div className="w-8 h-8 rounded-full border border-slate-200" style={{ backgroundColor: userPrimaryColor || "#1A0A00" }} />
                                <div className="w-8 h-8 rounded-full border border-slate-200" style={{ backgroundColor: userSecondaryColor || "#C9A84C" }} />
                                <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-900" />
                                <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50" />
                              </div>
                            </div>


                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}


          {/* â”€â”€â”€ Step 7: Review & Finalize â”€â”€â”€ */}
          {step === 7 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Review & Finalize Setup
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Double check your profile details. Clicking complete will compile your dynamic marketing database.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border border-gray-100 bg-gray-50/50 p-6 rounded-2xl">
                {/* DNA Summary */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand DNA Profile</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400 block text-[9px]">BRAND NAME</span>
                      <span className="font-semibold text-gray-800 text-sm">{data.brandName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">INDUSTRY / CATEGORY</span>
                      <span className="font-semibold text-gray-800">{data.industry} {data.category ? `(${data.category})` : ""}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">USP</span>
                      <p className="text-gray-600 font-medium leading-relaxed">{data.usp}</p>
                    </div>
                  </div>
                </div>

                {/* Identity Studio Summary */}
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-200/80 md:pl-6 pt-4 md:pt-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand Kit Specifications</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400 block text-[9px]">KIT TYPE CONFIGURATION</span>
                      <span className="font-semibold text-gray-800 capitalize">{data.kitType} Kit Mode</span>
                    </div>
                    
                    {data.kitType === "generate" && data.selectedLogo ? (
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400 block text-[9px]">PRIMARY LOGO MARK</span>
                          <div className="h-14 w-32 bg-gray-50 border border-gray-100 rounded p-1 flex items-center justify-center mt-1">
                            <img
                              src={data.selectedLogo.imageUrl}
                              alt={data.selectedLogo.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[9px]">LOGO STYLE</span>
                          <span className="font-bold text-gray-800">{data.selectedLogo.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[9px]">LOGO SOURCE</span>
                        <span className="font-semibold text-gray-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
                          {data.logoUrl ? "Uploaded Custom Logo" : "Not Provided"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Approved Moodboard Summary */}
              {data.approvedMoodboard && (
                <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#06B6D4] mb-1">Approved Moodboard Concept</p>
                      <p className="text-gray-900 font-bold text-base">{data.approvedMoodboard.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{data.approvedMoodboard.tagline}</p>
                    </div>
                    {data.approvedMoodboard.imageUrl && (
                      <div className="w-40 h-24 rounded-lg overflow-hidden border border-gray-100 shrink-0">
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
          <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className={`flex items-center gap-1 text-xs font-bold transition-all uppercase tracking-wider
                ${step === 1 || isSubmitting ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-800"}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {step < 7 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
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
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                className="flex items-center gap-1 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-white bg-[#06B6D4] hover:bg-[#06B6D4]/95 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Compiling Brand Workspace..." : "Complete Setup"}
                {!isSubmitting && <Check className="w-4 h-4" />}
              </button>
            )}
          </div>

        </div>
      </main>

      <footer className="px-6 py-4 text-center border-t border-gray-100 bg-white">
        <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1 font-semibold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-gray-300" />
          Secure 256-bit encryption Â· GDPR & DPDP compliant
        </p>
      </footer>
    </div>
  );
}

