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
  const [activeTab, setActiveTab] = useState<"control" | "dna" | "campaigns" | "mix" | "studio" | "carousel" | "video">("control");

  // Post Generator Studio States
  const [postPrompt, setPostPrompt] = useState("");
  const [postAspectRatio, setPostAspectRatio] = useState("square");
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [generatedPostImage, setGeneratedPostImage] = useState<string | null>(null);
  const [generatedPostPrompt, setGeneratedPostPrompt] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);

  // Carousel Generator Studio States
  const [carouselPrompt, setCarouselPrompt] = useState("");
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);
  const [generatedCarouselImage, setGeneratedCarouselImage] = useState<string | null>(null);
  const [generatedCarouselPrompt, setGeneratedCarouselPrompt] = useState<string | null>(null);
  const [carouselSlides, setCarouselSlides] = useState<any[]>([]);
  const [carouselError, setCarouselError] = useState<string | null>(null);

  // Video Generator Studio States
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState("10s");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoQueueStatus, setVideoQueueStatus] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedVideoPrompt, setGeneratedVideoPrompt] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

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

  const handleGeneratePost = async () => {
    if (!postPrompt.trim()) return;
    setIsGeneratingPost(true);
    setPostError(null);
    setGeneratedPostImage(null);
    setGeneratedPostPrompt(null);

    const activeColors = assets?.logo_studio_data?.colors || {
      primaryHex: "#0D0D0D",
      secondaryHex: "#C9A84C"
    };

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: postPrompt,
          aspectRatio: postAspectRatio,
          brandName: dna?.brand_name,
          industry: dna?.industry,
          businessDescription: dna?.business_description,
          brandPersonality: dna?.brand_personality,
          brandValues: dna?.brand_values,
          usp: dna?.usp,
          primaryColor: activeColors.primaryHex,
          secondaryColor: activeColors.secondaryHex,
          approvedMoodboard: dna?.approved_moodboard,
          website: dna?.website,
          category: dna?.category,
          subCategory: dna?.sub_category,
          mission: dna?.mission,
          vision: dna?.vision,
          products: dna?.products,
          services: dna?.services,
          targetAudience: dna?.target_audience,
          customerPersonas: dna?.customer_personas,
          competitors: dna?.competitors,
          logoUrl: assets?.logo_url,
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

      setGeneratedPostImage(result.imageUrl);
      setGeneratedPostPrompt(result.fluxPrompt);
    } catch (e: any) {
      console.error("Post generation error:", e);
      setPostError(e.message || "Failed to generate post image.");
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleGenerateCarousel = async () => {
    if (!carouselPrompt.trim()) return;
    setIsGeneratingCarousel(true);
    setCarouselError(null);
    setGeneratedCarouselImage(null);
    setGeneratedCarouselPrompt(null);
    setCarouselSlides([]);

    const activeColors = assets?.logo_studio_data?.colors || {
      primaryHex: "#0D0D0D",
      secondaryHex: "#C9A84C"
    };

    try {
      const res = await fetch("/api/generate-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: carouselPrompt,
          brandName: dna?.brand_name,
          industry: dna?.industry,
          businessDescription: dna?.business_description,
          brandPersonality: dna?.brand_personality,
          brandValues: dna?.brand_values,
          usp: dna?.usp,
          primaryColor: activeColors.primaryHex,
          secondaryColor: activeColors.secondaryHex,
          approvedMoodboard: dna?.approved_moodboard,
          website: dna?.website,
          category: dna?.category,
          subCategory: dna?.sub_category,
          mission: dna?.mission,
          vision: dna?.vision,
          products: dna?.products,
          services: dna?.services,
          targetAudience: dna?.target_audience,
          customerPersonas: dna?.customer_personas,
          competitors: dna?.competitors,
          logoUrl: assets?.logo_url,
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

      setGeneratedCarouselImage(result.imageUrl);
      setGeneratedCarouselPrompt(result.fluxPrompt);
      setCarouselSlides(result.slides || []);
    } catch (e: any) {
      console.error("Carousel generation error:", e);
      setCarouselError(e.message || "Failed to generate carousel slides.");
    } finally {
      setIsGeneratingCarousel(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setIsGeneratingVideo(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);
    setGeneratedVideoPrompt(null);
    setVideoQueueStatus("Initiating video creative direction...");

    const activeColors = assets?.logo_studio_data?.colors || {
      primaryHex: "#0D0D0D",
      secondaryHex: "#C9A84C"
    };

    try {
      // 1. Submit to queue
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: videoPrompt,
          duration: videoDuration,
          brandName: dna?.brand_name,
          industry: dna?.industry,
          businessDescription: dna?.business_description,
          brandPersonality: dna?.brand_personality,
          brandValues: dna?.brand_values,
          usp: dna?.usp,
          primaryColor: activeColors.primaryHex,
          secondaryColor: activeColors.secondaryHex,
          approvedMoodboard: dna?.approved_moodboard,
          website: dna?.website,
          category: dna?.category,
          subCategory: dna?.sub_category,
          mission: dna?.mission,
          vision: dna?.vision,
          products: dna?.products,
          services: dna?.services,
          targetAudience: dna?.target_audience,
          customerPersonas: dna?.customer_personas,
          competitors: dna?.competitors,
          logoUrl: assets?.logo_url,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server returned ${res.status}`);
      }

      const submission = await res.json();
      if (submission.error) {
        throw new Error(submission.error);
      }

      const { requestId, videoPrompt: finalPrompt } = submission;
      setGeneratedVideoPrompt(finalPrompt);
      setVideoQueueStatus("Added to Meituan LongCat Queue...");

      // 2. Poll status
      let attempts = 0;
      const maxAttempts = 120; // Up to 7 minutes
      const delayMs = 3500;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        
        try {
          const statusRes = await fetch("/api/generate-video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId }),
          });
          if (!statusRes.ok) {
            console.warn(`Transient status check fail (code ${statusRes.status}). Retrying...`);
            attempts++;
            continue;
          }

          const statusData = await statusRes.json();
          if (statusData.error) {
            throw new Error(statusData.error.message || "Video generation failed in queue.");
          }

          const currentStatus = statusData.status;
          console.log(`LongCat video queue check: ${currentStatus}`);

          if (currentStatus === "COMPLETED") {
            if (!statusData.videoUrl) {
              throw new Error("No output video URL was returned from finished request.");
            }
            setGeneratedVideoUrl(statusData.videoUrl);
            setVideoQueueStatus(null);
            break;
          } else if (currentStatus === "FAILED") {
            throw new Error("Video generation processing failed on Fal AI.");
          } else if (currentStatus === "IN_PROGRESS") {
            setVideoQueueStatus("Generating frames (Meituan LongCat)...");
            // Reset attempts so we never time out as long as the GPU is actively rendering
            attempts = 0;
          } else {
            setVideoQueueStatus(`Queue status: ${currentStatus || "IN_QUEUE"}`);
            attempts++;
          }
        } catch (pollErr: any) {
          console.warn("Transient poll error:", pollErr.message);
          if (pollErr.message.includes("failed on Fal AI") || pollErr.message.includes("No output video URL")) {
            throw pollErr;
          }
          // Continue polling on transient connection issues
          attempts++;
        }
      }

      if (attempts >= maxAttempts) {
        throw new Error("Video generation timed out. Please try again.");
      }

    } catch (e: any) {
      console.error("Video generation error:", e);
      setVideoError(e.message || "Failed to generate video.");
      setVideoQueueStatus(null);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Fetch latest DNA & Assets from Supabase
  useEffect(() => {
    async function fetchWorkspaceData() {
      try {
        const { supabase } = await import("@/lib/supabase");
        
        const params = new URLSearchParams(window.location.search);
        const queryId = params.get("id") || params.get("brandDnaId");

        let dnaData = null;
        let dnaError = null;

        if (queryId) {
          const res = await supabase
            .from("brand_dna")
            .select("*")
            .eq("id", queryId)
            .maybeSingle();
          dnaData = res.data;
          dnaError = res.error;
        } else {
          const res = await supabase
            .from("brand_dna")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          dnaData = res.data;
          dnaError = res.error;
        }

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

  // --- Resolve Style Concept Presets ---
  const styleId = moodboard?.id || "";
  const styleName = moodboard?.name || "";
  
  const isDarkPremium = styleId === "option_1" || styleName.toLowerCase().includes("dark") || styleName.toLowerCase().includes("luxury");
  const isCleanMinimal = styleId === "option_2" || styleName.toLowerCase().includes("minimal") || styleName.toLowerCase().includes("clean");
  const isVibrantDigital = styleId === "option_3" || styleName.toLowerCase().includes("vibrant") || styleName.toLowerCase().includes("digital") || styleName.toLowerCase().includes("tech");

  // --- Dynamic Color System ---
  const colors = assets?.logo_studio_data?.colors || (isDarkPremium ? {
    primaryHex: "#0D0D0D",
    secondaryHex: "#C9A84C",
    primaryRgb: "13, 13, 13",
    secondaryRgb: "201, 168, 76",
    primaryCmyk: "70%, 50%, 0%, 95%",
    pantoneApprox: "Pantone Black 6 C / Pantone 871 C"
  } : isCleanMinimal ? {
    primaryHex: "#111018",
    secondaryHex: "#A3B19B",
    primaryRgb: "17, 16, 24",
    secondaryRgb: "163, 177, 155",
    primaryCmyk: "30%, 33%, 0%, 91%",
    pantoneApprox: "Pantone 426 C / Pantone 5635 C"
  } : {
    primaryHex: "#0F172A",
    secondaryHex: "#06B6D4",
    primaryRgb: "15, 23, 42",
    secondaryRgb: "6, 182, 212",
    primaryCmyk: "64%, 45%, 0%, 84%",
    pantoneApprox: "Pantone 2965 C"
  });

  const typography = assets?.logo_studio_data?.typography || (isDarkPremium ? {
    primaryFont: "Cinzel",
    bodyFont: "Montserrat",
    usage: "Use Cinzel for editorial headlines and Montserrat for details."
  } : isCleanMinimal ? {
    primaryFont: "Playfair Display",
    bodyFont: "Inter",
    usage: "Use Playfair Display for display text and Inter for body copy."
  } : {
    primaryFont: "Outfit",
    bodyFont: "Inter",
    usage: "Use Outfit for display headers, Inter for general text."
  });

  // --- Fallback Mood Images based on style ---
  const getStyleImages = (styleId: string) => {
    const isOption1 = styleId === "option_1" || isDarkPremium;
    const isOption2 = styleId === "option_2" || isCleanMinimal;
    
    if (isOption1) {
      return [
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80"
      ];
    } else if (isOption2) {
      return [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
        "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80"
      ];
    } else { // Vibrant Digital (option_3)
      return [
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80"
      ];
    }
  };

  const baseMoodImages = getStyleImages(moodboard?.id || "default");

  // Blend approved AI-generated moodboard image as the primary image
  const moodImages = [
    moodboard?.imageUrl || assets?.office_images?.[0] || baseMoodImages[0],
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

  // If no uploaded imagery direction, use baseMoodImages as placeholders, blending the AI moodboard image
  const activeImageryList = [
    ...(moodboard?.imageUrl ? [moodboard.imageUrl] : []),
    ...imageryDirection
  ].slice(0, 5);

  if (activeImageryList.length === 0) {
    activeImageryList.push(...baseMoodImages);
  }

  const styleGradients = isDarkPremium ? {
    primary: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)",
    accent: "linear-gradient(135deg, #C9A84C 0%, #E5C158 100%)"
  } : isCleanMinimal ? {
    primary: "linear-gradient(135deg, #F5F5F5 0%, #E5E5E5 100%)",
    accent: "linear-gradient(135deg, #A3B19B 0%, #BCC9B5 100%)"
  } : {
    primary: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    accent: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)"
  };

  const gradients = [
    { name: "Primary Gradient", style: styleGradients.primary },
    { name: "Accent Gradient", style: styleGradients.accent },
    { name: "Silk Soft", style: `linear-gradient(135deg, ${colors.primaryHex} 0%, #111827 100%)` },
    { name: "Gold Leather", style: `linear-gradient(135deg, ${colors.secondaryHex} 0%, #374151 100%)` }
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

              <button
                onClick={() => setActiveTab("studio")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "studio"
                    ? "bg-brand-dark text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>Post Generator Studio</span>
              </button>

              <button
                onClick={() => setActiveTab("carousel")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "carousel"
                    ? "bg-brand-dark text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
              >
                <Plus className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Carousel Studio</span>
              </button>

              <button
                onClick={() => setActiveTab("video")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "video"
                    ? "bg-brand-dark text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
              >
                <Video className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Video Studio</span>
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
            <div className="bg-white text-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl relative overflow-hidden font-sans space-y-6">
              
              {/* Top Header Section */}
              <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      Brand Board Direction
                    </span>
                    {moodboard?.id && (
                      <span className="text-[10px] text-slate-400">Preset ID: {moodboard.id}</span>
                    )}
                  </div>
                  <h1 className="text-xl font-extrabold mt-1 text-slate-900 uppercase tracking-tight">{dna.brand_name}</h1>
                  <p className="text-xs text-slate-500 font-medium">
                    {moodboard?.name || "Bespoke Brand Strategy Board"} {moodboard?.tagline ? `— ${moodboard.tagline}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
                  <span><strong>Industry:</strong> {dna.industry}</span>
                  <span>•</span>
                  <span><strong>Category:</strong> {dna.category}</span>
                </div>
              </div>

              {/* ── BRAND BOARD CANVAS GRID ── */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                {/* ── ROW 1 ── */}

                {/* BLOCK A: Logo + Brand Identity (4 cols) */}
                <div className="md:col-span-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Brand Identity</p>

                  {/* Logo circle — large and filled */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200 shadow-md bg-white"
                      style={{ backgroundColor: colors.primaryHex || "#111" }}
                    >
                      {(() => {
                        const svgStr = assets?.logo_studio_data?.assets?.primaryLogoSvg;
                        if (svgStr) {
                          return (
                            <div
                              className="w-16 h-16 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                              dangerouslySetInnerHTML={{ __html: svgStr }}
                            />
                          );
                        }
                        if (assets?.logo_url) {
                          return <img src={assets.logo_url} alt="Logo" className="w-14 h-14 object-contain" />;
                        }
                        return (
                          <span className="text-2xl font-black text-white" style={{ fontFamily: "serif" }}>
                            {(dna.brand_name || "B").charAt(0).toUpperCase()}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-center">
                      <p className="text-slate-800 font-bold text-base tracking-tight">{dna.brand_name}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5 italic max-w-[160px] text-center leading-snug">
                        {dna.usp ? `"${dna.usp}"` : "No tagline set"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-slate-400 uppercase tracking-wider">Industry</span>
                      <span className="text-slate-700 font-bold">{dna.industry}</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-slate-400 uppercase tracking-wider">Personality</span>
                      <span className="text-slate-700 font-bold capitalize">
                        {dna.brand_personality}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BLOCK B: Color Palette (5 cols) */}
                <div className="md:col-span-5 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Color Palette</p>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    {/* Primary */}
                    <div className="space-y-2">
                      <div
                        className="h-20 w-full rounded-xl border border-slate-200 shadow-inner"
                        style={{ backgroundColor: colors.primaryHex || "#1A0A00" }}
                      />
                      <div>
                        <p className="text-[9px] font-bold text-slate-885 uppercase tracking-wider">Primary</p>
                        <p className="text-[8px] text-slate-400 font-mono mt-0.5">{colors.primaryHex || "#1A0A00"}</p>
                      </div>
                    </div>
                    {/* Accent */}
                    <div className="space-y-2">
                      <div
                        className="h-20 w-full rounded-xl border border-slate-200 shadow-inner"
                        style={{ backgroundColor: colors.secondaryHex || "#C9A84C" }}
                      />
                      <div>
                        <p className="text-[9px] font-bold text-slate-885 uppercase tracking-wider">Accent</p>
                        <p className="text-[8px] text-slate-400 font-mono mt-0.5">{colors.secondaryHex || "#C9A84C"}</p>
                      </div>
                    </div>
                    {/* Dark neutral */}
                    <div className="space-y-2">
                      <div className="h-14 w-full rounded-xl border border-slate-200 bg-slate-900" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-885 uppercase tracking-wider">Background</p>
                        <p className="text-[8px] text-slate-400 font-mono mt-0.5">#0F172A</p>
                      </div>
                    </div>
                    {/* White/light */}
                    <div className="space-y-2">
                      <div className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-885 uppercase tracking-wider">Highlight</p>
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
                      <span className="text-lg font-bold text-slate-900 block tracking-tight" style={{ fontFamily: typography.primaryFont }}>
                        {typography.primaryFont}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">AaBbCc 123</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block mb-1 uppercase tracking-wider">Body</span>
                      <span className="text-sm text-slate-700 block" style={{ fontFamily: typography.bodyFont }}>
                        {typography.bodyFont}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">aAbBcC 456</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-slate-500 border-t border-slate-100 pt-2 leading-relaxed font-mono">
                    {typography.usage}
                  </p>
                </div>

                {/* ── ROW 2 ── */}

                {/* BLOCK D: Brand Mood & Tone — TEXT ONLY (5 cols) */}
                <div className="md:col-span-5 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Brand Mood & Tone</p>

                  {/* Personality tags */}
                  <div className="flex flex-wrap gap-2">
                    {(dna.brand_values || []).map((v) => (
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
                        { label: "Tone", value: dna.brand_personality || "Professional" },
                        { label: "Audience", value: dna.target_audience || "Not defined" },
                        { label: "Mission", value: dna.mission || "Not defined" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-2 text-[9px]">
                          <span className="text-slate-400 uppercase tracking-wider w-14 shrink-0">{label}</span>
                          <span className="text-slate-600 leading-snug line-clamp-2">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Separator words */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Luxurious</span>
                    <span>•</span>
                    <span>Timeless</span>
                    <span>•</span>
                    <span>Exclusive</span>
                  </div>
                </div>

                {/* BLOCK E: Social Post Visual Direction — approved moodboard (7 cols) */}
                <div className="md:col-span-7 bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                  <div className="px-5 pt-5 pb-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Social Post Visual Direction</p>
                  </div>
                  {moodboard?.imageUrl ? (
                    <div className="flex-1 relative">
                      {/* Show approved moodboard — NO logo overlay */}
                      <img
                        src={moodboard.imageUrl}
                        alt="Approved Moodboard"
                        className="w-full h-full object-cover object-top"
                        style={{ minHeight: "200px", maxHeight: "280px" }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 py-3">
                        <p className="text-[9px] text-[#C9A84C] font-black uppercase tracking-wider">✦ Approved Visual Direction</p>
                        <p className="text-white text-[10px] font-bold mt-0.5">{moodboard.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6 text-center">
                      <div>
                        <p className="text-slate-400 text-xs font-semibold">No moodboard approved yet.</p>
                        <p className="text-slate-500 text-[10px] mt-1 leading-snug">Generate and approve a direction in the onboarding visual direction step.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── ROW 3 — Full width: Visual Brain Summary ── */}
                <div className="md:col-span-12 bg-slate-50/80 border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-5 shadow-sm">
                  <div className="space-y-2 flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual Brand Summary</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {dna.business_description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 md:shrink-0">
                    <div className="w-8 h-8 rounded-full border border-slate-200" style={{ backgroundColor: colors.primaryHex || "#1A0A00" }} />
                    <div className="w-8 h-8 rounded-full border border-slate-200" style={{ backgroundColor: colors.secondaryHex || "#C9A84C" }} />
                    <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-900" />
                    <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50" />
                  </div>
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
                          (() => {
                            const activeFontName = typography.primaryFont || "Outfit";
                            const f = activeFontName.toLowerCase();
                            const activeFontStyle = f.includes("cinzel") 
                              ? "tracking-[0.15em] font-black uppercase text-[10px]"
                              : f.includes("syne")
                              ? "tracking-wider font-extrabold uppercase text-[10px]"
                              : f.includes("montserrat")
                              ? "tracking-[0.2em] font-light uppercase text-[8px]"
                              : f.includes("playfair")
                              ? "tracking-wider font-extrabold italic text-[10px]"
                              : "tracking-widest font-black uppercase text-[10px]";
                            const displayActiveBrandName = f.includes("montserrat") 
                              ? dna.brand_name.toUpperCase() 
                              : dna.brand_name;
                            return (
                              <div className="w-32 h-32 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner bg-gradient-to-b from-white to-gray-50/30">
                                <div className="flex-1 flex items-center justify-center w-full">
                                  <img src={assets.logo_url} alt="Symbol Mark" className="max-h-[55%] max-w-[55%] object-contain" />
                                </div>
                                <div className="pt-1 text-center">
                                  <span 
                                    className={`text-gray-900 ${activeFontStyle}`}
                                    style={{ fontFamily: activeFontName }}
                                  >
                                    {displayActiveBrandName}
                                  </span>
                                </div>
                              </div>
                            );
                          })()
                        ) : assets.logo_studio_data?.assets?.primaryLogoSvg ? (
                          <div className="w-24 h-24 bg-gray-950 rounded-xl flex items-center justify-center p-2 shadow-sm" dangerouslySetInnerHTML={{ __html: assets.logo_studio_data.assets.primaryLogoSvg }} />
                        ) : (
                          <span className="text-gray-400 italic text-[10px]">No logo uploaded or generated</span>
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

                  {/* Logo Variations Suite Grid */}
                  {assets && (
                    (() => {
                      const logoSource = assets.logo_url || assets.logo_studio_data?.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80";
                      
                      const getFontImport = (fontName: string) => {
                        const f = (fontName || "").toLowerCase();
                        if (f.includes("cinzel")) {
                          return "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');";
                        }
                        if (f.includes("syne")) {
                          return "@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');";
                        }
                        if (f.includes("montserrat")) {
                          return "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;400;700&display=swap');";
                        }
                        if (f.includes("playfair")) {
                          return "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;950&display=swap');";
                        }
                        return "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&display=swap');";
                      };

                      const getFontStyle = (fontName: string) => {
                        const f = (fontName || "").toLowerCase();
                        if (f.includes("cinzel")) {
                          return "tracking-[0.15em] font-black uppercase text-[10px]";
                        }
                        if (f.includes("syne")) {
                          return "tracking-wider font-extrabold uppercase text-[10px]";
                        }
                        if (f.includes("montserrat")) {
                          return "tracking-[0.2em] font-light uppercase text-[8px]";
                        }
                        if (f.includes("playfair")) {
                          return "tracking-wider font-extrabold italic text-[10px]";
                        }
                        return "tracking-widest font-black uppercase text-[10px]";
                      };

                      const displayBrandName = (typography.primaryFont || "").toLowerCase().includes("montserrat") 
                        ? dna.brand_name.toUpperCase() 
                        : dna.brand_name;

                      return (
                        <div className="border-t border-gray-100 pt-5 mt-5">
                          <style dangerouslySetInnerHTML={{ __html: getFontImport(typography.primaryFont) }} />
                          <span className="text-gray-400 block mb-3 font-bold uppercase tracking-wider text-[10px]">
                            Dynamic Logo Variations Suite (12+ Custom Layouts & Formats)
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {/* 1. Primary Full Color */}
                            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-white rounded-lg border border-gray-100">
                                <img src={logoSource} alt="Primary" className="max-w-full max-h-full object-contain" />
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-2 block">Primary Full Color</span>
                            </div>

                            {/* 2. Solid Black Silhouette */}
                            <div className="bg-white border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-white rounded-lg">
                                <img src={logoSource} alt="Solid Black" className="max-w-full max-h-full object-contain" style={{ filter: "grayscale(1) contrast(1000%)" }} />
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-2 block">Black Version</span>
                            </div>

                            {/* 3. Solid White (Inverted) */}
                            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-black rounded-lg">
                                <img src={logoSource} alt="Solid White" className="max-w-full max-h-full object-contain" style={{ filter: "grayscale(1) contrast(1000%) invert(1)" }} />
                              </div>
                              <span className="text-[8px] font-bold text-gray-400 mt-2 block">White Inverted</span>
                            </div>

                            {/* 4. Grayscale */}
                            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-white rounded-lg border border-gray-100">
                                <img src={logoSource} alt="Grayscale" className="max-w-full max-h-full object-contain" style={{ filter: "grayscale(1)" }} />
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-2 block">Grayscale</span>
                            </div>

                            {/* 5. Watermark */}
                            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-white rounded-lg border border-gray-100 relative">
                                <img src={logoSource} alt="Watermark" className="max-w-full max-h-full object-contain opacity-20" />
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-2 block">Watermark (20% Op)</span>
                            </div>

                            {/* 6. Favicon / Icon Version */}
                            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex items-center justify-center">
                                <div className="w-7 h-7 rounded-lg bg-gray-900 border border-white/10 flex items-center justify-center p-0.5 overflow-hidden shadow-sm">
                                  <img src={logoSource} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                </div>
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-2 block">Favicon / App Icon</span>
                            </div>

                            {/* 7. Wordmark / Typographic */}
                            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex items-center justify-center">
                                <span 
                                  className={`text-[10px] text-gray-900 text-center font-bold ${getFontStyle(typography.primaryFont)}`}
                                  style={{ fontFamily: typography.primaryFont }}
                                >
                                  {displayBrandName}
                                </span>
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-2 block">Wordmark / Text</span>
                            </div>

                            {/* 8. Horizontal Layout */}
                            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm col-span-2 sm:col-span-1">
                              <div className="w-full h-14 flex items-center justify-center gap-1.5 px-1 bg-white rounded-lg border border-gray-100">
                                <img src={logoSource} alt="Icon" className="w-4 h-4 object-contain" style={{ filter: "grayscale(1) contrast(1000%)" }} />
                                <span 
                                  className="text-[8px] font-bold text-gray-900 uppercase truncate max-w-[50px]"
                                  style={{ fontFamily: typography.primaryFont }}
                                >
                                  {displayBrandName}
                                </span>
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-2 block">Horizontal Layout</span>
                            </div>

                            {/* 9. Stacked / Vertical Layout */}
                            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex flex-col items-center justify-center gap-0.5 bg-white rounded-lg border border-gray-100">
                                <img src={logoSource} alt="Icon" className="w-4 h-4 object-contain" style={{ filter: "grayscale(1) contrast(1000%)" }} />
                                <span 
                                  className="text-[7px] font-bold text-gray-900 max-w-[45px] truncate text-center uppercase"
                                  style={{ fontFamily: typography.primaryFont }}
                                >
                                  {displayBrandName}
                                </span>
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-2 block">Vertical Stacked</span>
                            </div>

                            {/* 10. Vintage Style */}
                            <div className="bg-[#FAF6EE] border border-[#EBE3D5] rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-[#FAF6EE] rounded-lg">
                                <img src={logoSource} alt="Vintage" className="max-w-full max-h-full object-contain" style={{ filter: "sepia(0.8) contrast(1.2)" }} />
                              </div>
                              <span className="text-[8px] font-bold text-amber-800 mt-2 block">Vintage / Retro</span>
                            </div>

                            {/* 11. Minimalist Style */}
                            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-white rounded-lg border border-gray-100">
                                <img src={logoSource} alt="Minimalist" className="max-w-full max-h-full object-contain" style={{ filter: "contrast(1.5) brightness(1.05)" }} />
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-2 block">Minimalist</span>
                            </div>

                            {/* 12. Emblem / Badge Layout */}
                            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-sm">
                              <div className="w-14 h-14 flex items-center justify-center">
                                <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center p-1 overflow-hidden">
                                  <img src={logoSource} alt="Emblem" className="max-w-full max-h-full object-contain" />
                                </div>
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-2 block">Emblem Badge</span>
                            </div>

                          </div>
                        </div>
                      );
                    })()
                  ) || null}

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
          {/* Tab 5: Post Generator Studio */}
          {activeTab === "studio" && (
            <div className="space-y-6 animate-fade-up">
              {/* Header */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Image className="w-4 h-4 text-[#06B6D4]" />
                    Post Generator Studio
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Generate premium, brand-consistent marketing graphics using Flux Schnell.
                  </p>
                </div>
                {/* Active Brand Visual Indicator */}
                <div className="flex items-center gap-2 bg-[#0D0D0D] px-3.5 py-2 rounded-xl border border-gray-800 text-[10px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Brand Guidelines Active</span>
                  <div className="flex items-center gap-1 ml-1.5 border-l border-gray-800 pl-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: assets?.logo_studio_data?.colors?.primaryHex || "#0D0D0D" }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: assets?.logo_studio_data?.colors?.secondaryHex || "#C9A84C" }} />
                  </div>
                </div>
              </div>

              {/* Main Studio Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left panel: Prompt & Settings (5 Cols) */}
                <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Describe your post topic / idea
                    </label>
                    <textarea
                      value={postPrompt}
                      onChange={(e) => setPostPrompt(e.target.value)}
                      placeholder="e.g. A premium, minimal advertisement post showcasing a luxury watch with sleek metallic textures and dark dramatic lighting..."
                      className="w-full h-32 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-xs bg-white text-gray-900 outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Ratio Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "square", label: "Square (1:1)", desc: "Feed Posts" },
                        { id: "portrait", label: "Portrait (9:16)", desc: "Stories / Reels" },
                        { id: "landscape", label: "Landscape (16:9)", desc: "Banners" },
                      ].map((r) => {
                        const active = postAspectRatio === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setPostAspectRatio(r.id)}
                            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5
                              ${active
                                ? "bg-[#090D16] border-[#090D16] text-white"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                          >
                            <span className="text-xs font-bold">{r.label}</span>
                            <span className="text-[8px] opacity-75">{r.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleGeneratePost}
                    disabled={isGeneratingPost || !postPrompt.trim()}
                    className="w-full py-3 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#06B6D4]/15 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isGeneratingPost ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Post...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Custom Graphic
                      </>
                    )}
                  </button>

                  {/* Brand Guidelines alignment card */}
                  {dna && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-[10px] text-gray-500 space-y-1.5">
                      <p className="font-bold text-gray-700 uppercase tracking-wider">Brand DNA Context (Locked-in)</p>
                      <div className="grid grid-cols-2 gap-2 text-[9px] pt-1">
                        <div>
                          <span className="text-gray-400 uppercase tracking-wider block">Personality</span>
                          <span className="font-semibold text-gray-700 capitalize">{dna.brand_personality}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 uppercase tracking-wider block">Industry</span>
                          <span className="font-semibold text-gray-700">{dna.industry}</span>
                        </div>
                        {dna.approved_moodboard && (
                          <div className="col-span-2">
                            <span className="text-gray-400 uppercase tracking-wider block">Visual Direction</span>
                            <span className="font-semibold text-gray-700">{dna.approved_moodboard.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {postError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-600 leading-normal">
                      {postError}
                    </div>
                  )}
                </div>

                {/* Right panel: Post Preview Canvas (7 Cols) */}
                <div className="lg:col-span-7 bg-[#0D0D0D] border border-gray-800 rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[460px] overflow-hidden shadow-2xl">
                  {isGeneratingPost ? (
                    <div className="text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Rendering Brand Asset...</p>
                        <p className="text-[10px] text-gray-500">Injecting color swatches, visual styles, and moodboard rules.</p>
                      </div>
                    </div>
                  ) : generatedPostImage ? (
                    <div className="w-full flex flex-col gap-4">
                      {/* Social post frame */}
                      <div className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto w-full">
                        {/* Header */}
                        <div className="p-3 flex items-center justify-between border-b border-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-xs font-black text-white">
                              {(dna?.brand_name || "B").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{dna?.brand_name || "Aethera"}</p>
                              <p className="text-[8px] text-gray-500">Sponsored</p>
                            </div>
                          </div>
                          <span className="text-gray-600 text-xs">•••</span>
                        </div>

                        {/* Image body */}
                        <div className="w-full overflow-hidden bg-black flex items-center justify-center">
                          <img
                            src={generatedPostImage}
                            alt="Generated Campaign Post"
                            className="w-full h-auto object-contain"
                          />
                        </div>

                        {/* Footer action buttons */}
                        <div className="p-3 flex items-center justify-between text-gray-400 border-t border-gray-900">
                          <div className="flex items-center gap-4 text-xs">
                            <span className="cursor-pointer hover:text-white">♥</span>
                            <span className="cursor-pointer hover:text-white">💬</span>
                            <span className="cursor-pointer hover:text-white">✈</span>
                          </div>
                          <span className="text-[10px] text-[#06B6D4] font-bold">Learn More</span>
                        </div>
                      </div>

                      {/* Download / Info block */}
                      <div className="bg-black/40 border border-gray-900 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Post Generation Details</span>
                          <a
                            href={generatedPostImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold bg-[#06B6D4] text-gray-950 px-3 py-1.5 rounded-lg hover:bg-[#06B6D4]/80 transition-all uppercase tracking-wider"
                          >
                            Open High-Res
                          </a>
                        </div>
                        {generatedPostPrompt && (
                          <div className="space-y-1">
                            <span className="text-[8px] text-gray-600 uppercase tracking-wider">Compiled AI Prompt</span>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-mono bg-black/60 p-2.5 rounded-lg border border-gray-800 max-h-24 overflow-y-auto">
                              {generatedPostPrompt}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 max-w-sm px-6">
                      <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-600">
                        <Image className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Post Generation Canvas</h4>
                        <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                          Enter a description on the left side and press generate to create a visual post. The image will render here inside a live feed preview mockup.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Tab 6: Carousel Generator Studio */}
          {activeTab === "carousel" && (
            <div className="space-y-6 animate-fade-up">
              {/* Header */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Plus className="w-4 h-4 text-[#06B6D4]" />
                    Carousel Studio
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Generate visual slide decks with matching background graphics & custom HTML overlays.
                  </p>
                </div>
                {/* Visual guidelines indicator */}
                <div className="flex items-center gap-2 bg-[#0D0D0D] px-3.5 py-2 rounded-xl border border-gray-800 text-[10px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
                  <span>Fluid Image Treatment Active</span>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Input Panel */}
                <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Carousel Objective / Concept
                    </label>
                    <textarea
                      value={carouselPrompt}
                      onChange={(e) => setCarouselPrompt(e.target.value)}
                      placeholder="e.g. 5 steps to curate the perfect weekend getaway. Focus on slow-living travel, nature escapes, and mental wellness..."
                      className="w-full h-32 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-xs bg-white text-gray-900 outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCarousel}
                    disabled={isGeneratingCarousel || !carouselPrompt.trim()}
                    className="w-full py-3 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#06B6D4]/15 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isGeneratingCarousel ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Carousel & Slide Art...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Carousel Deck
                      </>
                    )}
                  </button>

                  {carouselError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-600">
                      {carouselError}
                    </div>
                  )}

                  {/* Settings specs info */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-[9px] text-gray-500 space-y-2">
                    <p className="font-bold text-gray-700 uppercase tracking-wider">CAROUSEL MECHANICS</p>
                    <ul className="space-y-1 list-disc pl-3.5 leading-relaxed">
                      <li>Generates a unified, matching visual backdrop using FLUX.</li>
                      <li>Backdrop image is uniquely transformed on every slide (rotation shifts, scale variations, and custom vignetting).</li>
                      <li>Renders crisp, high-fidelity brand typography and logo watermarks directly in HTML layer.</li>
                    </ul>
                  </div>
                </div>

                {/* Carousel Viewer/Canvas (7 Cols) */}
                <div className="lg:col-span-7 bg-[#0D0D0D] border border-gray-800 rounded-2xl p-6 flex flex-col min-h-[500px] justify-between relative shadow-2xl overflow-hidden">
                  
                  {isGeneratingCarousel ? (
                    <div className="my-auto text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Synthesizing Slide Assets...</p>
                        <p className="text-[10px] text-gray-500">Writing HTML copy, extracting logo marks, and rendering backdrop variations.</p>
                      </div>
                    </div>
                  ) : carouselSlides.length > 0 && generatedCarouselImage ? (
                    <div className="space-y-6 w-full">
                      {/* Swipeable View Container */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-[#06B6D4] uppercase tracking-widest">
                          Slide Preview (Slide {activeSlide + 1} of {carouselSlides.length})
                        </span>
                        <div className="flex gap-2">
                          <button
                            disabled={activeSlide === 0}
                            onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                            className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Prev
                          </button>
                          <button
                            disabled={activeSlide === carouselSlides.length - 1}
                            onClick={() => setActiveSlide(prev => Math.min(carouselSlides.length - 1, prev + 1))}
                            className="px-2.5 py-1 bg-[#06B6D4] text-gray-950 rounded-lg font-bold text-xs hover:bg-[#06B6D4]/80 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>

                      {/* Live slide viewport */}
                      <div className="relative aspect-square w-full max-w-sm mx-auto bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex flex-col justify-between p-6">
                        
                        {/* 1. Dynamic background image layout with rotation, scale, and vignette filter */}
                        {(() => {
                          const slide = carouselSlides[activeSlide];
                          return (
                            <div 
                              className="absolute inset-0 transition-all duration-700 ease-out"
                              style={{
                                backgroundImage: `url(${generatedCarouselImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                transform: `scale(${slide?.backgroundConfig?.scale || 1.15}) rotate(${slide?.backgroundConfig?.rotation || 0}deg)`,
                                filter: `brightness(${slide?.backgroundConfig?.brightness || 0.65}) contrast(${slide?.backgroundConfig?.contrast || 1.1}) saturate(${slide?.backgroundConfig?.saturation || 0.9})`,
                              }}
                            />
                          );
                        })()}

                        {/* Vignette overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

                        {/* 2. Premium HTML overlay layer */}
                        {(() => {
                          const slide = carouselSlides[activeSlide];
                          const activeColors = assets?.logo_studio_data?.colors || {
                            primaryHex: "#0D0D0D",
                            secondaryHex: "#C9A84C"
                          };
                          return (
                            <div className="relative z-10 h-full w-full flex flex-col justify-between pointer-events-none select-none">
                              {/* Slide Header: Logo + index */}
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  {assets?.logo_url ? (
                                    <img src={assets.logo_url} alt="Logo" className="w-5 h-5 object-contain" />
                                  ) : assets?.logo_studio_data?.assets?.faviconSvg ? (
                                    <div className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: assets.logo_studio_data.assets.faviconSvg }} />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-[#06B6D4]/20 border border-[#06B6D4]/40 flex items-center justify-center text-[10px] text-white font-bold">
                                      {dna?.brand_name?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="text-[10px] font-bold text-white/95 font-sans tracking-wide uppercase">{dna?.brand_name || "Aethera"}</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-white/60">0{activeSlide + 1}</span>
                              </div>

                              {/* Slide Body Content */}
                              <div className="space-y-3.5 my-auto max-w-[90%]">
                                {slide?.badge && (
                                  <span 
                                    className="inline-block text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border"
                                    style={{
                                      borderColor: `${activeColors.secondaryHex}50`,
                                      backgroundColor: `${activeColors.secondaryHex}15`,
                                      color: activeColors.secondaryHex,
                                    }}
                                  >
                                    {slide.badge}
                                  </span>
                                )}
                                <h2 
                                  className="text-lg md:text-xl font-extrabold text-white leading-tight font-sans tracking-tight drop-shadow-md"
                                  style={{ fontFamily: assets?.logo_studio_data?.typography?.primaryFont || "inherit" }}
                                >
                                  {slide?.title}
                                </h2>
                                <p 
                                  className="text-xs text-white/80 leading-relaxed font-medium drop-shadow"
                                  style={{ fontFamily: assets?.logo_studio_data?.typography?.bodyFont || "inherit" }}
                                >
                                  {slide?.description}
                                </p>
                              </div>

                              {/* Slide Footer: Action CTA */}
                              <div className="flex items-center justify-between w-full pt-2">
                                <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Swipe for details →</span>
                                {slide?.cta && (
                                  <span 
                                    className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-sm"
                                  >
                                    {slide.cta}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                      </div>

                      {/* Detailed info logs */}
                      <div className="bg-black/40 border border-gray-900 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Slide Configuration Specs</span>
                          <a
                            href={generatedCarouselImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold bg-[#06B6D4] text-gray-950 px-3 py-1.5 rounded-lg hover:bg-[#06B6D4]/80 transition-all uppercase tracking-wider"
                          >
                            Open Backdrop Image
                          </a>
                        </div>
                        {generatedCarouselPrompt && (
                          <div className="space-y-1">
                            <span className="text-[8px] text-gray-600 uppercase tracking-wider">Compiled Backdrop AI Prompt</span>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-mono bg-black/60 p-2.5 rounded-lg border border-gray-800 max-h-24 overflow-y-auto">
                              {generatedCarouselPrompt}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center space-y-4 max-w-sm px-6 my-auto mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-600">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Carousel Studio Canvas</h4>
                        <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed font-sans">
                          Describe the topic of your carousel presentation. The AI will generate a beautiful backdrop image and construct the individual slides overlaid in premium HTML layouts.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* Tab 7: Video Generator Studio */}
          {activeTab === "video" && (
            <div className="space-y-6 animate-fade-up">
              {/* Header */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Video className="w-4 h-4 text-[#06B6D4]" />
                    Video Studio
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Generate cinematic social ads & video campaigns using the LongCat-Video 13.6B generation engine.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-[#0D0D0D] px-3.5 py-2 rounded-xl border border-gray-800 text-[10px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Meituan LongCat Engine Active</span>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Input Panel */}
                <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Video Scene / Concept Description
                    </label>
                    <textarea
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="e.g. A panning cinematic shot of a luxury boutique resort room in Maharashtra with sunlight casting long shadows. A hot cup of tea steaming gently on a low wooden table..."
                      className="w-full h-32 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#06B6D4] text-xs bg-white text-gray-900 outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Duration Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Duration Scale (Meituan Long Video)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["10s", "20s", "30s"].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setVideoDuration(dur)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border uppercase tracking-wider
                            ${videoDuration === dur
                              ? "bg-[#06B6D4] text-[#090D16] border-[#06B6D4]"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo || !videoPrompt.trim()}
                    className="w-full py-3 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#06B6D4]/15 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {videoQueueStatus || "Generating video..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Video Clip
                      </>
                    )}
                  </button>

                  {videoError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-600">
                      {videoError}
                    </div>
                  )}

                  {/* Mechanics Details */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-[9px] text-gray-500 space-y-2">
                    <p className="font-bold text-gray-700 uppercase tracking-wider">LONG CAT VIDEO SPECS</p>
                    <ul className="space-y-1 list-disc pl-3.5 leading-relaxed">
                      <li>Uses a 13.6B parameter Dense Transformer model.</li>
                      <li>Calculates smooth camera shifts & volumetric lighting matching your primary color ({assets?.logo_studio_data?.colors?.primaryHex || "#0D0D0D"}) and accent color ({assets?.logo_studio_data?.colors?.secondaryHex || "#C9A84C"}).</li>
                      <li>Ensures temporal coherence and subject appearance stability across all generated frames.</li>
                    </ul>
                  </div>
                </div>

                {/* Video Preview Canvas */}
                <div className="lg:col-span-7 bg-[#0D0D0D] border border-gray-800 rounded-2xl p-6 flex flex-col min-h-[500px] justify-between relative shadow-2xl overflow-hidden">
                  
                  {isGeneratingVideo ? (
                    <div className="my-auto text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{videoQueueStatus || "Processing Video..."}</p>
                        <p className="text-[10px] text-gray-500">Compiling visual context, computing frame sequences, and generating video stream.</p>
                      </div>
                    </div>
                  ) : generatedVideoUrl ? (
                    <div className="space-y-6 w-full">
                      <span className="text-[9px] font-black text-[#06B6D4] uppercase tracking-widest block">
                        Cinematic Feed Preview
                      </span>

                      {/* Video Player */}
                      <div className="relative aspect-video w-full max-w-lg mx-auto bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                        <video
                          src={generatedVideoUrl}
                          controls
                          autoPlay
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info & Prompts */}
                      <div className="bg-black/40 border border-gray-900 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Video Output Details</span>
                          <a
                            href={generatedVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold bg-[#06B6D4] text-gray-950 px-3 py-1.5 rounded-lg hover:bg-[#06B6D4]/80 transition-all uppercase tracking-wider"
                          >
                            Download Video
                          </a>
                        </div>
                        {generatedVideoPrompt && (
                          <div className="space-y-1">
                            <span className="text-[8px] text-gray-600 uppercase tracking-wider">Compiled Video Motion Prompt</span>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-mono bg-black/60 p-2.5 rounded-lg border border-gray-800 max-h-24 overflow-y-auto">
                              {generatedVideoPrompt}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center space-y-4 max-w-sm px-6 my-auto mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-600">
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Video Studio Canvas</h4>
                        <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed font-sans">
                          Describe the scene motion, camera path, and visual setting. The model will compile a rich video prompt aligned with your brand details and render a premium cinematic marketing clip.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
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
