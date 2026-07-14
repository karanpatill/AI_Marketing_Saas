"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Sparkles,
  Building, Target, Shield, ShieldCheck, Compass,
  Laptop, Globe, Plus, Trash2, Tag, Key, Info, HelpCircle,
  Loader2, Search, CheckCircle2, ChevronRight, Zap,
  Image as ImageIcon, FileText, Video, Type, Paintbrush,
  Layers, UploadCloud, Eye, Users
} from "lucide-react";
import Navbar from "@/components/Navbar";

// --- Types ---
type BrandKit = {
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
  guidelines: {
    safeZone: string;
    minSize: string;
    rules: string[];
  };
  assets: {
    primaryLogoSvg: string;
    secondaryLogoSvg: string;
    monogramSvg: string;
    iconSvg: string;
    faviconSvg: string;
    socialIconsSvg: string;
    appIconSvg: string;
  };
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
  brandKitGenerated: BrandKit | null;

  // Moodboard Studio (Phase 3)
  approvedMoodboard: MoodboardStyle | null;
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
  brandKitGenerated: null,

  // Moodboard Studio defaults
  approvedMoodboard: null,
};

// ─── Moodboard Style Definitions ───
const MOODBOARD_STYLES: { id: string; name: string; tagline: string; emoji: string; gradient: string; accentGradient: string; palette: { hex: string; name: string }[]; keywords: string[]; typography: { headline: string; body: string }; texture: string }[] = [
  { id: "luxury", name: "Dark Luxury", tagline: "Opulent · Exclusive · Timeless", emoji: "👑",
    gradient: "linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 50%, #2D1B00 100%)",
    accentGradient: "linear-gradient(90deg, #C9A84C, #8B6914)",
    palette: [{ hex: "#0D0D0D", name: "Obsidian" }, { hex: "#C9A84C", name: "Gold Leaf" }, { hex: "#F5E6C8", name: "Champagne" }],
    keywords: ["Exclusive", "Refined", "Heritage", "Prestige"],
    typography: { headline: "Playfair Display", body: "Cormorant Garamond" },
    texture: "Fine-grain leather · Gold foil · Black silk" },
  { id: "minimal", name: "Minimal Pure", tagline: "Clean · Breathable · Essential", emoji: "◻️",
    gradient: "linear-gradient(135deg, #FAFAFA 0%, #F2EFE9 100%)",
    accentGradient: "linear-gradient(90deg, #1C1C1C, #8C8C8C)",
    palette: [{ hex: "#FAFAFA", name: "Snow" }, { hex: "#1C1C1C", name: "Graphite" }, { hex: "#F2EFE9", name: "Ivory" }],
    keywords: ["Clarity", "Breathing Room", "Precision", "Pure"],
    typography: { headline: "Inter", body: "Inter" },
    texture: "Uncoated matte · Hairlines · Whitespace" },
  { id: "premium", name: "Premium Steel", tagline: "Sharp · Confident · Authority", emoji: "⚡",
    gradient: "linear-gradient(135deg, #0A1628 0%, #1a2744 50%, #0D1F3C 100%)",
    accentGradient: "linear-gradient(90deg, #0066FF, #C0C0C8)",
    palette: [{ hex: "#0A1628", name: "Navy Depths" }, { hex: "#C0C0C8", name: "Chrome" }, { hex: "#0066FF", name: "Electric Blue" }],
    keywords: ["Authority", "Innovation", "Technology", "Forward"],
    typography: { headline: "Montserrat", body: "Source Sans Pro" },
    texture: "Brushed aluminum · Carbon fiber · Polished steel" },
  { id: "modern", name: "Modern Vivid", tagline: "Dynamic · Fresh · Digital-First", emoji: "🚀",
    gradient: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
    accentGradient: "linear-gradient(90deg, #4F46E5, #7C3AED)",
    palette: [{ hex: "#4F46E5", name: "Deep Violet" }, { hex: "#06B6D4", name: "Cyan" }, { hex: "#FFFFFF", name: "White" }],
    keywords: ["Vibrant", "Digital", "Scalable", "Fluid"],
    typography: { headline: "Plus Jakarta Sans", body: "DM Sans" },
    texture: "Glass morphism · Soft shadows · Gradient mesh" },
  { id: "editorial", name: "Editorial", tagline: "Structured · Journalistic · Authoritative", emoji: "📰",
    gradient: "linear-gradient(135deg, #FAF9F7 0%, #E8E4DC 100%)",
    accentGradient: "linear-gradient(90deg, #CC2929, #111111)",
    palette: [{ hex: "#FAF9F7", name: "Newsprint" }, { hex: "#CC2929", name: "Crimson" }, { hex: "#111111", name: "Press Black" }],
    keywords: ["Credibility", "Narrative", "Structure", "Voice"],
    typography: { headline: "Libre Baskerville", body: "Merriweather" },
    texture: "Newsprint grain · Column grid · Editorial spacing" },
  { id: "apple", name: "Apple Style", tagline: "Precise · Human · Magical", emoji: "🍎",
    gradient: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)",
    accentGradient: "linear-gradient(90deg, #0071E3, #00A3FF)",
    palette: [{ hex: "#FFFFFF", name: "Pure White" }, { hex: "#1D1D1F", name: "SF Black" }, { hex: "#0071E3", name: "Apple Blue" }],
    keywords: ["Simplicity", "Craftsmanship", "Delight", "Intuitive"],
    typography: { headline: "SF Pro Display", body: "SF Pro Text" },
    texture: "Anodized aluminum · Gorilla glass · Retina" },
  { id: "tesla", name: "Tesla Style", tagline: "Future · Electric · Inevitable", emoji: "⚡",
    gradient: "linear-gradient(135deg, #101010 0%, #1C1C1C 100%)",
    accentGradient: "linear-gradient(90deg, #CC0000, #880000)",
    palette: [{ hex: "#101010", name: "Space Black" }, { hex: "#CC0000", name: "Tesla Red" }, { hex: "#E8E8E8", name: "Chrome" }],
    keywords: ["Electrified", "Engineered", "Revolutionary", "Pure"],
    typography: { headline: "Gotham", body: "Inter" },
    texture: "Carbon fiber · Matte finish · Precision" },
  { id: "nike", name: "Nike Style", tagline: "Bold · Motion · Victory", emoji: "✓",
    gradient: "linear-gradient(135deg, #000000 0%, #2A2A2A 100%)",
    accentGradient: "linear-gradient(90deg, #FF4500, #DFFF00)",
    palette: [{ hex: "#000000", name: "Jet Black" }, { hex: "#FF4500", name: "Signal Orange" }, { hex: "#DFFF00", name: "Volt" }],
    keywords: ["Motion", "Power", "Victory", "Relentless"],
    typography: { headline: "Futura PT", body: "Helvetica Neue" },
    texture: "Performance fabric · Motion blur · Impact photography" },
  { id: "scandinavian", name: "Scandinavian", tagline: "Hygge · Natural · Balanced", emoji: "🌿",
    gradient: "linear-gradient(135deg, #F7F4EF 0%, #E8DFD0 100%)",
    accentGradient: "linear-gradient(90deg, #2D4A3E, #8FAF8F)",
    palette: [{ hex: "#F7F4EF", name: "Birch" }, { hex: "#2D4A3E", name: "Forest" }, { hex: "#8FAF8F", name: "Sage" }],
    keywords: ["Hygge", "Functional", "Nature", "Calm"],
    typography: { headline: "Josefin Sans", body: "Lato" },
    texture: "Raw wood · Linen · Ceramic matte · Natural stone" },
  { id: "softPastel", name: "Soft Pastel", tagline: "Gentle · Joyful · Nurturing", emoji: "🌸",
    gradient: "linear-gradient(135deg, #FDDDE6 0%, #E8D5F5 50%, #D5F5E3 100%)",
    accentGradient: "linear-gradient(90deg, #FDDDE6, #E8D5F5)",
    palette: [{ hex: "#FDDDE6", name: "Blush" }, { hex: "#E8D5F5", name: "Lavender" }, { hex: "#D5F5E3", name: "Mint" }],
    keywords: ["Warmth", "Gentle", "Creative", "Joyful"],
    typography: { headline: "Nunito", body: "Nunito Sans" },
    texture: "Watercolor · Soft brushstrokes · Delicate patterns" },
  { id: "boldStartup", name: "Bold Startup", tagline: "Disruptive · Energetic · Fearless", emoji: "💥",
    gradient: "linear-gradient(135deg, #0A0A0A 0%, #1A0A00 100%)",
    accentGradient: "linear-gradient(90deg, #FFD700, #FF2D78)",
    palette: [{ hex: "#0A0A0A", name: "Night" }, { hex: "#FFD700", name: "Electric Yellow" }, { hex: "#FF2D78", name: "Hot Pink" }],
    keywords: ["Disruptive", "Fearless", "Hype", "Energy"],
    typography: { headline: "Space Grotesk", body: "Space Mono" },
    texture: "Street art · Digital noise · Neon glow" },
  { id: "corporate", name: "Corporate Pro", tagline: "Trustworthy · Structured · Global", emoji: "🏢",
    gradient: "linear-gradient(135deg, #003580 0%, #1a4d99 100%)",
    accentGradient: "linear-gradient(90deg, #003580, #4A7FC1)",
    palette: [{ hex: "#003580", name: "Corporate Blue" }, { hex: "#FDFCFB", name: "Warm White" }, { hex: "#4A7FC1", name: "Steel Blue" }],
    keywords: ["Professional", "Global", "Reliable", "Leadership"],
    typography: { headline: "Arial", body: "Georgia" },
    texture: "Embossed paper · Clean grid · Professional photography" },
  { id: "magazine", name: "Magazine", tagline: "Curated · Visual · Aspirational", emoji: "📖",
    gradient: "linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)",
    accentGradient: "linear-gradient(90deg, #E63946, #0A0A0A)",
    palette: [{ hex: "#0A0A0A", name: "Rich Black" }, { hex: "#FFFEF9", name: "Magazine White" }, { hex: "#E63946", name: "Accent Red" }],
    keywords: ["Aspirational", "Curated", "Sophisticated", "Iconic"],
    typography: { headline: "Didot", body: "Garamond" },
    texture: "Glossy print · Full-bleed photography · White margin" },
  { id: "fashion", name: "Fashion House", tagline: "Iconic · Avant-garde · Signature", emoji: "👗",
    gradient: "linear-gradient(135deg, #F5F0EA 0%, #C9978A 100%)",
    accentGradient: "linear-gradient(90deg, #1A1A1A, #C19A6B)",
    palette: [{ hex: "#F5F0EA", name: "Porcelain" }, { hex: "#1A1A1A", name: "Onyx" }, { hex: "#C9978A", name: "Dusty Rose" }],
    keywords: ["Iconic", "Avant-garde", "Signature", "Wearable Art"],
    typography: { headline: "Vogue", body: "Times New Roman" },
    texture: "Silk fabric · Runway · Couture stitching" },
  { id: "lifestyle", name: "Lifestyle", tagline: "Real · Warm · Community", emoji: "☀️",
    gradient: "linear-gradient(135deg, #FFF8F0 0%, #F4845F 100%)",
    accentGradient: "linear-gradient(90deg, #F4845F, #F6C26A)",
    palette: [{ hex: "#FFF8F0", name: "Cream" }, { hex: "#F4845F", name: "Sunset Orange" }, { hex: "#F6C26A", name: "Golden Hour" }],
    keywords: ["Authentic", "Community", "Real Moments", "Joy"],
    typography: { headline: "Poppins", body: "Open Sans" },
    texture: "Golden hour photography · Linen · Real moments" },
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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Autofill / Upload Loading States
  const [scanningUrl, setScanningUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [customValueInput, setCustomValueInput] = useState("");
  const [newProductInput, setNewProductInput] = useState("");
  const [newServiceInput, setNewServiceInput] = useState("");
  const [newCompetitorInput, setNewCompetitorInput] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Moodboard Studio states
  const [moodboardGenerating, setMoodboardGenerating] = useState<string | null>(null);
  const [moodboardPreviews, setMoodboardPreviews] = useState<Record<string, { generated: boolean }>>({});
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("automarc_onboarding_v4");
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
      localStorage.setItem("automarc_onboarding_v4", JSON.stringify(updated));
      return updated;
    });
  };

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Generate moodboard preview for a single style
  const generateMoodboardPreview = async (styleId: string) => {
    setMoodboardGenerating(styleId);
    try {
      await fetch("/api/generate-moodboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: styleId,
          brandName: data.brandName,
          industry: data.industry,
          brandPersonality: data.brandPersonality,
          brandValues: data.brandValues,
          usp: data.usp,
        }),
      });
      // Mark as generated (image comes when API key is set)
      setMoodboardPreviews((prev) => ({ ...prev, [styleId]: { generated: true } }));
    } catch (e) {
      console.error(e);
    } finally {
      setMoodboardGenerating(null);
    }
  };

  const approveMoodboard = (styleId: string) => {
    const style = MOODBOARD_STYLES.find((s) => s.id === styleId);
    if (!style) return;
    // Build full MoodboardStyle object
    const approved = {
      id: style.id,
      name: style.name,
      tagline: style.tagline,
      palette: style.palette.map((p) => ({ name: p.name, hex: p.hex, role: "" })),
      typography: { headline: style.typography.headline, body: style.typography.body, style: "" },
      keywords: style.keywords,
      gradient: style.gradient,
      accentGradient: style.accentGradient,
      texture: style.texture,
      imagePrompt: `${style.name} moodboard for ${data.brandName}`,
      generatedImageUrl: null,
    };
    updateData({ approvedMoodboard: approved });
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

  // Local Premium Mock Generator that cycles styles dynamically without server cost
  const handleGenerateBrandKit = () => {
    setIsGeneratingLogo(true);

    setTimeout(() => {
      // Cycle through 5 beautiful brand style schemes
      const themeIndex = Math.floor(Math.random() * 5);
      
      const themes = [
        {
          primaryHex: "#0F172A", // Slate
          secondaryHex: "#06B6D4", // Cyan
          primaryRgb: "15, 23, 42",
          secondaryRgb: "6, 182, 212",
          primaryCmyk: "64%, 45%, 0%, 84%",
          secondaryCmyk: "97%, 0%, 0%, 17%",
          pantoneApprox: "Pantone 2965 C / Pantone 3005 C"
        },
        {
          primaryHex: "#1E1B4B", // Midnight Indigo
          secondaryHex: "#F43F5E", // Rose
          primaryRgb: "30, 27, 75",
          secondaryRgb: "244, 63, 94",
          primaryCmyk: "60%, 64%, 0%, 71%",
          secondaryCmyk: "0%, 74%, 61%, 4%",
          pantoneApprox: "Pantone 276 C / Pantone 1925 C"
        },
        {
          primaryHex: "#064E3B", // Emerald
          secondaryHex: "#F59E0B", // Amber
          primaryRgb: "6, 78, 59",
          secondaryRgb: "245, 158, 11",
          primaryCmyk: "92%, 0%, 24%, 69%",
          secondaryCmyk: "0%, 36%, 96%, 4%",
          pantoneApprox: "Pantone 3435 C / Pantone 137 C"
        },
        {
          primaryHex: "#030712", // Obsidian
          secondaryHex: "#6366F1", // Indigo
          primaryRgb: "3, 7, 18",
          secondaryRgb: "99, 102, 241",
          primaryCmyk: "83%, 61%, 0%, 93%",
          secondaryCmyk: "59%, 58%, 0%, 5%",
          pantoneApprox: "Pantone Black 6 C / Pantone 2726 C"
        },
        {
          primaryHex: "#1C1917", // Charcoal
          secondaryHex: "#84CC16", // Lime
          primaryRgb: "28, 25, 23",
          secondaryRgb: "132, 204, 22",
          primaryCmyk: "0%, 11%, 18%, 89%",
          secondaryCmyk: "35%, 0%, 89%, 20%",
          pantoneApprox: "Pantone 426 C / Pantone 382 C"
        }
      ];

      const t = themes[themeIndex];
      const name = data.brandName || "Asenra";
      const initial = name.charAt(0).toUpperCase();

      // Custom high-quality vector geometric mark templates
      const iconTemplates = [
        // Triangle/Wing tech mark
        `<g stroke="${t.secondaryHex}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M 30,70 L 50,30 L 70,70" />
          <path d="M 40,55 L 60,55" />
          <path d="M 50,30 L 50,70" opacity="0.3" />
         </g>`,
        // Hexagon Node
        `<g stroke="${t.secondaryHex}" stroke-width="4.5" fill="none">
          <polygon points="50,22 75,37 75,65 50,80 25,65 25,37" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="50" cy="51" r="14" fill="${t.secondaryHex}" fill-opacity="0.15" />
          <circle cx="50" cy="51" r="5" fill="${t.secondaryHex}" />
         </g>`,
        // Wave/Infinity Loop
        `<g fill="none" stroke="${t.secondaryHex}" stroke-width="5.5" stroke-linecap="round">
          <path d="M 30,50 C 30,35 45,35 50,50 C 55,65 70,65 70,50 C 70,35 55,35 50,50 C 45,65 30,65 30,50 Z" />
         </g>`,
        // Shield Emblem
        `<g fill="none" stroke="${t.secondaryHex}" stroke-width="5" stroke-linejoin="round">
          <path d="M 32,28 L 68,28 L 64,58 C 59,70 50,76 50,76 C 50,76 41,70 36,58 Z" />
          <circle cx="50" cy="46" r="7" fill="${t.secondaryHex}" />
         </g>`,
        // Modern Aperture Circle
        `<g fill="none" stroke="${t.secondaryHex}" stroke-width="4.5">
          <circle cx="50" cy="50" r="25" />
          <path d="M 32,32 L 68,68" />
          <path d="M 68,32 L 32,68" />
          <circle cx="50" cy="50" r="9" fill="${t.secondaryHex}" />
         </g>`
      ];

      const activeIcon = iconTemplates[themeIndex];

      const primaryLogoSvg = `<svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="12" fill="${t.primaryHex}"/>
        <g transform="translate(10, 0) scale(0.6)">${activeIcon}</g>
        <text x="75" y="36" fill="#FFFFFF" font-family="'Outfit', 'Montserrat', sans-serif" font-size="17" font-weight="bold" letter-spacing="1">${name}</text>
      </svg>`;

      const secondaryLogoSvg = `<svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
        <g transform="translate(10, 0) scale(0.6)">${activeIcon}</g>
        <text x="75" y="36" fill="${t.primaryHex}" font-family="'Outfit', 'Montserrat', sans-serif" font-size="17" font-weight="bold" letter-spacing="1">${name}</text>
      </svg>`;

      const monogramSvg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="24" fill="${t.primaryHex}"/>
        <circle cx="50" cy="50" r="36" stroke="${t.secondaryHex}" stroke-width="2" stroke-dasharray="4 4" opacity="0.4"/>
        <text x="50%" y="59%" fill="${t.secondaryHex}" font-family="'Outfit', 'Montserrat', sans-serif" font-size="44" font-weight="900" text-anchor="middle">${initial}</text>
      </svg>`;

      const iconSvg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="24" fill="${t.primaryHex}"/>
        ${activeIcon}
      </svg>`;

      const faviconSvg = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="${t.primaryHex}"/>
        <text x="50%" y="64%" fill="${t.secondaryHex}" font-family="'Outfit', 'Montserrat', sans-serif" font-weight="bold" font-size="19" text-anchor="middle">${initial}</text>
      </svg>`;

      const socialIconsSvg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="${t.primaryHex}"/>
        <g transform="translate(10, 10) scale(0.8)">${activeIcon}</g>
      </svg>`;

      const appIconSvg = `<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="112" fill="${t.primaryHex}"/>
        <g transform="translate(106, 106) scale(3)">${activeIcon}</g>
      </svg>`;

      updateData({
        brandKitGenerated: {
          colors: t,
          typography: {
            primaryFont: "Outfit (Headings)",
            bodyFont: "Inter (Body)",
            usage: `Use Outfit for display headers, banners, and campaign taglines for ${name}. Use Inter for general body text.`,
          },
          guidelines: {
            safeZone: "Safe zone is defined as 20% of the logo's width/height margins on all sides.",
            minSize: "Digital: 32px width | Print: 0.5 inches width.",
            rules: [
              "Do keep a transparent background wherever possible.",
              "Do not stretch, distort, or rotate the logo icon.",
              `Do not alter the primary ${t.primaryHex} brand color.`,
            ],
          },
          assets: {
            primaryLogoSvg,
            secondaryLogoSvg,
            monogramSvg,
            iconSvg,
            faviconSvg,
            socialIconsSvg,
            appIconSvg,
          },
        }
      });
      setIsGeneratingLogo(false);
    }, 800);
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
        return data.kitType === "generate" 
          ? data.brandKitGenerated !== null 
          : (data.logoUrl || "").trim().length > 0;
      case 6:
        // Moodboard Studio — must approve one moodboard
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
        logo_url: data.kitType === "generate" ? "generated_logo_studio" : data.logoUrl,
        product_images: data.productImages,
        team_photos: data.teamPhotos,
        office_images: data.officeImages,
        brand_videos: data.brandVideos,
        fonts: data.fonts,
        icons: data.icons,
        brand_guidelines: data.kitType === "generate" 
          ? JSON.stringify(data.brandKitGenerated?.guidelines || {}) 
          : data.brandGuidelinesFile,
        logo_studio_data: data.kitType === "generate" ? (data.brandKitGenerated || {}) : {},
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

      localStorage.removeItem("automarc_onboarding_v4");
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
        <div className="absolute right-6 -top-5 text-[9px] font-bold text-gray-400 tracking-wider">
          STEP {step} OF 7
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-6 max-w-4xl mx-auto w-full">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] w-full">

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

          {/* ─── Step 2: Brand Identity & Values ─── */}
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

                  <div className="md:col-span-2">
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
                            ×
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
                            ×
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
                            ×
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

          {/* ─── Step 4: Channels & Goal ─── */}
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

          {/* ─── Step 5: Brand Identity Studio (Upload or Generate with AI) ─── */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-up">
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

              {/* ── SUB-TAB: AI LOGO STUDIO ── */}
              {data.kitType === "generate" && (
                <div className="space-y-5">
                  {!data.brandKitGenerated ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center space-y-4">
                      <Sparkles className="w-10 h-10 text-[#06B6D4] mx-auto animate-pulse" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-950">One-Click AI Brand Kit Compilation</h4>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                          No extra forms. We compile logos, monograms, color guides, and clearances based on your Brand DNA.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateBrandKit}
                        disabled={isGeneratingLogo}
                        className="px-6 py-2.5 bg-brand-dark text-white hover:bg-brand-darkHover text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 mx-auto"
                      >
                        {isGeneratingLogo ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06B6D4]" />
                            Compiling Kit...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
                            Generate Style Kit
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                      {/* Logo previews */}
                      <div className="md:col-span-2 bg-white border border-gray-100 rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Compiled Graphics</p>
                          <button
                            onClick={handleGenerateBrandKit}
                            disabled={isGeneratingLogo}
                            className="text-[10px] text-[#06B6D4] hover:text-[#06B6D4]/80 font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            {isGeneratingLogo ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            {isGeneratingLogo ? "Regenerating..." : "Regenerate"}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-900 rounded-lg p-3 text-center space-y-1">
                            <span className="text-[8px] text-white/40 block">PRIMARY LOGO</span>
                            <div className="h-10 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: data.brandKitGenerated.assets.primaryLogoSvg }} />
                          </div>
                          <div className="bg-white border border-gray-100 rounded-lg p-3 text-center space-y-1">
                            <span className="text-[8px] text-gray-400 block">SECONDARY LOGO</span>
                            <div className="h-10 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: data.brandKitGenerated.assets.secondaryLogoSvg }} />
                          </div>
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex flex-col justify-between items-center">
                            <span className="text-[8px] text-gray-400 block mb-1">MONOGRAM</span>
                            <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: data.brandKitGenerated.assets.monogramSvg }} />
                          </div>
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex flex-col justify-between items-center">
                            <span className="text-[8px] text-gray-400 block mb-1">FAVICON</span>
                            <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: data.brandKitGenerated.assets.faviconSvg }} />
                          </div>
                        </div>
                      </div>

                      {/* Specifications Summary */}
                      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Brand Style Guidelines</p>
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] text-gray-400 block">PRIMARY COLOR</span>
                            <div className="flex items-center gap-1.5 font-bold text-gray-800 font-mono">
                              <span className="w-3.5 h-3.5 rounded border border-gray-200" style={{ backgroundColor: data.brandKitGenerated.colors.primaryHex }} />
                              {data.brandKitGenerated.colors.primaryHex}
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 block">SECONDARY COLOR</span>
                            <div className="flex items-center gap-1.5 font-bold text-[#06B6D4] font-mono">
                              <span className="w-3.5 h-3.5 rounded border border-gray-200" style={{ backgroundColor: data.brandKitGenerated.colors.secondaryHex }} />
                              {data.brandKitGenerated.colors.secondaryHex}
                            </div>
                          </div>
                          <div className="border-t border-gray-100 pt-2 space-y-1 text-[10px] text-gray-400 font-mono">
                            <div>CMYK: {data.brandKitGenerated.colors.primaryCmyk}</div>
                            <div>PANTONE: {data.brandKitGenerated.colors.pantoneApprox.split("/")[0]}</div>
                          </div>
                        </div>
                      </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      {/* Brand Guidelines */}
                      <div className="border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between bg-white min-h-[140px]">
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                            <FileText className="w-4 h-4 text-[#06B6D4]" />
                            Guidelines Document
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Upload stylebook guidelines PDF/DOC.</p>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                          {data.brandGuidelinesFile ? (
                            <div className="relative flex items-center gap-2 p-1.5 rounded-lg border border-gray-200 bg-gray-50 max-w-full shrink-0">
                              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="min-w-0 pr-5">
                                <a href={data.brandGuidelinesFile} target="_blank" rel="noreferrer" className="text-[9px] text-[#06B6D4] hover:underline font-semibold block truncate">View Guidelines</a>
                              </div>
                              <button
                                onClick={() => removeUploadedFile("guidelines")}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center shadow-sm"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <label className={`px-3 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0
                              ${uploadingField === "guidelines" ? "opacity-50 cursor-not-allowed" : ""}`}>
                              {uploadingField === "guidelines" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06B6D4]" /> : <UploadCloud className="w-3.5 h-3.5 text-gray-400" />}
                              Upload PDF
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                className="hidden"
                                onChange={(e) => handleRealFileUpload(e, "guidelines")}
                                disabled={uploadingField !== null}
                              />
                            </label>
                          )}
                          {data.brandGuidelinesFile && (
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

          {/* ─── Step 6: Moodboard Studio ⭐ ─── */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Paintbrush className="w-5 h-5 text-[#06B6D4]" />
                  Moodboard Studio
                  <span className="ml-1 text-[9px] font-black text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Signature Feature</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Choose your brand&apos;s visual soul. The approved moodboard becomes your brand&apos;s permanent visual memory — influencing every future AI generation.
                </p>
              </div>

              {/* Approved Banner */}
              {data.approvedMoodboard && (
                <div
                  className="relative overflow-hidden rounded-2xl p-5 border-2 border-[#06B6D4]/30"
                  style={{ background: data.approvedMoodboard.gradient }}
                >
                  <div className="absolute inset-0 opacity-20" style={{ background: data.approvedMoodboard.accentGradient }} />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Visual Brain Locked In</span>
                      </div>
                      <p className="text-white font-bold text-base">{data.approvedMoodboard.name}</p>
                      <p className="text-white/70 text-[10px] mt-0.5">{data.approvedMoodboard.tagline}</p>
                      <div className="flex gap-1.5 mt-2">
                        {data.approvedMoodboard.palette.slice(0, 4).map((p) => (
                          <div
                            key={p.hex}
                            className="w-5 h-5 rounded-full border-2 border-white/30 shadow-sm"
                            style={{ backgroundColor: p.hex }}
                            title={p.name}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => updateData({ approvedMoodboard: null })}
                      className="text-white/50 hover:text-white text-[10px] font-bold uppercase tracking-wider border border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {/* Style Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {MOODBOARD_STYLES.map((style) => {
                  const isApproved = data.approvedMoodboard?.id === style.id;
                  const isGenerating = moodboardGenerating === style.id;
                  return (
                    <div
                      key={style.id}
                      onMouseEnter={() => setHoveredMood(style.id)}
                      onMouseLeave={() => setHoveredMood(null)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${
                        isApproved
                          ? "ring-2 ring-[#06B6D4] ring-offset-2 scale-[1.02]"
                          : "hover:scale-[1.02] hover:shadow-lg"
                      }`}
                    >
                      {/* Gradient Visual */}
                      <div
                        className="h-28 w-full relative"
                        style={{ background: style.gradient }}
                      >
                        {/* Accent line at bottom */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1"
                          style={{ background: style.accentGradient }}
                        />

                        {/* Color swatches overlay */}
                        <div className="absolute bottom-3 left-3 flex gap-1">
                          {style.palette.map((p) => (
                            <div
                              key={p.hex}
                              className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                              style={{ backgroundColor: p.hex }}
                              title={p.name}
                            />
                          ))}
                        </div>

                        {/* Approved check */}
                        {isApproved && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#06B6D4] rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}

                        {/* Emoji badge */}
                        <div className="absolute top-2 left-2 text-lg leading-none">{style.emoji}</div>

                        {/* Hover overlay with actions */}
                        <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 transition-opacity duration-200 ${
                          hoveredMood === style.id && !isApproved ? "opacity-100" : "opacity-0"
                        }`}>
                          <button
                            onClick={() => approveMoodboard(style.id)}
                            className="px-3 py-1.5 bg-[#06B6D4] text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg hover:bg-[#06B6D4]/90 transition-colors"
                          >
                            ✓ Approve This
                          </button>
                          <button
                            onClick={() => generateMoodboardPreview(style.id)}
                            disabled={isGenerating}
                            className="px-3 py-1 bg-white/10 border border-white/30 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-white/20 transition-colors flex items-center gap-1"
                          >
                            {isGenerating ? (
                              <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Generating...</>
                            ) : (
                              <><Sparkles className="w-2.5 h-2.5" /> Preview with AI</>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="bg-white border border-gray-100 px-2.5 py-2">
                        <p className="text-[11px] font-bold text-gray-900 leading-tight">{style.name}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{style.tagline}</p>
                        <div className="flex flex-wrap gap-0.5 mt-1.5">
                          {style.keywords.slice(0, 2).map((kw) => (
                            <span key={kw} className="text-[8px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Typography & Texture Preview for Approved */}
              {data.approvedMoodboard && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Typography System</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Headline Font</span>
                        <span className="text-[11px] font-bold text-gray-800">{data.approvedMoodboard.typography.headline}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Body Font</span>
                        <span className="text-[11px] font-bold text-gray-800">{data.approvedMoodboard.typography.body}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Texture & Feel</p>
                    <p className="text-[10px] text-gray-600 leading-relaxed">{data.approvedMoodboard.texture}</p>
                  </div>
                </div>
              )}

              {/* Helper text */}
              {!data.approvedMoodboard && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Eye className="w-3 h-3 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-amber-800">Hover a card to approve or preview with AI</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      When your Gemini API key is connected, clicking &ldquo;Preview with AI&rdquo; will generate a real branded moodboard image tailored to {data.brandName || "your brand"}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 7: Review & Finalize ─── */}
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
                    
                    {data.kitType === "generate" && data.brandKitGenerated ? (
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400 block text-[9px]">PRIMARY LOGO MARK</span>
                          <div className="h-10 w-32 bg-gray-900 rounded p-1 flex items-center justify-center mt-1" dangerouslySetInnerHTML={{ __html: data.brandKitGenerated.assets.primaryLogoSvg }} />
                        </div>
                        <div className="flex gap-2">
                          <div>
                            <span className="text-gray-400 block text-[9px]">PRIMARY COLOR</span>
                            <span className="font-semibold font-mono text-gray-800">{data.brandKitGenerated.colors.primaryHex}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px]">SECONDARY COLOR</span>
                            <span className="font-semibold font-mono text-[#06B6D4]">{data.brandKitGenerated.colors.secondaryHex}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[9px]">LOGO UPLOADED</span>
                        <span className="font-semibold text-gray-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
                          File active (Transparent logo)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Approved Moodboard Summary */}
              {data.approvedMoodboard && (
                <div
                  className="relative overflow-hidden rounded-2xl p-5"
                  style={{ background: data.approvedMoodboard.gradient }}
                >
                  <div className="absolute inset-0 opacity-10" style={{ background: data.approvedMoodboard.accentGradient }} />
                  <div className="relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Visual Brain</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">{data.approvedMoodboard.name}</p>
                        <p className="text-white/60 text-[10px]">{data.approvedMoodboard.tagline}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {data.approvedMoodboard.palette.slice(0, 5).map((p) => (
                          <div key={p.hex} className="w-5 h-5 rounded-full border-2 border-white/30" style={{ backgroundColor: p.hex }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {data.approvedMoodboard.keywords.map((kw) => (
                        <span key={kw} className="text-[9px] font-semibold text-white/70 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
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
          Secure 256-bit encryption · GDPR & DPDP compliant
        </p>
      </footer>
    </div>
  );
}
