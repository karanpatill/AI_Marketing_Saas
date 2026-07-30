"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Zap, BarChart3, Calendar,
  Brain, Target, Layers, Share2, Briefcase,
  CheckCircle2, ArrowUpRight, Cpu, Radio,
  Loader2, LogOut, ArrowRight, ShieldCheck,
  Tag, Compass, HelpCircle, Users, Eye, Flag,
  Building, Image, FileText, Video, Plus,
  Settings, Bell, Search, Activity, Trash2, Archive,
  Shield, CreditCard, Mail, User, AlertCircle,
  X, Check, Lock, ChevronDown, RefreshCw, Globe, Clock, Paintbrush, Save
} from "lucide-react";


import ExportZipButton from "@/components/ExportZipButton";
import WordsPullUp from "@/components/ui/WordsPullUp";
import { CalendarView } from "@/components/CalendarView";
import { format } from "date-fns";
import { toJpeg } from "html-to-image";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import TokenCounter from "@/components/TokenCounter";
import { AssetsView } from "@/components/dashboard/AssetsView";
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

function injectBgIntoHtml(
  html: string | undefined, 
  imageUrl: string | null | undefined, 
  opacity: number = 0.08,
  loadedPrimary?: string,
  loadedBg?: string,
  currentPrimary?: string,
  currentBg?: string
): string {
  if (!html) return "";
  let processed = html;

  processed = processed.replaceAll("font-cormorant", "brand-font-heading");
  processed = processed.replaceAll("font-normal", "brand-font-heading");
  processed = processed.replaceAll("font-normal", "brand-font-heading");
  processed = processed.replaceAll("font-space", "brand-font-heading");
  processed = processed.replaceAll("font-normal", "brand-font-body");
  processed = processed.replaceAll("font-normal", "brand-font-body");

  if (loadedPrimary && currentPrimary && loadedPrimary.toLowerCase() !== currentPrimary.toLowerCase()) {
    const escaped = loadedPrimary.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    processed = processed.replace(new RegExp(escaped, "gi"), currentPrimary);
  }
  if (loadedBg && currentBg && loadedBg.toLowerCase() !== currentBg.toLowerCase()) {
    const escaped = loadedBg.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    processed = processed.replace(new RegExp(escaped, "gi"), currentBg);
  }

  const imgReplacement = imageUrl ? `url('${imageUrl}')` : "none";
  processed = processed.replaceAll("var(--bg-image)", imgReplacement);
  processed = processed.replaceAll("var(--bg-opacity, 0.08)", opacity.toString());
  processed = processed.replaceAll("var(--bg-opacity)", opacity.toString());
  return processed;
}

export default function DashboardPage() {
  const router = useRouter();
  const [dna, setDna] = useState<BrandDna | null>(null);
  const [assets, setAssets] = useState<BrandAssets | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"control" | "dna" | "campaigns" | "mix" | "studio" | "carousel" | "video" | "settings" | "assets">("control");
  const [billingStatus, setBillingStatus] = useState<any>(null);
  const [showBrandEditor, setShowBrandEditor] = useState(false);
  const [isSavingColors, setIsSavingColors] = useState(false);

  const handleSaveBrandColors = async () => {
    if (!assets || !assets.id) return;
    setIsSavingColors(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase
        .from('brand_assets')
        .update({ logo_studio_data: assets.logo_studio_data })
        .eq('id', assets.id);
      
      if (error) throw error;
      setToast({ message: "Brand colors saved!", type: "success" });
      setShowBrandEditor(false);
    } catch (err: any) {
      console.error(err);
      setToast({ message: "Failed to save colors", type: "error" });
    } finally {
      setIsSavingColors(false);
    }
  };

  // --- SaaS Foundation State ---
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeOrg, setActiveOrg] = useState<any | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [isInviting, setIsInviting] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"profile" | "workspace" | "team" | "billing">("profile");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Post Generator Studio States
  const [postPrompt, setPostPrompt] = useState("");
  const [postAspectRatio, setPostAspectRatio] = useState("1:1");
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [generatedPostImage, setGeneratedPostImage] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);

  // Carousel Generator Studio States
  const [carouselPrompt, setCarouselPrompt] = useState("");
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);
  const [generatedCarouselImage, setGeneratedCarouselImage] = useState<string | null>(null);
  const [carouselSlides, setCarouselSlides] = useState<any[]>([]);
  const [assetRefreshKey, setAssetRefreshKey] = useState(0);
  const [carouselError, setCarouselError] = useState<string | null>(null);

  // Video Generator Studio States
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState("10s");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoQueueStatus, setVideoQueueStatus] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedVideoPrompt, setGeneratedVideoPrompt] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Model Selection States
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");

  // Dynamic Lists for Strategy, Calendar & Mix
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(new Date());
  const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
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
  const [isAutopilotActive, setIsAutopilotActive] = useState<boolean>(true);
  const [calendarFilterType, setCalendarFilterType] = useState<string>("all");

  // Instagram Auto-Posting Integration States
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [instagramHandle, setInstagramHandle] = useState("@brand_official");
  const [instagramAccountId, setInstagramAccountId] = useState("");
  const [instagramAccessToken, setInstagramAccessToken] = useState("");
  const [isInstagramConnected, setIsInstagramConnected] = useState(true);
  const [isSavingInstagram, setIsSavingInstagram] = useState(false);
  const [publishingInstagramId, setPublishingInstagramId] = useState<string | null>(null);
  const [publishedPostLink, setPublishedPostLink] = useState<{ id: string; url: string } | null>(null);

  const handleSaveInstagram = async () => {
    setIsSavingInstagram(true);
    try {
      const res = await fetch("/api/social/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "connect",
          workspaceId: activeWorkspace?.id || "default_workspace",
          accountHandle: instagramHandle,
          instagramAccountId,
          accessToken: instagramAccessToken
        })
      });
      if (res.ok) {
        setIsInstagramConnected(true);
        setIsInstagramModalOpen(false);
        setToast({ message: "Instagram Business Account connected successfully!", type: "success" });
      }
    } catch (e: any) {
      setToast({ message: e.message || "Failed to save Instagram connection", type: "error" });
    } finally {
      setIsSavingInstagram(false);
    }
  };

  const handlePublishToInstagram = async (item: any) => {
    setPublishingInstagramId(item.id);
    try {
      const imageUrl = item.post?.imageUrl || item.post?.html || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80";
      const caption = `${item.title}\n\n${item.concept_brief || ''}\n\n#${dna?.brand_name?.replace(/\s+/g, '') || 'Brand'} #AIMarketing #Growth`;

      const res = await fetch("/api/social/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          workspaceId: activeWorkspace?.id || "default_workspace",
          imageUrl,
          caption
        })
      });

      const data = await res.json();
      if (data.success && data.permalink) {
        setPublishedPostLink({ id: item.id, url: data.permalink });
        setToast({ message: `Successfully published to Instagram! Link: ${data.permalink}`, type: "success" });
      } else {
        throw new Error(data.error || "Publishing failed");
      }
    } catch (e: any) {
      setToast({ message: e.message || "Failed to publish to Instagram", type: "error" });
    } finally {
      setPublishingInstagramId(null);
    }
  };

  const handleRedirectToStudio = (item: any) => {
    const brandNameStr = dna?.brand_name || activeOrg?.name || "Brand";
    const brandPersonalityStr = dna?.brand_personality || "Luxury & High Impact";
    const targetAudienceStr = dna?.target_audience || "Global Tech & Business Leaders";
    const uspStr = dna?.usp || "Cutting-Edge Innovation";

    const highEndPrompt = `[BRAND: ${brandNameStr} | VIBE: ${brandPersonalityStr}]
[TARGET AUDIENCE: ${targetAudienceStr} | USP: ${uspStr}]
[OBJECTIVE: ${item.goal || item.category || 'Thought Leadership & Lead Generation'}]

CREATE A HIGH-CONVERTING, PREMIUM ${item.post_type === 'carousel' ? 'MULTI-SLIDE CAROUSEL' : 'SOCIAL MEDIA POST GRAPHIC'}:
• TOPIC: ${item.title}
• CONCEPT & BRIEF: ${item.concept_brief || item.description || item.title}
• VISUAL DIRECTION: Ultra-sleek composition, elegant typography, high contrast, brand primary accent (${assets?.logo_studio_data?.colors?.primaryHex || '#FFB800'}) on secondary background (${assets?.logo_studio_data?.colors?.secondaryHex || '#000000'}), professional aesthetic.
• CAPTION HOOK: Include high-converting lead magnet headline hook and hashtags.`;

    if (item.post_type === "carousel") {
      setCarouselPrompt(highEndPrompt);
      setActiveTab("carousel");
    } else {
      setPostPrompt(highEndPrompt);
      setActiveTab("studio");
    }

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  // --- Fetch Available AI Models
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch("/api/models");
        if (res.ok) {
          const data = await res.json();
          setAvailableModels(data.models || []);
          
          // Auto-fallback if currently selected model is in high demand
          const current = data.models?.find((m: any) => m.id === selectedModel);
          if (current?.status === "high_demand") {
            const fallback = data.models.find((m: any) => m.status === "online");
            if (fallback) setSelectedModel(fallback.id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch models", err);
      }
    }
    fetchModels();
    const interval = setInterval(fetchModels, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [selectedModel]);

  // --- SaaS Initializer mount useEffect 🚀 ---

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

  const handleGenerateStrategy = async () => {
    if (!dna?.id) return;
    setIsGeneratingCalendar(true);
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandDnaId: dna.id })
      });
      if (res.ok) {
        setToast({ message: "30-day strategy generated successfully!", type: "success" });
        await reloadDynamicData(dna.id);
      } else {
        const errData = await res.json();
        setToast({ message: errData.error || "Failed to generate strategy.", type: "error" });
      }
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to generate strategy.", type: "error" });
    } finally {
      setIsGeneratingCalendar(false);
    }
  };

  const handleGeneratePost = async () => {
    if (!postPrompt.trim()) return;
    setIsGeneratingPost(true);
    setPostError(null);
    setGeneratedPostImage(null);

    const activeColors = assets?.logo_studio_data?.colors || {
      primaryHex: "#0D0D0D",
      secondaryHex: "#DEDBC8"
    };

      try {
        const res = await fetch("/api/content/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: postPrompt,
            aspectRatio: postAspectRatio,
            jobType: 'generate_post',
            targetModel: selectedModel,
            // The selected workspace is the canonical owner for generated assets.
            brandDnaId: dna?.id,
              orgId: activeWorkspace?.id,
            brandName: dna?.brand_name || activeOrg?.name || "Brand",
            brandPersonality: dna?.brand_personality || "Luxury",
            businessDescription: dna?.business_description || "",
            targetAudience: dna?.target_audience || "",
            usp: dna?.usp || "",
            website: dna?.website || "",
            logoUrl: assets?.logo_url || "",
            fonts: assets?.fonts || [typography.primaryFont, typography.bodyFont],
            primaryFont: typography.primaryFont,
            bodyFont: typography.bodyFont,
            primaryColor: activeColors.primaryHex || "#FFB800",
            secondaryColor: activeColors.secondaryHex || "#000000"
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `Server returned ${res.status}`);
        }

      const enqueueResult = await res.json();
      if (enqueueResult.error) {
        throw new Error(enqueueResult.error);
      }

      const jobId = enqueueResult.jobId;
      
      let isCompleted = false;
      while (!isCompleted) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const jobRes = await fetch(`/api/jobs/${jobId}`);
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          if (jobData.job.status === 'completed') {
            setGeneratedPostImage(jobData.job.output_reference?.html || jobData.job.output_reference?.imageUrl);
            setAssetRefreshKey((current) => current + 1);

            isCompleted = true;
          } else if (jobData.job.status === 'failed') {
            throw new Error((typeof jobData.job.error === 'string' ? jobData.job.error : jobData.job.error?.message) || "Generation job failed");
          }
        }
      }
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

    setCarouselSlides([]);

    const activeColors = assets?.logo_studio_data?.colors || {
      primaryHex: "#0D0D0D",
      secondaryHex: "#DEDBC8"
    };

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: carouselPrompt,
          aspectRatio: "4/5",
          jobType: 'generate_carousel',
          targetModel: selectedModel,
          // Keep generation and the Generated Assets query on the same workspace ID.
          brandDnaId: dna?.id,
              orgId: activeWorkspace?.id,
          brandName: dna?.brand_name || activeOrg?.name || "Brand",
          brandPersonality: dna?.brand_personality || "Luxury",
          businessDescription: dna?.business_description || "",
          targetAudience: dna?.target_audience || "",
          usp: dna?.usp || "",
          website: dna?.website || "",
          logoUrl: assets?.logo_url || "",
          fonts: assets?.fonts || [typography.primaryFont, typography.bodyFont],
          primaryFont: typography.primaryFont,
          bodyFont: typography.bodyFont,
          primaryColor: activeColors.primaryHex || "#FFB800",
          secondaryColor: activeColors.secondaryHex || "#000000"
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server returned ${res.status}`);
      }

      const enqueueResult = await res.json();
      if (enqueueResult.error) {
        throw new Error(enqueueResult.error);
      }
      
      const jobId = enqueueResult.jobId;

      let isCompleted = false;
      while (!isCompleted) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const jobRes = await fetch(`/api/jobs/${jobId}`);
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          if (jobData.job.status === 'completed') {
            setGeneratedCarouselImage(jobData.job.output_reference?.html || jobData.job.output_reference?.imageUrl);

            setCarouselSlides(jobData.job.output_reference?.slides || []);
            setAssetRefreshKey((current) => current + 1);
            isCompleted = true;
          } else if (jobData.job.status === 'failed') {
            throw new Error((typeof jobData.job.error === 'string' ? jobData.job.error : jobData.job.error?.message) || "Generation job failed");
          }
        }
      }
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
      secondaryHex: "#DEDBC8"
    };

    try {
      // 1. Submit to queue
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace?.id,
          targetModel: selectedModel,
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

      const { jobId, requestId, videoPrompt: finalPrompt } = submission;
      setGeneratedVideoPrompt(finalPrompt);
      setVideoQueueStatus("Added to Universal AI Queue...");

      let isCompleted = false;
      while (!isCompleted) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const jobRes = await fetch(`/api/jobs/${jobId}`);
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          if (jobData.job.status === 'processing') {
            setVideoQueueStatus(jobData.job.current_step || "Processing in Queue...");
          } else if (jobData.job.status === 'completed') {
            if (!jobData.job.output_reference?.videoUrl) {
              throw new Error("No output video URL was returned from finished request.");
            }
            setGeneratedVideoUrl(jobData.job.output_reference.videoUrl);
            setVideoQueueStatus(null);
            isCompleted = true;
          } else if (jobData.job.status === 'failed') {
            throw new Error((typeof jobData.job.error === 'string' ? jobData.job.error : jobData.job.error?.message) || "Video generation job failed");
          }
        }
      }
    } catch (e: any) {
      console.error("Video generation error:", e);
      setVideoError(e.message || "Failed to generate video.");
      setVideoQueueStatus(null);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // --- SaaS Initializer mount useEffect ───
  useEffect(() => {
    async function loadSaaSData() {
      try {
        const { supabase } = await import("@/lib/supabase");
        
        // 1. Get current auth user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/auth");
          return;
        }
        setCurrentUser(user);

        // 2. Fetch User Profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (profile) {
          setUserName(profile.name || "");
          setUserAvatar(profile.avatar_url || "");
        } else {
          setUserName(user.user_metadata?.name || user.email?.split("@")[0] || "");
        }

        // 3. Fetch Organizations & Workspaces
        const res = await fetch("/api/workspace");
        if (res.ok) {
          const workspaceData = await res.json();
          setOrganizations(workspaceData.organizations || []);
          setWorkspaces(workspaceData.workspaces || []);

          if (workspaceData.organizations?.length > 0) {
            const defaultOrg = workspaceData.organizations[0];
            setActiveOrg(defaultOrg);

            const orgWorkspaces = workspaceData.workspaces?.filter((w: any) => w.org_id === defaultOrg.id) || [];
            if (orgWorkspaces.length > 0) {
              setActiveWorkspace(orgWorkspaces[0]);
            }
          }
        } else if (res.status === 401) {
          // If API returns 401, session might be invalid or unsynced, force login
          await supabase.auth.signOut();
          router.push("/auth");
          return;
        }

        // 4. Fetch Notifications
        const { data: notifyList } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        setNotifications(notifyList || []);

      } catch (err) {
        console.error("Failed to initialize SaaS data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSaaSData();
  }, []);

  // --- Load org details when activeOrg changes ───
  useEffect(() => {
    if (activeOrg) {
      loadOrgDetails(activeOrg.id);
    }
  }, [activeOrg]);

  const loadOrgDetails = async (orgId: string) => {
    try {
      const teamRes = await fetch(`/api/team?orgId=${orgId}`);
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData);
      }

      const inviteRes = await fetch(`/api/invitations?orgId=${orgId}`);
      if (inviteRes.ok) {
        const inviteData = await inviteRes.json();
        setPendingInvitations(inviteData);
      }

      const billingRes = await fetch(`/api/billing?orgId=${orgId}`);
      if (billingRes.ok) {
        const billingData = await billingRes.json();
        setBillingStatus(billingData.billingStatus);
      }

      // Skip fetching activity_logs for now to prevent 500 errors if table is missing
      // const { data: logs } = await supabase
      //   .from("activity_logs")
      //   .select("*")
      //   .eq("org_id", orgId)
      //   .order("created_at", { ascending: false })
      //   .limit(10);
      setActivityLogs([]);
    } catch (err) {
      console.error("Failed to load org details:", err);
    }
  };

  // --- Fetch Brand DNA & Assets scoped by activeWorkspace ───
  useEffect(() => {
    async function fetchWorkspaceData() {
      if (!activeWorkspace) {
        setLoading(false);
        return;
      }
      setLoading(true);
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
            .eq("workspace_id", activeWorkspace.id)
            .maybeSingle();
          dnaData = res.data;
          dnaError = res.error;
        }

        if (dnaError) {
          console.error("Error fetching brand DNA:", dnaError);
          setDna(null);
          setAssets(null);
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
        } else {
          setDna(null);
          setAssets(null);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspaceData();
  }, [activeWorkspace]);

  // --- SaaS Action Handlers ───
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !activeOrg) return;
    setIsInviting(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: activeOrg.id,
          email: inviteEmail,
          role: inviteRole
        })
      });
      if (res.ok) {
        setInviteEmail("");
        setToast({ message: "Invitation sent successfully!", type: "success" });
        loadOrgDetails(activeOrg.id);
      } else {
        const data = await res.json();
        setToast({ message: data.error || "Failed to send invitation", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Failed to send invitation", type: "error" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName || !activeOrg) return;
    setIsCreatingWorkspace(true);
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: activeOrg.id,
          name: newWorkspaceName
        })
      });
      if (res.ok) {
        const newWs = await res.json();
        setWorkspaces(prev => [...prev, newWs]);
        setNewWorkspaceName("");
        setActiveWorkspace(newWs);
        setToast({ message: "Workspace created successfully!", type: "success" });
      } else {
        const data = await res.json();
        setToast({ message: data.error || "Failed to create workspace", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Failed to create workspace", type: "error" });
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!activeOrg) return;
    if (!window.confirm("Are you sure you want to completely remove this brand workspace? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/workspace?workspaceId=${workspaceId}&orgId=${activeOrg.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
        setWorkspaces(remainingWorkspaces);
        
        if (remainingWorkspaces.length > 0) {
          setActiveWorkspace(remainingWorkspaces[0]);
        } else {
          setActiveWorkspace(null);
        }
        
        setToast({ message: "Brand workspace deleted successfully!", type: "success" });
      } else {
        const data = await res.json();
        setToast({ message: data.error || "Failed to delete workspace", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Failed to delete workspace", type: "error" });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: userName,
          avatar_url: userAvatar,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentUser.id);

      if (profileError) throw profileError;

      await supabase.auth.updateUser({
        data: { name: userName }
      });

      setToast({ message: "Profile saved successfully!", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to save profile", type: "error" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
      router.push("/auth");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleClearInvite = async (inviteId: string) => {
    if (!activeOrg) return;
    try {
      const res = await fetch(`/api/invitations?orgId=${activeOrg.id}&inviteId=${inviteId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setToast({ message: "Invitation revoked successfully", type: "success" });
        loadOrgDetails(activeOrg.id);
      }
    } catch (err: any) {
      setToast({ message: err.message || "Failed to revoke invitation", type: "error" });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeOrg) return;
    try {
      const res = await fetch(`/api/team?orgId=${activeOrg.id}&userId=${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setToast({ message: "Team member removed", type: "success" });
        loadOrgDetails(activeOrg.id);
      } else {
        const data = await res.json();
        setToast({ message: data.error || "Failed to remove member", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Failed to remove member", type: "error" });
    }
  };

  const getPlanType = () => {
    if (billingStatus?.subscription?.status !== "active") return "free";
    const sub = billingStatus.subscription;
    if (sub.plans) {
      if (Array.isArray(sub.plans) && sub.plans.length > 0) return sub.plans[0].type;
      if (!Array.isArray(sub.plans) && sub.plans.type) return sub.plans.type;
    }
    return sub.plan_id || "free";
  };
  
  const planType = getPlanType();
  const planName = billingStatus?.subscription?.status === "active" ? 
    (Array.isArray(billingStatus?.subscription?.plans) ? billingStatus.subscription.plans[0]?.name : billingStatus?.subscription?.plans?.name) : "Free";
  const hasCarouselAccess = planType === "pro" || planType === "automate" || planType === "automate_brand";
  const hasAutomateAccess = planType === "automate" || planType === "automate_brand";

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#ffffff]">
        <div className="animate-spin rounded-full border-2 border-[#E1E0CC]/20 border-t-[#E1E0CC] w-8 h-8" />
        <p className="text-sm text-[#ffffff]/70 font-light leading-relaxed mt-3 font-sans tracking-normal">Loading Workspace Dashboard...</p>
      </div>
    );
  }

  if (!dna) {
    return (
      <div className="min-h-screen bg-black flex flex-col text-[#ffffff]">
        <div className="flex-1 flex flex-col items-center justify-center w-full p-6 text-center">
          <Layers className="w-16 h-16 text-[#ffffff]/20 mb-4" />
          <h2 className="text-2xl font-medium text-[#ffffff] tracking-tight">No Brand Configured</h2>
          <p className="text-[#ffffff]/60 mt-2 max-w-md mx-auto text-sm font-light">
            You need to onboard a brand before you can access the dashboard.
          </p>
          <button 
            onClick={() => router.push("/onboarding")}
            className="mt-6 bg-[#DEDBC8] text-black font-medium py-3 px-6 rounded-full hover:bg-[#E1E0CC] transition-colors flex items-center gap-2 mx-auto text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Onboard a Brand
          </button>
        </div>
      </div>
    );
  }

  // --- Parse approved moodboard if exists ---
  let moodboard: any = null;
  if (dna && dna?.approved_moodboard) {
    try {
      moodboard = typeof dna?.approved_moodboard === "string" 
        ? JSON.parse(dna?.approved_moodboard) 
        : dna?.approved_moodboard;
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
    secondaryHex: "#DEDBC8",
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
    secondaryHex: "#0A0A0A",
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
    accent: "linear-gradient(135deg, #DEDBC8 0%, #E5C158 100%)"
  } : isCleanMinimal ? {
    primary: "linear-gradient(135deg, #F5F5F5 0%, #E5E5E5 100%)",
    accent: "linear-gradient(135deg, #A3B19B 0%, #BCC9B5 100%)"
  } : {
    primary: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    accent: "linear-gradient(135deg, #0A0A0A 0%, #0891B2 100%)"
  };

  const gradients = [
    { name: "Primary Gradient", style: styleGradients.primary },
    { name: "Accent Gradient", style: styleGradients.accent },
    { name: "Silk Soft", style: `linear-gradient(135deg, ${colors.primaryHex} 0%, #111827 100%)` },
    { name: "Gold Leather", style: `linear-gradient(135deg, ${colors.secondaryHex} 0%, #374151 100%)` }
  ];

  return (
    <div className="h-screen w-full bg-black text-[#ffffff] flex flex-col relative pt-24 md:pt-28 overflow-hidden">
      {/* Noise Texture Background */}
      <div className="fixed inset-0 bg-noise opacity-[0.04] pointer-events-none z-0 mix-blend-overlay" />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-6 overflow-y-auto min-h-0 pb-12">

        {/* Unified Sub-Navigation Header */}
        <div className="flex flex-col gap-4">
          
          {/* Top row: Org/Workspace & User actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1c1e21] border border-[#828282]/20 rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgb(0,0,0,0.01)] relative z-30">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              {/* Organization */}
              <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-1.5 bg-black border border-[#828282]/20 rounded-lg text-[#ffffff] font-medium text-xs">
                <Building className="w-3.5 h-3.5 text-[#828282] shrink-0" />
                <span className="truncate">{dna?.brand_name || activeOrg?.name || "My Organization"}</span>
              </div>

              {/* Workspace Switcher */}
              <select
                value={activeWorkspace?.id || ""}
                onChange={(e) => {
                  const ws = workspaces.find(w => w.id === e.target.value);
                  if (ws) setActiveWorkspace(ws);
                }}
                className="min-w-0 flex-1 bg-black border border-[#828282]/20 rounded-lg px-3 py-1.5 text-xs font-medium text-[#ffffff] outline-none cursor-pointer hover:bg-[#ffffff]/5 transition-all appearance-none"
              >
                {workspaces
                  .filter(w => w.org_id === activeOrg?.id)
                  .map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
              </select>

              {/* Model Switcher */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black border border-[#828282]/20 rounded-lg hover:bg-[#ffffff]/5 transition-all">
                <Brain className="w-3.5 h-3.5 text-[#828282]" />
                <div className="relative flex items-center">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="min-w-[130px] pr-6 bg-transparent border-none text-xs font-medium text-[#ffffff] outline-none cursor-pointer appearance-none"
                  >
                    {availableModels.map(m => (
                      <option key={m.id} value={m.id} disabled={m.status === "high_demand"} className="bg-black text-[#ffffff]">
                        {m.name} {m.status === "high_demand" ? "(High Demand)" : ""}
                      </option>
                    ))}
                    {availableModels.length === 0 && (
                      <option value="gemini-3.5-flash" className="bg-black text-[#ffffff]">Gemini 3.5 Flash</option>
                    )}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#828282] absolute right-0 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Notification Bell + Profile + Settings */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              
              {/* Token Counter */}
              {activeOrg?.id && <TokenCounter orgId={activeOrg.id} />}

              {/* Upgrade Button */}
              <Link 
                href="/dashboard/billing"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#DEDBC8] text-black hover:bg-white transition-all rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Upgrade
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-black hover:bg-[#E1E0CC]/10 rounded-xl border border-[#828282]/20 transition-all text-[#ffffff]/60 hover:text-[#ffffff] relative cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.filter((n) => !n.is_read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-3rem))] bg-[#1c1e21] border border-[#828282]/20 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#828282]/20">
                      <h4 className="text-xs font-black text-[#ffffff] uppercase tracking-wider">Notifications</h4>
                      <button onClick={() => setShowNotifications(false)} className="text-[#ffffff]/50 hover:text-[#ffffff]/80 text-xs">Close</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-white/5">
                      {notifications.length === 0 ? (
                        <p className="text-[10px] text-[#ffffff]/50 text-center py-4 font-mono">No new notifications.</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="pt-2 text-xs text-[#ffffff]/70">
                            <h5 className="font-bold text-[#ffffff]">{n.title}</h5>
                            <p className="text-[10px] text-[#ffffff]/60 mt-0.5">{n.message || n.time}</p>
                            {n.created_at && (
                              <span className="text-[8px] text-[#ffffff]/50 block mt-1">
                                {new Date(n.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-2 pl-3 border-l border-[#828282]/20">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-[#E1E0CC]/15" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#1c1e21] flex items-center justify-center text-[#ffffff] font-bold text-xs uppercase">
                    {userName?.charAt(0) || "U"}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-bold text-[#ffffff]/80 max-w-[80px] truncate">{userName || "User"}</span>
              </div>

              {/* Settings & Sign Out */}
              <div className="flex items-center gap-1 pl-3 border-l border-[#828282]/20">
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`p-1.5 rounded-lg transition-all ${
                    activeTab === "settings" ? "bg-[#ffffff]/10 text-[#ffffff]" : "text-[#828282] hover:text-[#ffffff] hover:bg-[#ffffff]/5"
                  }`}
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-[#828282] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom row: Tab Navigation */}
          <nav className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setActiveTab("control")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "control"
                  ? "bg-[#ffffff]/10 text-[#ffffff] shadow-sm border border-[#828282]/20"
                  : "text-[#828282] hover:text-[#ffffff] hover:bg-[#ffffff]/5 border border-transparent"
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Mission Control</span>
            </button>
            
            <button
              onClick={() => setActiveTab("studio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "studio"
                  ? "bg-[#ffffff]/10 text-[#ffffff] shadow-sm border border-[#828282]/20"
                  : "text-[#828282] hover:text-[#ffffff] hover:bg-[#ffffff]/5 border border-transparent"
              }`}
            >
              <Image className="w-4 h-4 shrink-0" />
              <span>Post Generator</span>
              {activeTab !== "studio" && <span className="text-[10px] bg-[#DEDBC8]/10 text-[#DEDBC8] px-1.5 py-0.5 rounded-full font-bold">AI</span>}
            </button>

            <button
              onClick={() => setActiveTab("carousel")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "carousel"
                  ? "bg-[#ffffff]/10 text-[#ffffff] shadow-sm border border-[#828282]/20"
                  : "text-[#828282] hover:text-[#ffffff] hover:bg-[#ffffff]/5 border border-transparent"
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Carousel Studio</span>
              {activeTab !== "carousel" && <span className="text-[10px] bg-[#DEDBC8]/10 text-[#DEDBC8] px-1.5 py-0.5 rounded-full font-bold">AI</span>}
            </button>

            <button
              onClick={() => setActiveTab("assets")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "assets"
                  ? "bg-[#ffffff]/10 text-[#ffffff] shadow-sm border border-[#828282]/20"
                  : "text-[#828282] hover:text-[#ffffff] hover:bg-[#ffffff]/5 border border-transparent"
              }`}
            >
              <Archive className="w-4 h-4 shrink-0" />
              <span>Generated Assets</span>
            </button>

            <button
              onClick={() => setActiveTab("dna")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "dna"
                  ? "bg-[#ffffff]/10 text-[#ffffff] shadow-sm border border-[#828282]/20"
                  : "text-[#828282] hover:text-[#ffffff] hover:bg-[#ffffff]/5 border border-transparent"
              }`}
            >
              <Brain className="w-4 h-4 shrink-0" />
              <span>Brand DNA</span>
            </button>

            <button
              onClick={() => setActiveTab("campaigns")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "campaigns"
                  ? "bg-[#ffffff]/10 text-[#ffffff] shadow-sm border border-[#828282]/20"
                  : "text-[#828282] hover:text-[#ffffff] hover:bg-[#ffffff]/5 border border-transparent"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Campaigns & Calendar</span>
            </button>
          </nav>
        </div>

          {/* Empty State / Onboarding requirement checker */}
          {!dna && activeTab !== "settings" ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="max-w-md w-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all rounded-2xl p-8 text-center shadow-[0_4px_20px_rgb(0,0,0,0.01)] space-y-5 animate-fade-up">
                <div className="w-12 h-12 rounded-full bg-[#E1E0CC]/10 flex items-center justify-center text-[#ffffff] mx-auto">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#ffffff] uppercase tracking-[0.2em] font-bold text-[#ffffff]">Workspace DNA Required</h3>
                  <p className="text-xs text-[#828282] leading-relaxed">
                    This workspace does not have a Brand DNA profile configured yet. Run the brand builder to generate marketing roadmap, strategies, logos and design assets.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/onboarding")}
                  className="w-full flex items-center justify-center gap-1.5 py-4 rounded-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all hover:bg-black text-[#ffffff] text-xs font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-none shadow-black/5"
                >
                  ✦ Start Brand Onboarding
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Info Banner - Only render if DNA is synced */}
              {dna && (
                <div className="bg-[#1c1e21] border border-[#828282]/20 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Color dot indicator */}
                    <div
                      className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white/10"
                      style={{ backgroundColor: assets?.logo_studio_data?.colors?.primaryHex || '#DEDBC8' }}
                    />
                    <div className="min-w-0">
                      <h1 className="text-base font-bold text-[#ffffff] tracking-tight truncate">{dna?.brand_name}</h1>
                      <p className="text-[11px] text-[#828282] truncate">{dna?.category}{dna?.industry ? ` · ${dna.industry}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#DEDBC8]/10 border border-[#DEDBC8]/20 text-[#DEDBC8] text-[10px] font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      Memory Synced
                    </div>
                  </div>
                </div>
              )}

          {/* Tab 1: Mission Control (Visual Style Tile Moodboard) */}
          {activeTab === "control" && (
            <div className="bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative space-y-6">
              
              {/* Top Header Section */}
              <div className="border-b border-[#828282]/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#ffffff]/5 border border-[#828282]/20 text-[#ffffff]">
                      Brand Board Direction
                    </span>
                    {moodboard?.id && (
                      <span className="text-sm text-[#828282]">Preset ID: {moodboard.id}</span>
                    )}
                  </div>
                  <WordsPullUp 
                    text={dna?.brand_name || 'Brand'}
                    className="text-2xl font-bold mt-1 text-[#ffffff] tracking-tight"
                  />
                  <p className="text-[13px] text-[#828282] mt-1">
                    {moodboard?.name || "Bespoke Brand Strategy Board"} {moodboard?.tagline ? `— ${moodboard.tagline}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[13px] text-[#828282] font-medium">{dna?.industry} · {dna?.category}</span>
                  <button
                    onClick={() => setShowBrandEditor(prev => !prev)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all border ${
                      showBrandEditor
                        ? 'bg-[#DEDBC8]/10 border-[#DEDBC8]/20 text-[#DEDBC8]'
                        : 'bg-[#ffffff]/5 border-[#828282]/20 text-[#828282] hover:text-[#ffffff] hover:bg-[#ffffff]/10'
                    }`}
                  >
                    <Paintbrush className="w-4 h-4" />
                    {showBrandEditor ? 'Close Editor' : 'Edit Brand Colors'}
                  </button>
                  {showBrandEditor && (
                    <button
                      onClick={handleSaveBrandColors}
                      disabled={isSavingColors}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all bg-[#DEDBC8] text-black hover:bg-white disabled:opacity-50"
                    >
                      {isSavingColors ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Colors
                    </button>
                  )}
                </div>
              </div>

              {/* ── BRAND COLOR EDITOR PANEL ── */}
              {showBrandEditor && (
                <div className="bg-[#050505] border border-[#828282]/20 rounded-xl p-6 space-y-5 animate-fade-up">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-[#ffffff]">Brand Color Editor</span>
                    <span className="text-[11px] text-[#828282]">Changes reflect across all generated posts & carousels</span>
                  </div>

                  {/* Color pickers row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary */}
                    <div className="bg-[#1c1e21] rounded-lg p-4 border border-[#828282]/20 group hover:border-[#828282]/20 transition-all flex flex-col gap-3">
                      <span className="text-[11px] text-[#828282] font-medium uppercase tracking-wider">Primary Accent Color</span>
                      <div className="flex items-center gap-3">
                        <label className="relative cursor-pointer shrink-0">
                          <div
                            className="w-10 h-10 rounded-lg border border-[#828282]/20 group-hover:border-white/20 transition-all shadow-sm"
                            style={{ backgroundColor: assets?.logo_studio_data?.colors?.primaryHex || '#DEDBC8' }}
                          />
                          <input
                            type="color"
                            value={assets?.logo_studio_data?.colors?.primaryHex || '#DEDBC8'}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            onChange={(e) => {
                              setAssets((prev: any) => ({
                                ...prev,
                                logo_studio_data: {
                                  ...(prev?.logo_studio_data || {}),
                                  colors: {
                                    ...(prev?.logo_studio_data?.colors || {}),
                                    primaryHex: e.target.value
                                  }
                                }
                              }));
                            }}
                          />
                        </label>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-[#ffffff] font-mono">{assets?.logo_studio_data?.colors?.primaryHex || '#DEDBC8'}</div>
                          <div className="text-[11px] text-[#828282] mt-0.5">Click swatch to open picker</div>
                        </div>
                      </div>
                    </div>

                    {/* Background / Secondary */}
                    <div className="bg-[#1c1e21] rounded-lg p-4 border border-[#828282]/20 group hover:border-[#828282]/20 transition-all flex flex-col gap-3">
                      <span className="text-[11px] text-[#828282] font-medium uppercase tracking-wider">Background / Secondary</span>
                      <div className="flex items-center gap-3">
                        <label className="relative cursor-pointer shrink-0">
                          <div
                            className="w-10 h-10 rounded-lg border border-[#828282]/20 group-hover:border-white/20 transition-all shadow-sm"
                            style={{ backgroundColor: assets?.logo_studio_data?.colors?.secondaryHex || '#0A0A0A' }}
                          />
                          <input
                            type="color"
                            value={assets?.logo_studio_data?.colors?.secondaryHex || '#0A0A0A'}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            onChange={(e) => {
                              setAssets((prev: any) => ({
                                ...prev,
                                logo_studio_data: {
                                  ...(prev?.logo_studio_data || {}),
                                  colors: {
                                    ...(prev?.logo_studio_data?.colors || {}),
                                    secondaryHex: e.target.value
                                  }
                                }
                              }));
                            }}
                          />
                        </label>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-[#ffffff] font-mono">{assets?.logo_studio_data?.colors?.secondaryHex || '#0A0A0A'}</div>
                          <div className="text-[11px] text-[#828282] mt-0.5">Click swatch to open picker</div>
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Live preview strip */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] text-[#828282] uppercase tracking-wider">Preview</span>
                    <div
                      className="flex-1 h-6 rounded-lg"
                      style={{ background: `linear-gradient(90deg, ${assets?.logo_studio_data?.colors?.secondaryHex || '#0A0A0A'} 0%, ${assets?.logo_studio_data?.colors?.primaryHex || '#DEDBC8'} 100%)` }}
                    />
                    <div
                      className="px-3 py-1 rounded-md text-[10px] font-bold"
                      style={{ backgroundColor: assets?.logo_studio_data?.colors?.primaryHex || '#DEDBC8', color: assets?.logo_studio_data?.colors?.secondaryHex || '#000' }}
                    >
                      {dna?.brand_name || 'Brand'}
                    </div>
                  </div>
                </div>
              )}

              {/* ── BRAND BOARD CANVAS GRID ── */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                {/* ── ROW 1 ── */}

                {/* BLOCK A: Logo + Brand Identity (4 cols) */}
                <div className="md:col-span-4 bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                  <p className="text-[11px] font-medium text-[#828282] uppercase tracking-wider">Brand Identity</p>

                  {/* Logo circle — large and filled */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-none transition-all"
                      style={{ backgroundColor: colors.secondaryHex || "#1c1e21", borderColor: colors.primaryHex || "#E1E0CC", color: colors.primaryHex || "#ffffff" }}
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
                          <span className="text-2xl font-black text-[#ffffff]" style={{ fontFamily: "serif" }}>
                            {(dna?.brand_name || "B").charAt(0).toUpperCase()}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-center">
                      <p className="text-[#ffffff] font-bold text-base tracking-tight">{dna?.brand_name}</p>
                      <p className="text-[#828282] text-sm mt-0.5 italic max-w-[160px] text-center leading-snug">
                        {dna?.usp ? `"${dna?.usp}"` : "No tagline set"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#828282]/20 pt-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff]">Industry</span>
                      <span className="text-[#ffffff] font-bold">{dna?.industry}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff]">Personality</span>
                      <span className="text-[#ffffff] font-bold capitalize">
                        {dna?.brand_personality}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BLOCK B: Color Palette (5 cols) */}
                <div className="md:col-span-5 bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                  <p className="text-[11px] font-medium text-[#828282] uppercase tracking-wider">Color Palette</p>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    {/* Primary */}
                    <div className="space-y-2">
                      <div
                        className="h-24 w-full rounded-xl shadow-sm border border-[#828282]/20"
                        style={{ backgroundColor: colors.primaryHex || "#1A0A00" }}
                      />
                      <div>
                        <p className="text-[11px] font-medium text-[#ffffff]">Primary</p>
                        <p className="text-[11px] text-[#828282] font-mono mt-0.5">{colors.primaryHex || "#1A0A00"}</p>
                      </div>
                    </div>
                    {/* Accent */}
                    <div className="space-y-2">
                      <div
                        className="h-24 w-full rounded-xl shadow-sm border border-[#828282]/20"
                        style={{ backgroundColor: colors.secondaryHex || "#DEDBC8" }}
                      />
                      <div>
                        <p className="text-[11px] font-medium text-[#ffffff]">Accent</p>
                        <p className="text-[11px] text-[#828282] font-mono mt-0.5">{colors.secondaryHex || "#DEDBC8"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOCK C: Typography (3 cols) */}
                <div className="md:col-span-3 bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                  <p className="text-[11px] font-medium text-[#828282] uppercase tracking-wider">Typography System</p>
                  <div className="space-y-5 flex-1">
                    <div>
                      <span className="text-[11px] text-[#828282] font-medium block mb-1">Headline</span>
                      <span className="text-lg font-bold text-[#ffffff] block tracking-tight" style={{ fontFamily: typography.primaryFont }}>
                        {typography.primaryFont}
                      </span>
                      <span className="text-[12px] text-[#828282] block mt-1">AaBbCc 123</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#828282] font-medium block mb-1">Body</span>
                      <span className="text-[14px] text-[#ffffff] block" style={{ fontFamily: typography.bodyFont }}>
                        {typography.bodyFont}
                      </span>
                      <span className="text-[12px] text-[#828282] block mt-1">aAbBcC 456</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#828282] border-t border-[#828282]/20 pt-4 leading-relaxed">
                    {typography.usage}
                  </p>
                </div>

                {/* ── ROW 2 ── */}

                {/* BLOCK D: Brand Mood & Tone — TEXT ONLY (5 cols) */}
                <div className="md:col-span-5 bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                  <p className="text-[11px] font-medium text-[#828282] uppercase tracking-wider">Brand Mood & Tone</p>

                  {/* Personality tags */}
                  <div className="flex flex-wrap gap-2">
                    {(dna?.brand_values || []).map((v) => (
                      <span
                        key={v}
                        className="text-[11px] font-medium uppercase tracking-wider text-[#ffffff] px-3 py-1.5 rounded-md border bg-[#050505] border-[#828282]/20"
                      >
                        {v}
                      </span>
                    ))}
                  </div>

                  {/* Tone descriptors */}
                  <div className="space-y-3 flex-1 mt-2">
                    <p className="text-[11px] text-[#828282] font-medium uppercase tracking-wider block">Voice Attributes</p>
                    <div className="space-y-2">
                      {[
                        { label: "Tone", value: dna?.brand_personality || "Professional" },
                        { label: "Audience", value: dna?.target_audience || "Not defined" },
                        { label: "Mission", value: dna?.mission || "Not defined" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-3 text-[13px]">
                          <span className="text-[#828282] font-medium w-16 shrink-0">{label}</span>
                          <span className="text-[#ffffff] leading-snug line-clamp-2">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Separator words */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#828282]/20 text-[11px] font-medium text-[#828282] uppercase tracking-widest">
                    <span>Luxurious</span>
                    <span>•</span>
                    <span>Timeless</span>
                    <span>•</span>
                    <span>Exclusive</span>
                  </div>
                </div>

                {/* BLOCK E: Social Post Visual Direction — approved moodboard (7 cols) */}
                <div className="md:col-span-7 bg-[#1c1e21] border border-[#828282]/20 rounded-2xl overflow-hidden flex flex-col shadow-sm relative">
                  <div className="px-5 pt-5 pb-3 z-10 relative">
                    <p className="text-[11px] font-medium text-[#828282] uppercase tracking-wider drop-shadow-md">Social Post Visual Direction</p>
                  </div>
                  {moodboard?.imageUrl ? (
                    <div className="flex-1 relative">
                      {/* Show approved moodboard — NO logo overlay */}
                      <img
                        src={moodboard.imageUrl}
                        alt="Approved Moodboard"
                        className="w-full h-full object-cover object-top opacity-80"
                        style={{ minHeight: "200px", maxHeight: "280px" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent flex flex-col justify-end px-5 py-4">
                        <p className="text-[11px] text-[#DEDBC8] font-medium uppercase tracking-wider">✦ Approved Visual Direction</p>
                        <p className="text-[#ffffff] text-lg font-bold mt-1">{moodboard.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6 text-center">
                      <div>
                        <p className="text-[#828282] text-[13px] font-medium">No moodboard approved yet.</p>
                        <p className="text-[#828282] text-[12px] mt-1 leading-snug">Generate and approve a direction in the onboarding visual direction step.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── ROW 3 — Full width: Visual Brain Summary ── */}
                <div className="md:col-span-12 bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-6 shadow-sm">
                  <div className="space-y-2 flex-1">
                    <p className="text-[11px] font-medium text-[#828282] uppercase tracking-wider">Visual Brand Summary</p>
                    <p className="text-[13px] text-[#828282] leading-relaxed">
                      {dna?.business_description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 md:shrink-0">
                    <div className="w-8 h-8 rounded-full border border-[#828282]/20" style={{ backgroundColor: colors.primaryHex || "#1A0A00" }} />
                    <div className="w-8 h-8 rounded-full border border-[#828282]/20" style={{ backgroundColor: colors.secondaryHex || "#DEDBC8" }} />
                    <div className="w-8 h-8 rounded-full border border-[#828282]/20 bg-[#1c1e21]" />
                    <div className="w-8 h-8 rounded-full border border-[#828282]/20 bg-[#E1E0CC]" />
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
                <div className="bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="text-[11px] font-medium text-[#828282] uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-brand-secondary" />
                    Company Definition
                  </h3>
                  
                  <div className="space-y-4 text-[13px]">
                    <div className="flex flex-col gap-1.5 border-b border-[#828282]/20 pb-3">
                      <span className="text-[#828282] font-medium">Business Description</span>
                      <p className="text-[#ffffff] leading-relaxed">{dna?.business_description}</p>
                    </div>
                    {dna?.website && (
                      <div className="flex justify-between border-b border-[#828282]/20 pb-3">
                        <span className="text-[#828282] font-medium">Website</span>
                        <a href={dna?.website} target="_blank" rel="noreferrer" className="text-brand-secondary hover:underline font-semibold">{dna?.website}</a>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#828282] font-medium">USP (Unique Value)</span>
                      <span className="text-[#ffffff] text-right max-w-[200px] leading-snug">{dna?.usp}</span>
                    </div>
                  </div>
                </div>

                {/* Box 2: Mission, Vision & Personality */}
                <div className="bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="text-[11px] font-medium text-[#828282] uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-brand-secondary" />
                    Brand Identity DNA
                  </h3>
                  
                  <div className="space-y-4 text-[13px]">
                    <div className="flex flex-col gap-1.5 border-b border-[#828282]/20 pb-3">
                      <span className="text-[#828282] font-medium">Mission</span>
                      <p className="text-[#ffffff] leading-relaxed">{dna?.mission}</p>
                    </div>
                    {dna?.vision && (
                      <div className="flex flex-col gap-1.5 border-b border-[#828282]/20 pb-3">
                        <span className="text-[#828282] font-medium">Vision</span>
                        <p className="text-[#ffffff] leading-relaxed">{dna?.vision}</p>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-[#828282]/20 pb-3">
                      <span className="text-[#828282] font-medium">Brand Personality</span>
                      <span className="text-[#ffffff] capitalize">{dna?.brand_personality}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[#828282] font-medium">Core Brand Values</span>
                      <div className="flex flex-wrap gap-2">
                        {(dna?.brand_values || []).map((v) => (
                          <span key={v} className="px-2.5 py-1 rounded bg-[#ffffff]/5 text-[11px] font-medium text-[#828282] tracking-wider uppercase">{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 3: Offerings & Pricing */}
                <div className="bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="text-[11px] font-medium text-[#828282] uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-secondary" />
                    Offerings & Commercials
                  </h3>
                  
                  <div className="space-y-4 text-[13px]">
                    {dna?.products && dna?.products.length > 0 && (
                      <div className="flex flex-col gap-2 border-b border-[#828282]/20 pb-3">
                        <span className="text-[#828282] font-medium">Products</span>
                        <div className="flex flex-wrap gap-2">
                          {dna?.products.map(p => (
                            <span key={p} className="px-2.5 py-1 rounded bg-[#ffffff]/5 text-[12px] text-[#ffffff]">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {dna?.services && dna?.services.length > 0 && (
                      <div className="flex flex-col gap-2 border-b border-[#828282]/20 pb-3">
                        <span className="text-[#828282] font-medium">Services</span>
                        <div className="flex flex-wrap gap-2">
                          {dna?.services.map(s => (
                            <span key={s} className="px-2.5 py-1 rounded bg-[#ffffff]/5 text-[12px] text-[#ffffff]">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#828282] font-medium">Pricing Strategy</span>
                      <span className="text-[#ffffff]">{dna?.pricing}</span>
                    </div>
                  </div>
                </div>

                {/* Box 4: Target Audience Profile */}
                <div className="bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="text-[11px] font-medium text-[#828282] uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-secondary" />
                    Target Audience & Market
                  </h3>
                  
                  <div className="space-y-4 text-[13px]">
                    <div className="flex flex-col gap-1.5 border-b border-[#828282]/20 pb-3">
                      <span className="text-[#828282] font-medium">Target Demographics</span>
                      <p className="text-[#ffffff] leading-relaxed">{dna?.target_audience}</p>
                    </div>
                    {dna?.customer_personas && (
                      <div className="flex flex-col gap-1.5 border-b border-[#828282]/20 pb-3">
                        <span className="text-[#828282] font-medium">Customer Persona</span>
                        <p className="text-[#828282] italic leading-relaxed">{dna?.customer_personas}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[#828282] font-medium block mb-1">Country Focus</span>
                        <span className="text-[#ffffff]">{dna?.country}</span>
                      </div>
                      <div>
                        <span className="text-[#828282] font-medium block mb-1">Languages</span>
                        <span className="text-[#ffffff]">{(dna?.languages || []).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Box 5: Brand Assets & Media Locker */}
              {assets && (
                <div className="bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="text-[11px] font-medium text-[#828282] uppercase tracking-wider flex items-center gap-2 border-b border-[#828282]/20 pb-4">
                    <Image className="w-4 h-4 text-brand-secondary" />
                    Brand Assets & Media Locker
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[13px]">
                    
                    {/* Logo & Guideline Column */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[#828282] block mb-2 font-medium">Active Logo Graphic</span>
                        {assets.logo_url ? (
                          (() => {
                            const activeFontName = typography.primaryFont || "Outfit";
                            const f = activeFontName.toLowerCase();
                            const activeFontStyle = f.includes("cinzel") 
                              ? "tracking-[0.15em] font-black uppercase text-sm"
                              : f.includes("syne")
                              ? "tracking-wider font-extrabold uppercase text-sm"
                              : f.includes("montserrat")
                              ? "tracking-[0.2em] font-light uppercase text-[8px]"
                              : f.includes("playfair")
                              ? "tracking-wider font-extrabold italic text-sm"
                              : "tracking-widest font-black uppercase text-sm";
                            const displayActiveBrandName = f.includes("montserrat") 
                              ? dna?.brand_name.toUpperCase() 
                              : dna?.brand_name;
                            return (
                              <div className="w-32 h-32 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner">
                                <img 
                                  src={assets.logo_url} 
                                  alt="Brand Logo" 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            );
                          })()
                        ) : assets.logo_studio_data?.assets?.primaryLogoSvg ? (
                          <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center p-2 shadow-none" dangerouslySetInnerHTML={{ __html: assets.logo_studio_data.assets.primaryLogoSvg }} />
                        ) : (
                          <span className="text-[#828282] italic text-sm">No logo uploaded or generated</span>
                        )}
                      </div>
                    </div>

                    {/* Media Gallery & Resources Columns */}
                    <div className="md:col-span-2 space-y-4">
                      {/* Row 1: Images Gallery */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Product Photos */}
                        <div className="space-y-1.5">
                          <span className="text-[#828282] block font-semibold">Product Images ({assets.product_images?.length || 0})</span>
                          {assets.product_images && assets.product_images.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.product_images.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border-none overflow-hidden bg-black block hover:opacity-80">
                                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#828282] italic text-xs block">No product images</span>
                          )}
                        </div>

                        {/* Team Photos */}
                        <div className="space-y-1.5">
                          <span className="text-[#828282] block font-semibold">Team Photos ({assets.team_photos?.length || 0})</span>
                          {assets.team_photos && assets.team_photos.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.team_photos.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border-none overflow-hidden bg-black block hover:opacity-80">
                                  <img src={img} alt="Team" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#828282] italic text-xs block">No team photos</span>
                          )}
                        </div>

                        {/* Office Workspace */}
                        <div className="space-y-1.5">
                          <span className="text-[#828282] block font-semibold">Office Images ({assets.office_images?.length || 0})</span>
                          {assets.office_images && assets.office_images.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.office_images.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border-none overflow-hidden bg-black block hover:opacity-80">
                                  <img src={img} alt="Office" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#828282] italic text-xs block">No office images</span>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Videos, Fonts & Icons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#828282]/20 pt-3">
                        {/* Brand Videos */}
                        <div className="space-y-1.5">
                          <span className="text-[#828282] block font-semibold">Brand Videos ({assets.brand_videos?.length || 0})</span>
                          {assets.brand_videos && assets.brand_videos.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.brand_videos.map((vid, i) => (
                                <a key={i} href={vid} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-[#ffffff]/50 hover:bg-[#E1E0CC]">
                                  <Video className="w-4 h-4" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#828282] italic text-xs block">No videos uploaded</span>
                          )}
                        </div>

                        {/* Custom Fonts */}
                        <div className="space-y-1.5">
                          <span className="text-[#828282] block font-semibold">Brand Fonts ({assets.fonts?.length || 0})</span>
                          {assets.fonts && assets.fonts.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.fonts.map((f, i) => (
                                <a key={i} href={f} target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-black border-none text-[8px] font-sans tracking-normal font-bold text-[#ffffff]/80 hover:bg-[#E1E0CC]/10">
                                  FONT {i + 1}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#828282] italic text-xs block">No fonts uploaded</span>
                          )}
                        </div>

                        {/* Custom Icons */}
                        <div className="space-y-1.5">
                          <span className="text-[#828282] block font-semibold">Brand Icons ({assets.icons?.length || 0})</span>
                          {assets.icons && assets.icons.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.icons.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border-none overflow-hidden bg-black block hover:opacity-80">
                                  <img src={img} alt="Icon" className="w-full h-full object-contain p-1" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#828282] italic text-xs block">No icons uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>



                  {/* If generated via AI Logo Studio, show colors & typographies specifications */}
                  {assets.logo_studio_data?.colors && (
                    <div className="border-t border-[#828282]/20 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px] font-medium tracking-wider uppercase">
                      <div>
                        <span className="text-[11px] text-[#828282] block mb-1">PRIMARY HEX</span>
                        <div className="flex items-center gap-2 font-bold text-[#ffffff]">
                          <span className="w-3 h-3 rounded-sm border border-[#828282]/20" style={{ backgroundColor: assets.logo_studio_data.colors.primaryHex }} />
                          {assets.logo_studio_data.colors.primaryHex}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#828282] block mb-1">SECONDARY HEX</span>
                        <div className="flex items-center gap-2 font-bold text-[#ffffff]">
                          <span className="w-3 h-3 rounded-sm border border-[#828282]/20" style={{ backgroundColor: assets.logo_studio_data.colors.secondaryHex }} />
                          {assets.logo_studio_data.colors.secondaryHex}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#828282] block mb-1">CMYK</span>
                        <div className="font-bold text-[#ffffff]">{assets.logo_studio_data.colors.primaryCmyk}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#828282] block mb-1">PANTONE APPROX</span>
                        <div className="font-bold text-[#ffffff]">{assets.logo_studio_data.colors.pantoneApprox}</div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {activeTab === "assets" && (
            <AssetsView workspaceId={activeWorkspace?.id || ""} refreshKey={assetRefreshKey} />
          )}

          {/* Tab 3: Content Planner & Automation Engine */}
          {activeTab === "campaigns" && (
            <div className="relative animate-fade-up">
              {!hasAutomateAccess && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-3xl">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 rounded-full bg-[#E1E0CC]/10 flex items-center justify-center text-[#E1E0CC] mx-auto mb-4">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#ffffff]">Campaigns & Calendar</h2>
                    <p className="text-sm text-[#828282] max-w-md mx-auto">
                      Unlock the autonomous engine to plan, generate, design, and auto-post 30 days of brand strategy directly to your target channels.
                    </p>
                    <Link
                      href="/dashboard/billing"
                      className="inline-flex mt-4 bg-[#DEDBC8] text-black font-medium py-3 px-6 rounded-full hover:bg-[#E1E0CC] transition-colors items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Upgrade to Automate
                    </Link>
                  </div>
                </div>
              )}

              <div className={`space-y-8 ${!hasAutomateAccess ? "opacity-50 pointer-events-none select-none filter blur-[4px]" : ""}`}>
              
              {/* MAIN USP HERO: AUTOMATE YOUR BRAND */}
              <div className="relative overflow-hidden rounded-2xl bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all p-6 sm:p-8 shadow-none text-[#ffffff]">
                <div className="relative z-10 space-y-6">
                  {/* Top USP Banner Title */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E0CC]/50 pb-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1E0CC]/10 border-none text-[#ffffff] text-sm font-sans tracking-normal font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff]">
                        <Sparkles className="w-3 h-3 text-brand-secondary" />
                        CORE USP • BRAND AUTOMATION ENGINE
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#ffffff] flex items-center gap-3">
                        Automate Your Brand
                        <span className={`text-[11px] font-bold tracking-wide px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          isAutopilotActive 
                            ? "bg-[#E1E0CC]/15 text-[#ffffff]" 
                            : "bg-black/50 text-[#828282]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAutopilotActive ? "bg-[#E1E0CC]/10 animate-pulse" : "bg-gray-400"}`} />
                          {isAutopilotActive ? "AUTO-PILOT ACTIVE" : "AUTO-PILOT PAUSED"}
                        </span>
                      </h2>
                      <p className="text-xs text-[#828282] leading-relaxed">
                        Connect your social channels once. Our autonomous AI engine plans, generates, designs, and auto-posts 30 days of brand strategy directly to your target channels.
                      </p>
                    </div>

                    {/* Auto-Pilot Toggle Button */}
                    <button
                      onClick={() => setIsAutopilotActive(!isAutopilotActive)}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] font-bold text-[#101010] transition-all flex items-center gap-2 shrink-0 ${
                        isAutopilotActive 
                          ? "bg-[#E1E0CC] text-[#101010] hover:bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all hover:text-[#ffffff] border border-transparent hover:border-[#E1E0CC]/50" 
                          : "bg-[#E1E0CC] text-[#101010] hover:bg-white"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {isAutopilotActive ? "Auto-Pilot Active (Pause)" : "Activate Auto-Pilot"}
                    </button>
                  </div>

                  {/* Connected Social Media Channels Grid (Instagram Exclusive) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-sans tracking-normal font-bold uppercase text-[#828282] tracking-wider">
                        Connected Publishing Target (Instagram Active)
                      </span>
                      <button
                        onClick={() => setIsInstagramModalOpen(true)}
                        className="text-sm font-sans tracking-normal font-bold text-[#ffffff] hover:underline cursor-pointer"
                      >
                        + Configure Instagram Connection
                      </button>
                    </div>
                    
                    <div className="bg-black/50 border-none rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-[#ffffff] tracking-wider">Instagram Business</span>
                          <span className="text-xs font-sans tracking-normal font-bold px-2 py-0.5 rounded bg-[#E1E0CC]/10/10 text-[#828282] border-none/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E1E0CC]/10 animate-pulse" />
                            PRIMARY & EXCLUSIVE PLATFORM
                          </span>
                        </div>
                        <p className="text-xs font-sans tracking-normal text-[#ffffff]">
                          Connected Account: <span className="text-[#ffffff] font-bold">{instagramHandle}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-sans tracking-normal">
                          <span className="text-xs font-bold text-[#ffffff] block">
                            {calendar.length} Posts Planned
                          </span>
                          <span className="text-xs text-[#828282]">
                            {calendar.filter(i => i.status === "completed").length} Completed • {calendar.filter(i => i.status === "scheduled" || !i.status).length} Auto-Scheduled
                          </span>
                        </div>
                        <button
                          onClick={() => setIsInstagramModalOpen(true)}
                          className="px-3.5 py-2 bg-primary hover:bg-[#E1E0CC] text-black font-medium text-sm rounded-full transition-all cursor-pointer"
                        >
                          Settings
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Engine Rules & Schedule */}
                  <div className="bg-gray-850 border-none rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#E1E0CC]/90 rounded-lg text-[#101010]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs text-[#828282] uppercase font-sans tracking-normal font-bold tracking-wider block">Posting Schedule</span>
                        <span className="font-semibold text-[#ffffff] text-xs">1 Post / Day (09:30 AM EST)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#E1E0CC]/90 rounded-lg text-[#101010]">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs text-[#828282] uppercase font-sans tracking-normal font-bold tracking-wider block">Target Timezone</span>
                        <span className="font-semibold text-[#ffffff] text-xs">US / Eastern (EST Peak Window)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#E1E0CC]/90 rounded-lg text-[#101010]">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs text-[#828282] uppercase font-sans tracking-normal font-bold tracking-wider block">Publishing Mode</span>
                        <span className="font-semibold text-[#ffffff] text-xs">Smart Review & AI Publishing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 30-DAY CONTENT PLANNER GRID */}
              <div className="space-y-4">
                
                {/* Header & Controls */}
                <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)]/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#ffffff] flex items-center gap-2 uppercase tracking-[0.2em] font-bold text-[#ffffff]">
                      <Calendar className="w-4 h-4 text-[#ffffff]/80" />
                      30-Day Content Timeline
                    </h3>
                    <p className="text-[11px] text-[#828282] mt-0.5">
                      Detailed post blueprints, concept briefs, prompts, and direct AI studio generators.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Format Filter */}
                    <div className="flex items-center bg-[#E1E0CC]/10 p-1 rounded-2xl text-sm font-bold">
                      {["all", "carousel", "static"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setCalendarFilterType(type)}
                          className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                            calendarFilterType === type ? "bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff] shadow-none" : "text-[#ffffff]/60 hover:text-[#ffffff]"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsCampaignModalOpen(true)}
                      className="px-4 py-2 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff] rounded-2xl text-xs font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] hover:bg-brand-darkHover transition-all flex items-center gap-1.5 shadow-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Plan New Campaign
                    </button>
                  </div>
                </div>

                {/* Content Cards Grid */}
                <div className="space-y-4">
                  {calendar.length === 0 ? (
                    <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)]/80 rounded-2xl p-12 text-center space-y-4">
                      {isGeneratingCalendar ? (
                        <>
                          <Loader2 className="w-6 h-6 text-[#828282] animate-spin mx-auto" />
                          <p className="text-[#828282] italic text-xs font-sans tracking-normal">Compiling 30-day strategy timeline...</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[#828282] text-sm">No calendar generated yet.</p>
                          <button
                            onClick={handleGenerateStrategy}
                            className="px-6 py-2.5 bg-brand-primary text-black hover:bg-[#c9c5a9] transition-all rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-brand-primary/20 mx-auto"
                          >
                            Generate 30-Day Strategy
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <CalendarView 
                          items={calendar} 
                          selectedDate={selectedCalendarDate} 
                          onSelectDate={setSelectedCalendarDate} 
                        />
                      </div>
                      
                      {selectedCalendarDate && (
                        <h3 className="text-[#E1E0CC] font-serif-italic text-lg border-b border-[#828282]/20 pb-2 mb-4">
                          Detailed Plan for {format(selectedCalendarDate, "MMMM do, yyyy")}
                        </h3>
                      )}
                      
                      {calendar
                        .filter((item) => {
                          // Type filter
                          if (calendarFilterType === "carousel" && item.post_type !== "carousel") return false;
                          if (calendarFilterType === "static" && item.post_type === "carousel") return false;
                          
                          // Date filter
                          if (selectedCalendarDate && item.date !== format(selectedCalendarDate, "yyyy-MM-dd")) {
                            return false;
                          }
                          
                          return true;
                        })
                        .map((item, idx) => {
                        const isCarousel = item.post_type === "carousel";
                        return (
                          <div 
                            key={item.id || idx} 
                            className="bg-[#1c1e21] border border-[#828282]/20 hover:border-[#828282]/20 rounded-2xl p-6 shadow-sm transition-all space-y-5 group"
                          >
                            {/* Card Top Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#828282]/20 pb-4">
                              <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-[#ffffff]/5 text-[#ffffff] text-[11px] font-bold uppercase tracking-wider rounded-md border border-[#828282]/20">
                                  {item.date || `DAY ${idx + 1}`}
                                </span>
                                <span className="text-[12px] text-[#828282] font-medium flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  09:30 AM EST (Optimal Peak)
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Format Badge */}
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#828282] px-3 py-1 rounded-md border border-[#828282]/20 bg-black">
                                  {isCarousel ? "Carousel Deck (5 Slides)" : "Static Post (1:1)"}
                                </span>

                                {/* Status Badge */}
                                <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border flex items-center gap-1.5 ${
                                  item.status === "completed" 
                                    ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20" 
                                    : "bg-[#ffffff]/5 text-[#828282] border-[#828282]/20"
                                }`}>
                                  {item.status === "completed" ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Generated</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3" />
                                      <span>Scheduled</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Content Body */}
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h4 className="text-[15px] font-semibold text-[#ffffff] leading-snug">
                                  {item.title}
                                </h4>
                                <span className="text-[11px] font-bold text-[#828282] bg-[#ffffff]/5 px-3 py-1 rounded-md border border-[#828282]/20 w-fit shrink-0 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Target className="w-3.5 h-3.5 text-[#828282]" />
                                  {item.goal || item.category || 'Thought Leadership'}
                                </span>
                              </div>

                              {/* Detailed Concept Brief Box */}
                              <div className="bg-black/50 border border-[#828282]/20 rounded-xl p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#828282]">
                                    Visual Concept & Execution Prompt
                                  </span>
                                  <span className="text-[11px] text-[#828282] font-medium tracking-wide uppercase">
                                    Vibe: {dna?.brand_personality || "Minimalist"}
                                  </span>
                                </div>
                                <p className="text-[13px] text-[#828282] leading-relaxed">
                                  {item.concept_brief || item.description || item.title}
                                </p>
                              </div>

                              {/* Publishing Channels */}
                              <div className="flex items-center gap-2 text-sm text-[#ffffff]/70 font-light leading-relaxed font-medium uppercase tracking-[0.2em] font-bold text-[#ffffff] font-semibold">
                                <span>Publishing Target:</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-[#E1E0CC] text-[#101010] px-2.5 py-0.5 rounded text-xs font-sans tracking-normal font-bold uppercase border-none">
                                    Instagram ({instagramHandle})
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="border-t border-[#828282]/20 pt-5 flex flex-wrap items-center justify-between gap-4 mt-2">
                              <div className="flex items-center gap-3">
                                {/* Redirection Button */}
                                <button
                                  onClick={() => handleRedirectToStudio(item)}
                                  className="px-5 py-2 bg-[#ffffff]/5 border border-[#828282]/20 hover:bg-[#ffffff]/10 hover:border-white/20 text-[#ffffff] text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                                  <span>Generate in Studio</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>

                                {/* Direct Background AI Execution */}
                                {item.status !== "completed" && (
                                  <button
                                    disabled={generatingAssetId === item.id}
                                    onClick={async () => {
                                      setGeneratingAssetId(item.id);
                                      try {
                                        const res = await fetch("/api/content/generate", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            calendarItemId: item.id,
                                            targetModel: selectedModel
                                          })
                                        });
                                        if (res.ok) {
                                          const enqueueResult = await res.json();
                                          const jobId = enqueueResult.jobId;
                                          let isCompleted = false;
                                          while (!isCompleted) {
                                            await new Promise(resolve => setTimeout(resolve, 3000));
                                            const jobRes = await fetch(`/api/jobs/${jobId}`);
                                            if (jobRes.ok) {
                                              const jobData = await jobRes.json();
                                              if (jobData.job.status === 'completed') {
                                                 isCompleted = true;
                                              } else if (jobData.job.status === 'failed') {
                                                 alert("Generation failed");
                                                 break;
                                              }
                                            }
                                          }
                                          await reloadDynamicData(dna?.id || "");
                                        } else {
                                          alert("Failed to enqueue generation");
                                        }
                                      } catch (e) {
                                        console.error(e);
                                      } finally {
                                        setGeneratingAssetId(null);
                                      }
                                    }}
                                    className="px-5 py-2 bg-transparent hover:bg-[#ffffff]/5 text-[#828282] hover:text-[#ffffff] font-semibold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer border border-transparent"
                                  >
                                    {generatingAssetId === item.id ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                                        <span>Generating...</span>
                                      </>
                                    ) : (
                                      <span>Quick Auto-Generate</span>
                                    )}
                                  </button>
                                )}



                                {publishedPostLink && publishedPostLink.id === item.id && (
                                  <a
                                    href={publishedPostLink.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-[#E1E0CC]/10 text-[#ffffff] border-none rounded-2xl text-sm font-sans tracking-normal font-bold flex items-center gap-1 hover:underline"
                                  >
                                    <Check className="w-3 h-3 text-[#ffffff]" />
                                    <span>Live on IG</span>
                                  </a>
                                )}
                              </div>

                              {/* View Asset Button */}
                              {item.status === "completed" && item.post && (
                                <button
                                  onClick={() => {
                                    setViewingAsset(item.post);
                                    setActiveSlide(0);
                                    setIsVideoPlaying(false);
                                    setVideoTimer(0);
                                  }}
                                  className="px-4 py-2 bg-[#E1E0CC]/10 hover:bg-[#E1E0CC]/10 text-[#ffffff] font-bold text-xs uppercase tracking-[0.2em] font-bold text-[#ffffff] rounded-2xl border-none transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Asset</span>
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

              </div>
            </div>
            </div>
          )}


          {/* Tab 5: Post Generator Studio */}
          {activeTab === "studio" && (
            <div className="space-y-6 animate-fade-up">
              {/* Header */}
              <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)]/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#ffffff] flex items-center gap-1.5 uppercase tracking-[0.2em] font-bold text-[#ffffff]">
                    <Image className="w-4 h-4 text-[#0A0A0A]" />
                    Post Generator Studio
                  </h3>
                  <p className="text-[11px] text-[#828282] mt-0.5">
                    Generate premium, brand-consistent marketing graphics using Flux Schnell.
                  </p>
                </div>
                {/* Active Brand Visual Indicator */}
                <div className="flex items-center gap-2 bg-[#0D0D0D] px-3.5 py-2 rounded-2xl border-none text-sm text-[#ffffff]/70 font-light leading-relaxed font-medium uppercase tracking-[0.2em] font-bold text-[#ffffff]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1E0CC]/10 animate-pulse" />
                  <span>Brand Guidelines Active</span>
                  <div className="flex items-center gap-1 ml-1.5 border-l border-[#E1E0CC]/50 pl-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-[#828282]/20" style={{ backgroundColor: assets?.logo_studio_data?.colors?.primaryHex || "#0D0D0D" }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-[#828282]/20" style={{ backgroundColor: assets?.logo_studio_data?.colors?.secondaryHex || "#DEDBC8" }} />
                  </div>
                </div>
              </div>

              {/* Main Studio Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left panel: Prompt & Settings (5 Cols) */}
                <div className="lg:col-span-5 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all rounded-2xl p-5 shadow-none space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff] block">
                      Describe your post topic / idea
                    </label>
                    <textarea
                      value={postPrompt}
                      onChange={(e) => setPostPrompt(e.target.value)}
                      placeholder="e.g. A premium, minimal advertisement post showcasing a luxury watch with sleek metallic textures and dark dramatic lighting..."
                      className="w-full h-32 px-3 py-2.5 rounded-2xl border-none focus:border-[#0A0A0A] text-xs bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Ratio Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff] block">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: "1:1", label: "Square (1:1)", desc: "Feed Posts" },
                        { id: "9:16", label: "Portrait (9:16)", desc: "Stories / Reels" },
                        { id: "16:9", label: "Landscape (16:9)", desc: "Banners" },
                      ].map((r) => {
                        const active = postAspectRatio === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setPostAspectRatio(r.id)}
                            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5
                              ${active
                                ? "bg-[#E1E0CC] border-[#E1E0CC] text-[#101010]"
                                : "bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all border-[#828282]/20 text-[#828282] hover:bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all hover:text-[#ffffff]/80"
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
                    className="w-full py-3 bg-primary text-black font-medium text-sm rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-[#E1E0CC] hover:scale-[1.02]"
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
                    <div className="bg-black border-none rounded-2xl p-3.5 text-sm text-[#ffffff]/60 space-y-1.5">
                      <p className="font-bold text-[#ffffff]/80 uppercase tracking-[0.2em] font-bold text-[#ffffff]">Brand DNA Context (Locked-in)</p>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff] block">Personality</span>
                          <span className="font-semibold text-[#ffffff]/80 capitalize">{dna?.brand_personality}</span>
                        </div>
                        <div>
                          <span className="text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff] block">Industry</span>
                          <span className="font-semibold text-[#ffffff]/80">{dna?.industry}</span>
                        </div>
                        {dna?.approved_moodboard && (
                          <div className="col-span-2">
                            <span className="text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff] block">Visual Direction</span>
                            <span className="font-semibold text-[#ffffff]/80">{dna?.approved_moodboard.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {postError && (
                    <div className="p-3 bg-[#E1E0CC]/10 border-none rounded-2xl text-sm text-[#ffffff] leading-normal">
                      {postError}
                    </div>
                  )}
                </div>

                {/* Right panel: Post Preview Canvas (7 Cols) */}
                <div className="lg:col-span-7 bg-[#0D0D0D] border-none rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[460px] overflow-hidden shadow-2xl">
                  {isGeneratingPost ? (
                    <div className="text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#0A0A0A] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#ffffff] uppercase tracking-[0.2em] font-bold text-[#ffffff]">Rendering Brand Asset...</p>
                        <p className="text-sm text-[#ffffff]/60">Injecting color swatches, visual styles, and moodboard rules.</p>
                      </div>
                    </div>
                  ) : generatedPostImage ? (
                    <div className="w-full flex flex-col gap-4">
                      {/* Social post frame */}
                      <div className="bg-[#111111] border-none rounded-2xl overflow-hidden shadow-xl max-w-md min-w-0 mx-auto w-full">
                        {/* Header */}
                        <div className="p-3 flex items-center justify-between border-b border-[#828282]/20">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/10 border border-[#0A0A0A]/30 flex items-center justify-center text-xs font-black text-[#ffffff]">
                              {(dna?.brand_name || "B").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#ffffff]">{dna?.brand_name || "Aethera"}</p>
                              <p className="text-[8px] text-[#ffffff]/60">Sponsored</p>
                            </div>
                          </div>
                          <span className="text-[#828282] text-xs">•••</span>
                        </div>

                        {/* Image body */}
                        <div 
                          className="w-full relative min-w-0 overflow-hidden isolate [contain:layout_paint] bg-black flex items-center justify-center"
                          style={{
                            containerType: 'size',
                            aspectRatio: postAspectRatio === '9:16' ? '9/16' : postAspectRatio === '16:9' ? '16/9' : '1/1'
                          }}
                        >
                          <style dangerouslySetInnerHTML={{ __html: `
                            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Syne:wght@400;750;800&family=Bricolage+Grotesque:wght@300;500;800&family=Space+Grotesk:wght@400;700&family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;700&family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');

                            /* Generated templates must stay within their 1080px source canvas. */
                            #social-post-image,
                            #social-post-image > div {
                              width: 100% !important;
                              height: 100% !important;
                              min-height: 0 !important;
                              max-height: 100% !important;
                              overflow: hidden !important;
                            }
                            #social-post-image > div > * {
                              min-height: 0;
                              max-height: 100%;
                            }
                            #social-post-image h1,
                            #social-post-image h2,
                            #social-post-image h3,
                            #social-post-image p {
                              overflow-wrap: anywhere;
                            }
                          `}} />
                          <div 
                            style={{
                              width: '1080px',
                              height: postAspectRatio === '9:16' ? '1920px' : postAspectRatio === '16:9' ? '607.5px' : '1080px',
                              // Fit by both dimensions so generated content cannot extend past the social frame.
                              transform: `scale(min(calc(100cqw / 1080px), calc(100cqh / ${postAspectRatio === '9:16' ? '1920px' : postAspectRatio === '16:9' ? '607.5px' : '1080px'})))`,
                              transformOrigin: 'top left',
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          >
                            {generatedPostImage.trim().startsWith('<') ? (
                              <div
                                id="social-post-image"
                                dangerouslySetInnerHTML={{ __html: generatedPostImage }}
                                className="w-full h-full max-w-full [contain:layout_paint] [&>div]:w-full [&>div]:h-full [&>div]:max-w-full bg-black relative overflow-hidden"
                              />
                            ) : (
                              <img
                                id="social-post-image"
                                src={generatedPostImage}
                                alt="Generated Post Preview"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </div>

                        {/* Footer action buttons */}
                        <div className="p-3 flex items-center justify-between text-[#828282] border-t border-[#828282]/20">
                          <div className="flex items-center gap-4 text-xs">
                            <span className="cursor-pointer hover:text-[#ffffff]">♥</span>
                            <span className="cursor-pointer hover:text-[#ffffff]">💬</span>
                            <span className="cursor-pointer hover:text-[#ffffff]">✈</span>
                          </div>
                          <span className="text-sm text-[#0A0A0A] font-bold">Learn More</span>
                        </div>
                      </div>

                      {/* Download / Info block */}
                      <div className="bg-black/40 border-none rounded-2xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#ffffff]/60 uppercase tracking-widest">Post Generation Details</span>
                          <button
                            onClick={async () => {
                              try {
                                const node = document.getElementById('social-post-image');
                                if (node) {
                                  const { toJpeg } = await import('html-to-image');
                                  const dataUrl = await toJpeg(node, { quality: 1, pixelRatio: 1 });
                                  const link = document.createElement('a');
                                  link.download = 'post-export.jpeg';
                                  link.href = dataUrl;
                                  link.click();
                                }
                              } catch (err) {
                                console.error('Failed to export image', err);
                                alert('Failed to export image');
                              }
                            }}
                            className="text-xs font-bold bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff] px-3 py-1.5 rounded-lg hover:bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/80 transition-all uppercase tracking-[0.2em] font-bold text-[#ffffff]"
                          >
                            Export JPEG
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 max-w-sm px-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#E1E0CC] border-none flex items-center justify-center mx-auto text-[#828282]">
                        <Image className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-[0.2em] font-bold text-[#ffffff]">Post Generation Canvas</h4>
                        <p className="text-sm text-[#ffffff]/60 mt-1.5 leading-relaxed">
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
            <div className="relative animate-fade-up">
              {!hasCarouselAccess && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-3xl">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 rounded-full bg-[#E1E0CC]/10 flex items-center justify-center text-[#E1E0CC] mx-auto mb-4">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#ffffff]">Carousel Studio</h2>
                    <p className="text-sm text-[#828282] max-w-md mx-auto">
                      Generate beautiful, high-converting carousel posts tailored to your brand DNA in a single click.
                    </p>
                    <Link
                      href="/dashboard/billing"
                      className="inline-flex mt-4 bg-[#DEDBC8] text-black font-medium py-3 px-6 rounded-full hover:bg-[#E1E0CC] transition-colors items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Upgrade to Pro
                    </Link>
                  </div>
                </div>
              )}

              <div className={`space-y-6 ${!hasCarouselAccess ? "opacity-50 pointer-events-none select-none filter blur-[4px]" : ""}`}>
              {/* Header */}
              <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)]/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#ffffff] flex items-center gap-1.5 uppercase tracking-[0.2em] font-bold text-[#ffffff]">
                    <Plus className="w-4 h-4 text-[#0A0A0A]" />
                    Carousel Studio
                  </h3>
                  <p className="text-[11px] text-[#828282] mt-0.5">
                    Generate visual slide decks with matching background graphics & custom HTML overlays.
                  </p>
                </div>
                {/* Visual guidelines indicator */}
                <div className="flex items-center gap-2 bg-[#0D0D0D] px-3.5 py-2 rounded-2xl border-none text-sm text-[#ffffff]/70 font-light leading-relaxed font-medium uppercase tracking-[0.2em] font-bold text-[#ffffff]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all animate-pulse" />
                  <span>Fluid Image Treatment Active</span>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Input Panel */}
                <div className="lg:col-span-5 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all rounded-2xl p-5 shadow-none space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff] block">
                      Carousel Objective / Concept
                    </label>
                    <textarea
                      value={carouselPrompt}
                      onChange={(e) => setCarouselPrompt(e.target.value)}
                      placeholder="e.g. 5 steps to curate the perfect weekend getaway. Focus on slow-living travel, nature escapes, and mental wellness..."
                      className="w-full h-32 px-3 py-2.5 rounded-2xl border-none focus:border-[#0A0A0A] text-xs bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCarousel}
                    disabled={isGeneratingCarousel || !carouselPrompt.trim()}
                    className="w-full py-3 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all hover:bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/90 text-[#090D16] font-bold text-xs uppercase tracking-[0.2em] font-bold text-[#ffffff] rounded-2xl transition-all shadow-lg shadow-[#0A0A0A]/15 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    <div className="p-3 bg-[#E1E0CC]/10 border-none rounded-2xl text-sm text-[#ffffff]">
                      {carouselError}
                    </div>
                  )}

                  {/* Settings specs info */}
                  <div className="bg-black border-none rounded-2xl p-3.5 text-sm text-[#ffffff]/70 font-light leading-relaxed space-y-2">
                    <p className="font-bold text-[#ffffff]/80 uppercase tracking-[0.2em] font-bold text-[#ffffff]">CAROUSEL MECHANICS</p>
                    <ul className="space-y-1 list-disc pl-3.5 leading-relaxed">
                      <li>Generates a unified, matching visual backdrop using FLUX.</li>
                      <li>Backdrop image is uniquely transformed on every slide (rotation shifts, scale variations, and custom vignetting).</li>
                      <li>Renders crisp, high-fidelity brand typography and logo watermarks directly in HTML layer.</li>
                    </ul>
                  </div>
                </div>

                {/* Carousel Viewer/Canvas (7 Cols) */}
                <div className="lg:col-span-7 bg-[#0D0D0D] border-none rounded-2xl p-6 flex flex-col min-h-[500px] justify-between relative shadow-2xl overflow-hidden">
                  
                  {isGeneratingCarousel ? (
                    <div className="my-auto text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#0A0A0A] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#ffffff] uppercase tracking-[0.2em] font-bold text-[#ffffff]">Synthesizing Slide Assets...</p>
                        <p className="text-sm text-[#ffffff]/60">Writing HTML copy, extracting logo marks, and rendering backdrop variations.</p>
                      </div>
                    </div>
                  ) : carouselSlides.length > 0 && generatedCarouselImage ? (
                    <div className="w-full flex flex-col gap-4">
                      {/* Social Carousel Post Frame */}
                      <div className="bg-[#111111] border-none rounded-2xl overflow-hidden shadow-xl max-w-md min-w-0 mx-auto w-full">
                        
                        {/* Post Header */}
                        <div className="p-3 flex items-center justify-between border-b border-[#828282]/20">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/20 border border-[#0A0A0A]/40 flex items-center justify-center text-xs font-black text-[#ffffff]">
                              {(dna?.brand_name || "B").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#ffffff]">{dna?.brand_name || "Aethera"}</p>
                              <p className="text-[8px] text-[#ffffff]/60">Carousel Post • Sponsored</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-sans tracking-normal font-bold text-[#828282] bg-black/60 px-2 py-0.5 rounded border-none">
                              {activeSlide + 1} / {carouselSlides.length}
                            </span>
                            <span className="text-[#828282] text-xs">•••</span>
                          </div>
                        </div>

                        {/* Live slide viewport */}
                        <div 
                          className="relative w-full min-w-0 bg-black overflow-hidden isolate [contain:layout_paint] flex items-center justify-center"
                          style={{ containerType: 'size', aspectRatio: '4/5' }}
                        >
                          <style dangerouslySetInnerHTML={{ __html: `
                            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Syne:wght@400;750;800&family=Bricolage+Grotesque:wght@300;500;800&family=Space+Grotesk:wght@400;700&family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;700&family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');

                            /* Keep each generated 1080x1350 slide inside the live social frame. */
                            #social-carousel-image,
                            #social-carousel-image > div {
                              width: 100% !important;
                              height: 100% !important;
                              min-height: 0 !important;
                              max-height: 100% !important;
                              overflow: hidden !important;
                            }
                            #social-carousel-image > div > * {
                              min-height: 0;
                              max-height: 100%;
                            }
                            #social-carousel-image h1,
                            #social-carousel-image h2,
                            #social-carousel-image h3,
                            #social-carousel-image p {
                              overflow-wrap: anywhere;
                            }
                            
                            .brand-font-heading {
                              font-family: '${assets?.logo_studio_data?.typography?.primaryFont || "inherit"}', sans-serif !important;
                            }
                            .brand-font-body {
                              font-family: '${assets?.logo_studio_data?.typography?.bodyFont || "inherit"}', sans-serif !important;
                            }
                          `}} />
                          
                          <div style={{
                            width: '1080px',
                            height: '1350px',
                            // The preview is 4:5, but measuring both axes keeps any malformed HTML slide contained.
                            transform: 'scale(min(calc(100cqw / 1080px), calc(100cqh / 1350px)))',
                            transformOrigin: 'top left',
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}>
                            {(() => {
                              const slide = carouselSlides[activeSlide];
                              const activeColors = assets?.logo_studio_data?.colors || {
                                primaryHex: "#0D0D0D",
                                secondaryHex: "#DEDBC8"
                              };
                              if (!slide?.html) {
                                return (
                                  <div id="social-carousel-image" className="relative h-full w-full flex flex-col justify-between p-16 z-10 select-none overflow-hidden bg-black">
                                    <div 
                                      className="absolute inset-0 transition-all duration-700 ease-out z-0"
                                      style={{
                                        backgroundImage: `url(${generatedCarouselImage})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        transform: `scale(${slide?.backgroundConfig?.scale || 1.15}) rotate(${slide?.backgroundConfig?.rotation || 0}deg)`,
                                        filter: `brightness(${slide?.backgroundConfig?.brightness || 0.65}) contrast(${slide?.backgroundConfig?.contrast || 1.1}) saturate(${slide?.backgroundConfig?.saturation || 0.9})`,
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] z-0 pointer-events-none" />

                                    <div className="relative flex items-center justify-between w-full z-10">
                                      <span className="text-3xl font-bold text-[#ffffff]/95 uppercase">{dna?.brand_name || "Aethera"}</span>
                                      <span className="text-3xl font-sans tracking-normal font-bold text-[#ffffff]/60">0{activeSlide + 1}</span>
                                    </div>

                                    <div className="relative space-y-8 my-auto max-w-[90%] z-10">
                                      <h2 className="text-5xl md:text-6xl font-extrabold text-[#ffffff] leading-tight">{slide?.title}</h2>
                                      <p className="text-2xl text-[#ffffff]/80 leading-relaxed font-medium">{slide?.description}</p>
                                    </div>
                                  </div>
                                );
                              }
                              
                              return (
                                <div id="social-carousel-image"
                                  className="w-full h-full max-w-full [contain:layout_paint] [&>div]:h-full [&>div]:w-full [&>div]:max-w-full select-none overflow-hidden bg-black relative"
                                  dangerouslySetInnerHTML={{
                                    __html: injectBgIntoHtml(slide.html, generatedCarouselImage, 0.08, undefined, undefined, activeColors.secondaryHex, activeColors.primaryHex)
                                  }}
                                />
                              );
                            })()}
                          </div>
                        </div>

                        {/* Footer action bar & slide dots */}
                        <div className="p-3 flex items-center justify-between text-[#828282] border-t border-[#828282]/20 bg-[#0F0F0F]">
                          <div className="flex items-center gap-3 text-xs">
                            <span className="cursor-pointer hover:text-[#ffffff]">♥</span>
                            <span className="cursor-pointer hover:text-[#ffffff]">💬</span>
                            <span className="cursor-pointer hover:text-[#ffffff]">✈</span>
                          </div>

                          {/* Slide Indicator Dots */}
                          <div className="flex items-center gap-1.5">
                            {carouselSlides.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveSlide(i)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  activeSlide === i ? "bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all w-3" : "bg-gray-700 hover:bg-black0 w-1.5"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Navigation buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={activeSlide === 0}
                              onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                              className="px-2 py-0.5 bg-[#E1E0CC] text-[#101010] rounded text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-all cursor-pointer"
                            >
                              ←
                            </button>
                            <button
                              disabled={activeSlide === carouselSlides.length - 1}
                              onClick={() => setActiveSlide(prev => Math.min(carouselSlides.length - 1, prev + 1))}
                              className="px-2 py-0.5 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff] rounded text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-all cursor-pointer"
                            >
                              →
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Clean Export Footer (Removed HTML generated tag) */}
                      <div className="bg-black/40 border-none rounded-2xl p-3.5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-[#ffffff] block">Slide {activeSlide + 1} of {carouselSlides.length}</span>
                          <span className="text-sm text-[#ffffff]/70 font-light leading-relaxed block">High-resolution vector HTML layer with brand color palette</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const node = document.getElementById('social-carousel-image');
                                if (node) {
                                  const { toJpeg } = await import('html-to-image');
                                  const dataUrl = await toJpeg(node, { quality: 1, pixelRatio: 1 });
                                  const link = document.createElement('a');
                                  link.download = `carousel-slide-${activeSlide + 1}.jpeg`;
                                  link.href = dataUrl;
                                  link.click();
                                }
                              } catch (err) {
                                console.error('Failed to export carousel image', err);
                                alert('Failed to export image');
                              }
                            }}
                            className="text-xs font-bold bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff] px-3 py-1.5 rounded-lg hover:bg-[#1c1e21] transition-all/80 uppercase tracking-[0.2em] cursor-pointer"
                          >
                            Export Slide (JPEG)
                          </button>
                          
                          <button
                            onClick={async () => {
                              try {
                                const { toJpeg } = await import('html-to-image');
                                const JSZip = (await import('jszip')).default;
                                const zip = new JSZip();
                                
                                for (let i = 0; i < carouselSlides.length; i++) {
                                  const node = document.getElementById(`carousel-export-slide-${i}`);
                                  if (node) {
                                    const dataUrl = await toJpeg(node, { quality: 1, pixelRatio: 1 });
                                    const base64Data = dataUrl.split(',')[1];
                                    zip.file(`carousel-slide-${i + 1}.jpeg`, base64Data, { base64: true });
                                  }
                                }
                                
                                const content = await zip.generateAsync({ type: 'blob' });
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(content);
                                link.download = 'carousel-export.zip';
                                link.click();
                              } catch (err) {
                                console.error('Failed to export carousel ZIP', err);
                                alert('Failed to export carousel ZIP');
                              }
                            }}
                            className="text-xs font-bold bg-[#E1E0CC] text-[#101010] px-3 py-1.5 rounded-lg hover:bg-[#DEDBC8] transition-all uppercase tracking-[0.2em] cursor-pointer"
                          >
                            Export All (ZIP)
                          </button>
                        </div>
                      </div>

                      {/* Hidden render target for full ZIP export */}
                      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
                        {carouselSlides.map((slide, idx) => {
                          const activeColors = assets?.logo_studio_data?.colors || {
                            primaryHex: "#0D0D0D",
                            secondaryHex: "#DEDBC8"
                          };
                          return (
                            <div key={idx} style={{ width: '1080px', height: '1350px' }}>
                              {!slide?.html ? (
                                <div id={`carousel-export-slide-${idx}`} className="relative h-full w-full flex flex-col justify-between p-16 z-10 select-none overflow-hidden bg-black">
                                  <div 
                                    className="absolute inset-0 transition-all duration-700 ease-out z-0"
                                    style={{
                                      backgroundImage: `url(${generatedCarouselImage})`,
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                      transform: `scale(${slide?.backgroundConfig?.scale || 1.15}) rotate(${slide?.backgroundConfig?.rotation || 0}deg)`,
                                      filter: `brightness(${slide?.backgroundConfig?.brightness || 0.65}) contrast(${slide?.backgroundConfig?.contrast || 1.1}) saturate(${slide?.backgroundConfig?.saturation || 0.9})`,
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] z-0 pointer-events-none" />

                                  <div className="relative flex items-center justify-between w-full z-10">
                                    <span className="text-3xl font-bold text-[#ffffff]/95 uppercase">{dna?.brand_name || "Aethera"}</span>
                                    <span className="text-3xl font-sans tracking-normal font-bold text-[#ffffff]/60">0{idx + 1}</span>
                                  </div>

                                  <div className="relative space-y-8 my-auto max-w-[90%] z-10">
                                    <h2 className="text-5xl md:text-6xl font-extrabold text-[#ffffff] leading-tight">{slide?.title}</h2>
                                    <p className="text-2xl text-[#ffffff]/80 leading-relaxed font-medium">{slide?.description}</p>
                                  </div>
                                </div>
                              ) : (
                                <div id={`carousel-export-slide-${idx}`}
                                  className="w-full h-full [&>div]:h-full [&>div]:w-full select-none overflow-hidden bg-black relative"
                                  dangerouslySetInnerHTML={{
                                    __html: injectBgIntoHtml(slide.html, generatedCarouselImage, 0.08, undefined, undefined, activeColors.secondaryHex, activeColors.primaryHex)
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center space-y-4 max-w-sm px-6 my-auto mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-[#E1E0CC] border-none flex items-center justify-center mx-auto text-[#828282]">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-[0.2em] font-bold text-[#ffffff]">Carousel Studio Canvas</h4>
                        <p className="text-sm text-[#ffffff]/60 mt-1.5 leading-relaxed font-normal">
                          Describe the topic of your carousel presentation. The AI will generate a beautiful backdrop image and construct the individual slides overlaid in premium HTML layouts.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
            </div>
          )}

          {/* Tab 7: Video Generator Studio */}
          {activeTab === "video" && (
            <div className="space-y-6 animate-fade-up">
              {/* Header */}
              <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)]/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#ffffff] flex items-center gap-1.5 uppercase tracking-[0.2em] font-bold text-[#ffffff]">
                    <Video className="w-4 h-4 text-[#0A0A0A]" />
                    Video Studio
                  </h3>
                  <p className="text-[11px] text-[#828282] mt-0.5">
                    Generate cinematic social ads & video campaigns using the LongCat-Video 13.6B generation engine.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-[#0D0D0D] px-3.5 py-2 rounded-2xl border-none text-sm text-[#ffffff]/70 font-light leading-relaxed font-medium uppercase tracking-[0.2em] font-bold text-[#ffffff]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1E0CC]/10 animate-pulse" />
                  <span>Meituan LongCat Engine Active</span>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Input Panel */}
                <div className="lg:col-span-5 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all rounded-2xl p-5 shadow-none space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff] block">
                      Video Scene / Concept Description
                    </label>
                    <textarea
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="e.g. A panning cinematic shot of a luxury boutique resort room in Maharashtra with sunlight casting long shadows. A hot cup of tea steaming gently on a low wooden table..."
                      className="w-full h-32 px-3 py-2.5 rounded-2xl border-none focus:border-[#0A0A0A] text-xs bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Duration Selector */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff] block">
                      Duration Scale (Meituan Long Video)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["10s", "20s", "30s"].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setVideoDuration(dur)}
                          className={`py-2 rounded-2xl text-xs font-bold transition-all border uppercase tracking-[0.2em] font-bold text-[#ffffff]
                            ${videoDuration === dur
                              ? "bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#090D16] border-[#0A0A0A]"
                              : "bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#828282] border-[#828282]/20 hover:bg-black"
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
                    className="w-full py-3 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all hover:bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/90 text-[#090D16] font-bold text-xs uppercase tracking-[0.2em] font-bold text-[#ffffff] rounded-2xl transition-all shadow-lg shadow-[#0A0A0A]/15 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    <div className="p-3 bg-[#E1E0CC]/10 border-none rounded-2xl text-sm text-[#ffffff]">
                      {videoError}
                    </div>
                  )}

                  {/* Mechanics Details */}
                  <div className="bg-black border-none rounded-2xl p-3.5 text-sm text-[#ffffff]/70 font-light leading-relaxed space-y-2">
                    <p className="font-bold text-[#ffffff]/80 uppercase tracking-[0.2em] font-bold text-[#ffffff]">LONG CAT VIDEO SPECS</p>
                    <ul className="space-y-1 list-disc pl-3.5 leading-relaxed">
                      <li>Uses a 13.6B parameter Dense Transformer model.</li>
                      <li>Calculates smooth camera shifts & volumetric lighting matching your primary color ({assets?.logo_studio_data?.colors?.primaryHex || "#0D0D0D"}) and accent color ({assets?.logo_studio_data?.colors?.secondaryHex || "#DEDBC8"}).</li>
                      <li>Ensures temporal coherence and subject appearance stability across all generated frames.</li>
                    </ul>
                  </div>
                </div>

                {/* Video Preview Canvas */}
                <div className="lg:col-span-7 bg-[#0D0D0D] border-none rounded-2xl p-6 flex flex-col min-h-[500px] justify-between relative shadow-2xl overflow-hidden">
                  
                  {isGeneratingVideo ? (
                    <div className="my-auto text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#0A0A0A] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#ffffff] uppercase tracking-[0.2em] font-bold text-[#ffffff]">{videoQueueStatus || "Processing Video..."}</p>
                        <p className="text-sm text-[#ffffff]/60">Compiling visual context, computing frame sequences, and generating video stream.</p>
                      </div>
                    </div>
                  ) : generatedVideoUrl ? (
                    <div className="space-y-6 w-full">
                      <span className="text-xs font-black text-[#0A0A0A] uppercase tracking-widest block">
                        Cinematic Feed Preview
                      </span>

                      {/* Video Player */}
                      <div className="relative aspect-video w-full max-w-lg mx-auto bg-black rounded-2xl overflow-hidden border-none shadow-2xl">
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
                      <div className="bg-black/40 border-none rounded-2xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#ffffff]/60 uppercase tracking-widest">Video Output Details</span>
                          <a
                            href={generatedVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff] px-3 py-1.5 rounded-lg hover:bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/80 transition-all uppercase tracking-[0.2em] font-bold text-[#ffffff]"
                          >
                            Download Video
                          </a>
                        </div>
                        {generatedVideoPrompt && (
                          <div className="space-y-1">
                            <span className="text-[8px] text-[#828282] uppercase tracking-[0.2em] font-bold text-[#ffffff]">Compiled Video Motion Prompt</span>
                            <p className="text-sm text-[#ffffff]/70 font-light leading-relaxed font-medium uppercase tracking-[0.2em] font-bold text-[#ffffff] leading-relaxed font-sans tracking-normal bg-black/60 p-2.5 rounded-lg border-none max-h-24 overflow-y-auto">
                              {generatedVideoPrompt}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center space-y-4 max-w-sm px-6 my-auto mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-[#E1E0CC] border-none flex items-center justify-center mx-auto text-[#828282]">
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-[0.2em] font-bold text-[#ffffff]">Video Studio Canvas</h4>
                        <p className="text-sm text-[#ffffff]/60 mt-1.5 leading-relaxed font-normal">
                          Describe the scene motion, camera path, and visual setting. The model will compile a rich video prompt aligned with your brand details and render a premium cinematic marketing clip.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab 8: SaaS Settings Panel */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-up">
              {/* Header */}
              <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)]/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#ffffff] flex items-center gap-1.5 uppercase tracking-[0.2em] font-bold text-[#ffffff]">
                    <Settings className="w-4 h-4 text-brand-dark" />
                    SaaS Platform Settings
                  </h3>
                  <p className="text-[11px] text-[#828282] mt-0.5">
                    Manage your personal profile, workspaces, invite team members, and check billing.
                  </p>
                </div>
              </div>

              {/* Layout: Inner tabs */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Inner Sub-Nav */}
                <div className="w-full lg:w-48 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/80 rounded-2xl p-3 shrink-0 h-fit space-y-1">
                  <button
                    onClick={() => setSettingsTab("profile")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all text-left
                      ${settingsTab === "profile"
                        ? "bg-black border-none text-[#ffffff] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                        : "text-[#828282] hover:text-[#ffffff]/90 hover:bg-[#E1E0CC]/5"
                      }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => setSettingsTab("team")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all text-left
                      ${settingsTab === "team"
                        ? "bg-black border-none text-[#ffffff] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                        : "text-[#828282] hover:text-[#ffffff]/90 hover:bg-[#E1E0CC]/5"
                      }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Team & Members</span>
                  </button>

                  <button
                    onClick={() => setSettingsTab("billing")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all text-left
                      ${settingsTab === "billing"
                        ? "bg-black border-none text-[#ffffff] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                        : "text-[#828282] hover:text-[#ffffff]/90 hover:bg-[#E1E0CC]/5"
                      }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Billing & Quota</span>
                  </button>
                </div>

                {/* Right Sub-Tab Content */}
                <div className="flex-1 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/80 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)] min-h-[400px]">
                  
                  {/* profile tab */}
                  {settingsTab === "profile" && (
                    <>
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-[#ffffff] mb-1">Profile Details</h4>
                        <p className="text-[11px] text-[#828282]">Update your email, full name, and avatar settings.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#ffffff]/60 uppercase tracking-[0.2em] font-bold text-[#ffffff]">Email Address (Read-only)</label>
                          <input
                            type="text"
                            disabled
                            value={currentUser?.email || ""}
                            className="bg-black border-none text-[#828282] outline-none rounded-2xl px-3.5 py-2.5 text-xs cursor-not-allowed"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#ffffff]/80 uppercase tracking-[0.2em] font-bold text-[#ffffff]">Full Name</label>
                          <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)] focus:border-[#828282]/20 outline-none rounded-2xl px-3.5 py-2.5 text-xs text-[#ffffff] transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#ffffff]/80 uppercase tracking-[0.2em] font-bold text-[#ffffff]">Avatar Image URL</label>
                          <input
                            type="text"
                            value={userAvatar}
                            onChange={(e) => setUserAvatar(e.target.value)}
                            className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)] focus:border-[#828282]/20 outline-none rounded-2xl px-3.5 py-2.5 text-xs text-[#ffffff] transition-colors placeholder-gray-400"
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#828282]/20 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => activeWorkspace && handleDeleteWorkspace(activeWorkspace.id)}
                          className="px-4 py-2 bg-[#ff4a4a]/10 text-[#ff4a4a] hover:bg-[#ff4a4a]/20 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Brand
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="px-4 py-2 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all hover:bg-brand-darkHover text-[#ffffff] text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          {isSavingProfile ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Save Profile
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                    
                    <div className="mt-8 pt-8 border-t border-[#828282]/20 space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-[#ffffff] mb-1">Subscription Plan</h4>
                        <p className="text-[11px] text-[#828282]">Manage your subscription and features access.</p>
                      </div>
                      
                      <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/10 rounded-2xl p-5 shadow-[0_0_30px_rgba(225,224,204,0.02)]">
                        <div className="flex justify-between items-center mb-4">
                          <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E1E0CC]">Current Plan</span>
                            <h5 className="text-xl font-bold text-[#ffffff] capitalize">{planName} Plan</h5>
                          </div>
                          {planType === "free" && (
                            <Link
                              href="/dashboard/billing"
                              className="px-4 py-2 bg-[#DEDBC8] text-black hover:bg-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              Upgrade Now
                            </Link>
                          )}
                        </div>
                        
                        <div className="border-t border-[#828282]/20 pt-4 mt-4 space-y-3">
                          <h6 className="text-xs font-bold text-[#ffffff]/80 uppercase tracking-[0.2em]">Features Available</h6>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-[#828282]">
                              <Check className="w-4 h-4 text-[#E1E0CC]" /> Static Post Generator
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[#828282]">
                              <Check className="w-4 h-4 text-[#E1E0CC]" /> Brand DNA Builder
                            </li>
                            
                            {hasAutomateAccess ? (
                              <li className="flex items-center gap-2 text-sm text-[#828282]">
                                <Check className="w-4 h-4 text-[#E1E0CC]" /> Campaign Automation
                              </li>
                            ) : (
                              <li className="flex items-center gap-2 text-sm text-[#828282]/50">
                                <Lock className="w-4 h-4" /> Campaign Automation
                              </li>
                            )}

                            {hasCarouselAccess ? (
                              <li className="flex items-center gap-2 text-sm text-[#828282]">
                                <Check className="w-4 h-4 text-[#E1E0CC]" /> Carousel Studio
                              </li>
                            ) : (
                              <li className="flex items-center gap-2 text-sm text-[#828282]/50">
                                <Lock className="w-4 h-4" /> Carousel Studio
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                    </>
                  )}


                  {/* team tab */}
                  {settingsTab === "team" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-[#ffffff] mb-1">Team & Members</h4>
                          <p className="text-[11px] text-[#828282]">Invite colleagues, edit roles, and trace activity history logs.</p>
                        </div>
                      </div>

                      {/* Invite Form */}
                      <form onSubmit={handleInvite} className="bg-black border-none/60 rounded-2xl p-4 space-y-3">
                        <h5 className="text-xs font-bold text-[#ffffff]">Invite New Colleague</h5>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="email"
                            placeholder="colleague@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="flex-1 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all focus:border-[#828282]/20 outline-none rounded-2xl px-3.5 py-2 text-xs text-[#ffffff] transition-colors"
                          />
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)] outline-none rounded-2xl px-3.5 py-2 text-xs text-[#ffffff] cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            type="submit"
                            disabled={isInviting || !inviteEmail}
                            className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)] hover:bg-brand-darkHover disabled:opacity-50 text-[#ffffff] font-bold text-xs rounded-2xl px-4 py-2 flex items-center gap-1 transition-all"
                          >
                            {isInviting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Mail className="w-3.5 h-3.5" />
                            )}
                            Invite
                          </button>
                        </div>
                      </form>

                      {/* Team Members List */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-[#ffffff]">Active Team Members</h5>
                        <div className="border-none/80 rounded-2xl divide-y divide-gray-150">
                          {teamMembers.map((m) => (
                            <div key={m.userId} className="p-3.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                {m.avatarUrl ? (
                                  <img src={m.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-none" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#E1E0CC]/10 flex items-center justify-center font-bold text-[#ffffff]/60 uppercase">
                                    {m.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <h6 className="font-bold text-[#ffffff]">{m.name} {m.userId === currentUser?.id && <span className="text-[#828282] font-normal text-sm">(You)</span>}</h6>
                                  <p className="text-sm text-[#ffffff]/70 font-light leading-relaxed font-medium uppercase tracking-[0.2em] font-bold text-[#ffffff]">{m.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-gray-150 rounded text-xs font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-[#828282]">
                                  {m.role}
                                </span>
                                {m.userId !== currentUser?.id && (
                                  <button
                                    onClick={() => handleRemoveMember(m.userId)}
                                    className="p-1 text-[#828282] hover:text-[#ffffff] rounded transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pending Invites List */}
                      {pendingInvitations.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="text-xs font-bold text-[#ffffff]">Pending Invitations</h5>
                          <div className="border-none/80 rounded-2xl divide-y divide-gray-150">
                            {pendingInvitations.map((inv) => (
                              <div key={inv.id} className="p-3 flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-bold text-[#ffffff]">{inv.email}</p>
                                  <p className="text-xs text-[#828282]">Invited as {inv.role}</p>
                                </div>
                                <button
                                  onClick={() => handleClearInvite(inv.id)}
                                  className="text-sm text-[#ffffff] hover:underline font-bold"
                                >
                                  Revoke
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Audit Trail / Activity Logs */}
                      <div className="space-y-3 pt-6 border-t border-[#828282]/20">
                        <h5 className="text-xs font-bold text-[#ffffff] flex items-center gap-1">
                          <Activity className="w-4 h-4 text-[#828282]" />
                          Security Activity Logs
                        </h5>
                        <div className="border-none/80 rounded-2xl divide-y divide-gray-150 bg-black/50">
                          {activityLogs.length === 0 ? (
                            <div className="p-4 text-center text-sm text-[#ffffff]/70 font-light leading-relaxed font-medium uppercase tracking-[0.2em] font-bold text-[#ffffff] font-sans tracking-normal">No recent logs recorded.</div>
                          ) : (
                            activityLogs.map((log) => (
                              <div key={log.id} className="p-3 text-sm text-[#ffffff]/60 font-sans tracking-normal flex justify-between items-center">
                                <div>
                                  <span className="text-[#ffffff] font-bold">Action: {log.action}</span>
                                  <p className="text-xs text-[#828282] mt-0.5">{JSON.stringify(log.details)}</p>
                                </div>
                                <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* billing tab */}
                  {settingsTab === "billing" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-[#ffffff] mb-1">Billing & Quota</h4>
                        <p className="text-[11px] text-[#828282]">Manage plan subscriptions, usage metrics and quotas.</p>
                      </div>

                      {/* Active subscription card */}
                      <div className="p-4 bg-gradient-to-br from-brand-dark to-slate-900 text-[#ffffff] rounded-2xl shadow-none border-none space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-black text-[#ffffff] uppercase tracking-widest font-sans tracking-normal">Active Plan</span>
                            <h4 className="text-base font-black tracking-wide mt-0.5">Automarc Pro Beta</h4>
                          </div>
                          <span className="px-2.5 py-1 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-[0.2em] font-bold text-[#ffffff] border border-white/15">Active</span>
                        </div>
                        <p className="text-xs text-[#ffffff] leading-relaxed max-w-sm">
                          Your account has full access to the AI Provider Router, Content planning mixes, logo studios, and LongCat-Video models.
                        </p>
                        <div className="pt-3 border-t border-[#828282]/20 flex justify-between items-center text-sm text-[#ffffff]/70 font-light leading-relaxed font-medium uppercase tracking-[0.2em] font-bold text-[#ffffff]">
                          <span>Renews: 14 Aug 2026</span>
                          <span>Price: $0.00 (Beta Partner)</span>
                        </div>
                      </div>

                      {/* Quotas progress bar */}
                      <div className="space-y-4 pt-4">
                        <h5 className="text-xs font-bold text-[#ffffff]">Usage Analytics & Quotas</h5>
                        <div className="space-y-3.5">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#ffffff]/60 font-medium">AI Copywriting generation</span>
                              <span className="text-[#ffffff] font-bold">142 / 500 requests</span>
                            </div>
                            <div className="h-2 bg-[#E1E0CC]/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all rounded-full" style={{ width: "28.4%" }} />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#ffffff]/60 font-medium">AI Media Generation (Images/Videos)</span>
                              <span className="text-[#ffffff] font-bold">38 / 100 media files</span>
                            </div>
                            <div className="h-2 bg-[#E1E0CC]/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all rounded-full" style={{ width: "38%" }} />
                            </div>
                          </div>
                        </div>
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
            <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#ffffff] flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  Plan Custom AI Campaign
                </h3>
                <p className="text-xs text-[#828282] mt-1">AI generates a detailed campaign and schedules 5 target post concepts.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[#ffffff]/60 font-bold block">Campaign Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Launching AI Scraper V2"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full bg-black border-none rounded-2xl px-3 py-2 text-[#ffffff] outline-none focus:border-[#828282]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#ffffff]/60 font-bold block">Campaign Type</label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="w-full bg-black border-none rounded-2xl px-3 py-2 text-[#ffffff] outline-none focus:border-[#828282]/20"
                  >
                    <option>Product Launch</option>
                    <option>Sales & Promotion</option>
                    <option>Educational</option>
                    <option>Urgency/Awareness</option>
                    <option>Hiring</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#ffffff]/60 font-bold block">Campaign Brief / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your campaign objectives, USPs to highlight..."
                    value={campaignDesc}
                    onChange={(e) => setCampaignDesc(e.target.value)}
                    className="w-full bg-black border-none rounded-2xl px-3 py-2 text-[#ffffff] outline-none focus:border-[#828282]/20 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#ffffff]/60 font-bold block">Target Platforms</label>
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
                            ${active ? "bg-black/10 border-[#828282]/20 text-brand-primary" : "bg-black border-[#828282]/20 text-[#ffffff]/60"}`}
                        >
                          {platform}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-[#828282]/20 pt-4">
                <button
                  disabled={isSubmittingCampaign}
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl border-none text-[#ffffff]/60 hover:bg-black font-bold text-xs uppercase"
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
                          brandDnaId: dna?.id,
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
                        await reloadDynamicData(dna?.id || "");
                      } else {
                        alert("Failed to plan campaign");
                      }
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsSubmittingCampaign(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all hover:bg-brand-darkHover text-[#ffffff] font-bold text-xs uppercase tracking-[0.2em] font-bold text-[#ffffff] disabled:opacity-50"
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
            <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#828282]/20 pb-3">
                <div>
                  <span className="text-[8px] font-black text-[#828282] uppercase tracking-widest font-sans tracking-normal">Assets Preview</span>
                  <h3 className="text-base font-bold text-[#ffffff] capitalize">{viewingAsset.post_type} Asset Details</h3>
                </div>
                <div className="flex items-center gap-2">
                  <ExportZipButton 
                    brandName={dna?.brand_name}
                    posts={viewingAsset ? [{
                      title: viewingAsset.headline || viewingAsset.visual_prompt,
                      caption: viewingAsset.caption,
                      image_url: viewingAsset.generated_assets?.imageUrl || viewingAsset.generated_assets?.thumbnailUrl
                    }] : []}
                    carouselSlides={viewingAsset?.generated_assets?.slides ? viewingAsset.generated_assets.slides.map((s: any) => s.headline) : []}
                    className="py-1 px-3 text-[10px]"
                  />
                  <button
                    onClick={() => setViewingAsset(null)}
                    className="w-7 h-7 rounded-full bg-black border-none hover:bg-[#E1E0CC]/10 flex items-center justify-center font-bold text-[#828282] hover:text-[#ffffff]/80 cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Copy Caption */}
                <div className="space-y-1">
                  <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">Social Caption</label>
                  <div className="p-3 bg-black border-none rounded-2xl font-normal text-[#ffffff]/80 leading-relaxed whitespace-pre-wrap">
                    {viewingAsset.caption}
                  </div>
                </div>

                {/* Hooks & CTAs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">Alternative Hook Idea</label>
                    <div className="p-2.5 bg-black border-none rounded-2xl text-[#828282] font-medium leading-relaxed italic">
                      {viewingAsset.hooks?.[0] || "None generated"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">Primary CTA</label>
                    <div className="p-2.5 bg-black border-none rounded-2xl text-[#0A0A0A] font-bold">
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
                        <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">Static Feed Post Preview</label>
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-none bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-inner">
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
                              <div className="w-8 h-8 rounded-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-[#ffffff] text-xs">
                                {dna?.brand_name?.[0] || "A"}
                              </div>
                              <div>
                                <h4 className="font-bold text-[#ffffff] text-xs font-normal tracking-wide leading-none">{dna?.brand_name || "Asenra"}</h4>
                                <span className="text-[8px] text-[#ffffff] font-medium font-normal">Sponsored</span>
                              </div>
                            </div>
                            {/* Overlay Content Card */}
                            <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)]/10 backdrop-blur-lg border border-white/25 p-4 rounded-2xl space-y-1.5 shadow-xl">
                              <h4 className="font-bold text-[#ffffff] text-sm font-normal tracking-wide leading-tight">
                                {viewingAsset.title}
                              </h4>
                              <p className="text-sm text-[#ffffff] font-medium leading-relaxed line-clamp-3">
                                {viewingAsset.caption}
                              </p>
                              <div className="pt-2 flex justify-between items-center border-t border-[#828282]/20">
                                <span className="text-xs text-[#DEDBC8] font-bold tracking-wider uppercase font-sans tracking-normal">{viewingAsset.ctas?.[0] || "Learn More"}</span>
                                <div className="px-3 py-1 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-black font-bold text-xs rounded-lg shadow-none hover:scale-105 transition-transform uppercase tracking-[0.2em] font-bold text-[#ffffff]">
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
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block mb-0">Interactive Carousel Post Preview</label>
                          <button 
                            onClick={async () => {
                              try {
                                const zip = new JSZip();
                                const slides = viewingAsset.generated_assets.slides;
                                if (!slides) return;
                                for (let i = 0; i < slides.length; i++) {
                                  const node = document.getElementById(`carousel-slide-export-node-${i}`);
                                  if (!node) continue;
                                  const dataUrl = await toJpeg(node, { quality: 1.0, pixelRatio: 2 });
                                  const base64Data = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, '');
                                  zip.file(`slide-${i + 1}.jpeg`, base64Data, {base64: true});
                                }
                                const zipContent = await zip.generateAsync({type:'blob'});
                                saveAs(zipContent, 'carousel-export.zip');
                              } catch(e) { console.error(e); }
                            }}
                            className="text-[10px] bg-[#E1E0CC] text-black px-3 py-1.5 rounded-lg font-black tracking-widest uppercase hover:bg-white transition-all"
                          >Export All as ZIP</button>
                        </div>
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-none bg-black shadow-2xl flex flex-col justify-between p-5">
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
                              <div className="w-7 h-7 rounded-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-[#ffffff] text-sm">
                                {dna?.brand_name?.[0] || "A"}
                              </div>
                              <span className="text-sm font-bold text-[#ffffff] tracking-wider">{dna?.brand_name || "Asenra"}</span>
                            </div>
                            <span className="text-xs font-sans tracking-normal bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/10 backdrop-blur-md px-2 py-0.5 rounded-full text-[#ffffff]/90 border border-[#828282]/20">
                              {activeSlide + 1} / {viewingAsset.generated_assets.slides.length}
                            </span>
                          </div>

                          {/* Animated Slide Content Overlay */}
                          <div className="relative my-auto py-4 px-2 space-y-3">
                            <span className="text-[8px] font-black text-[#DEDBC8] tracking-widest uppercase font-sans tracking-normal bg-[#DEDBC8]/10 border border-[#DEDBC8]/25 px-2.5 py-0.5 rounded-full inline-block">
                              Slide {viewingAsset.generated_assets.slides[activeSlide]?.slideNumber || (activeSlide + 1)}
                            </span>
                            <h3 className="text-base font-black text-[#ffffff] leading-tight font-normal tracking-wide">
                              {viewingAsset.generated_assets.slides[activeSlide]?.headline || "Slide Title"}
                            </h3>
                            <p className="text-sm text-[#ffffff] leading-relaxed font-normal font-medium">
                              {viewingAsset.generated_assets.slides[activeSlide]?.bodyText || "Slide Body Text..."}
                            </p>
                          </div>

                          {/* Footer & Navigation Controls */}
                          <div className="relative flex justify-between items-center border-t border-[#828282]/20 pt-3">
                            <span className="text-[8px] text-[#DEDBC8] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] font-sans tracking-normal">Swipe to read</span>
                            <div className="flex space-x-2">
                              <button
                                disabled={activeSlide === 0}
                                onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                                className="w-7 h-7 rounded-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/10 border border-[#828282]/20 hover:bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/20 text-[#ffffff] flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all"
                              >
                                &larr;
                              </button>
                              <button
                                disabled={activeSlide === viewingAsset.generated_assets.slides.length - 1}
                                onClick={() => setActiveSlide(prev => Math.min(viewingAsset.generated_assets.slides.length - 1, prev + 1))}
                                className="w-7 h-7 rounded-full bg-[#DEDBC8] hover:bg-[#e0bc58] text-black flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all"
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
                        <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">Video Reels Mock Player</label>
                        <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden border-4 border-[#828282]/20 bg-black shadow-2xl flex flex-col justify-between p-4">
                          {/* Background B-roll thumbnail */}
                          <img
                            src={viewingAsset.generated_assets.thumbnailUrl || viewingAsset.generated_assets.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"}
                            alt="B-roll Background"
                            className="absolute inset-0 w-full h-full object-cover opacity-65 pointer-events-none"
                          />

                          {/* Header overlay */}
                          <div className="relative flex items-center justify-between text-[#ffffff] text-sm">
                            <span className="font-bold tracking-wider font-normal">Reels</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 bg-[#E1E0CC]/10 rounded-full animate-ping" />
                              <span className="text-xs uppercase font-sans tracking-normal tracking-wider font-bold">Preview</span>
                            </div>
                          </div>

                          {/* Play overlay / Dynamic subtitle container */}
                          <div className="relative flex flex-col items-center justify-center my-auto space-y-4 min-h-[120px] w-full">
                            {!isVideoPlaying ? (
                              <button
                                onClick={() => setIsVideoPlaying(true)}
                                className="w-12 h-12 rounded-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-[#ffffff] text-lg hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
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
                              <div className="bg-black/75 backdrop-blur-md border border-[#828282]/20 px-4 py-3 rounded-2xl max-w-[90%] text-center animate-fade-in shadow-2xl pointer-events-none">
                                <p className="text-[#ffffff] text-xs font-bold leading-normal tracking-wide font-normal">
                                  {getActiveSubtitleText()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Footer Info Overlay */}
                          <div className="relative space-y-2 text-[#ffffff]">
                            {/* Brand bar */}
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/10 border border-white/20 flex items-center justify-center font-bold text-xs">
                                {dna?.brand_name?.[0] || "A"}
                              </div>
                              <span className="text-xs font-bold tracking-wide">{dna?.brand_name || "Asenra"}</span>
                              <button className="px-2 py-0.5 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/25 rounded-md text-[8px] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff]">Follow</button>
                            </div>
                            {/* Audio track label */}
                            <p className="text-[8px] text-[#ffffff] flex items-center space-x-1 truncate font-sans tracking-normal">
                              <span>&#9835;</span> <span>Original Audio - {dna?.brand_name || "Asenra"}</span>
                            </p>
                            {/* Interactive timeline bar */}
                            <div className="h-1 bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all/25 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#DEDBC8] transition-all duration-1000 ease-linear"
                                style={{ width: `${(videoTimer / 30) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[7px] text-[#828282] font-sans tracking-normal">
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
                  <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">AI Visual Prompt (Stable Diffusion / LongCat)</label>
                  <div className="p-3 bg-black border-none rounded-2xl font-sans tracking-normal text-sm text-[#828282] leading-normal">
                    {viewingAsset.visual_prompt}
                  </div>
                </div>

                {/* Format Specific Details (e.g. Slides JSON or Video Script timings) */}
                {viewingAsset.post_type === "carousel" && viewingAsset.generated_assets?.slides && (
                  <div className="space-y-2">
                    <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">Slides Blueprint ({viewingAsset.generated_assets.slides.length})</label>
                    <div className="space-y-2">
                      {viewingAsset.generated_assets.slides.map((slide: any, idx: number) => (
                        <div key={idx} className="p-3 bg-[#1c1e21] border border-[#828282]/20 rounded-2xl space-y-1 text-[#ffffff]">
                          <span className="text-[8px] font-black text-[#DEDBC8] uppercase tracking-[0.2em] font-bold text-[#ffffff] font-sans tracking-normal">Slide {slide.slideNumber}</span>
                          <h4 className="font-bold text-xs text-[#ffffff]">{slide.headline}</h4>
                          <p className="text-sm text-[#ffffff] leading-normal">{slide.bodyText}</p>
                          <p className="text-[8px] text-[#ffffff]/60 italic mt-1">Graphic: {slide.visualDescription}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingAsset.post_type === "video" && viewingAsset.generated_assets?.script && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">Voiceover Script</label>
                      <div className="p-2.5 bg-black border-none rounded-2xl text-[#ffffff]/80 italic">
                        &ldquo;{viewingAsset.generated_assets.script.voiceover}&rdquo;
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">Subtitle Timings</label>
                      <div className="grid grid-cols-1 gap-1">
                        {viewingAsset.generated_assets.script.timings?.map((t: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-black border-none rounded-lg">
                            <span className="font-sans tracking-normal text-xs text-[#0A0A0A] font-bold shrink-0">{t.time}</span>
                            <span className="text-[#828282] font-medium text-right ml-4 truncate">{t.subtitles}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                <div className="space-y-1">
                  <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">Hashtags</label>
                  <div className="flex flex-wrap gap-1">
                    {viewingAsset.hashtags?.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-[#E1E0CC]/10 border-none text-[#ffffff]/60 font-sans tracking-normal text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              <div className="border-t border-[#828282]/20 pt-3 flex">
                <button
                  onClick={() => setViewingAsset(null)}
                  className="flex-1 py-2.5 rounded-2xl bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all hover:bg-brand-darkHover text-[#ffffff] font-bold text-xs uppercase"
                >
                  Close Asset Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instagram Business Connection Modal */}
        {isInstagramModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1c1e21] bg-gradient-to-br from-[#1C1C1C] to-black border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all shadow-[0_0_30px_rgba(225,224,204,0.02)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-[#828282]/20 pb-3">
                <div>
                  <span className="text-xs font-sans tracking-normal font-bold text-[#ffffff] uppercase tracking-[0.2em] font-bold text-[#ffffff]">Zero-Friction Social Integration</span>
                  <h3 className="text-base font-bold text-[#ffffff]">Connect Instagram Account</h3>
                </div>
                <button
                  onClick={() => setIsInstagramModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-black border-none hover:bg-[#E1E0CC]/10 flex items-center justify-center font-bold text-[#828282] hover:text-[#ffffff]/80 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Managed 1-Click Banner */}
                <div className="p-3 bg-[#E1E0CC]/10 border-none rounded-2xl space-y-1">
                  <span className="font-bold text-[#ffffff] text-sm uppercase block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#ffffff]" />
                    Managed SaaS Meta API (1-Click Connect)
                  </span>
                  <p className="text-sm text-[#828282] leading-relaxed">
                    Simply enter your Instagram username below. Our platform automatically manages all Meta Graph API tokens, OAuth handshakes, and container publishing on your behalf!
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#ffffff]/80 font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-sm block">
                    Instagram Account Handle / Username
                  </label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="e.g. @yourbrand_official"
                    className="w-full px-3.5 py-2.5 rounded-2xl border-none focus:border-[#DEDBC8] text-xs outline-none bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff] font-semibold"
                  />
                  <p className="text-xs font-sans tracking-normal text-[#828282]">
                    No technical Developer Tokens or Facebook App setup required by you.
                  </p>
                </div>

                {/* Collapsible Custom Developer Tokens */}
                <details className="text-sm text-[#ffffff]/60 border-t border-[#828282]/20 pt-2 cursor-pointer">
                  <summary className="font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] hover:text-[#ffffff]">
                    + Advanced Custom Meta App Developer Keys (Optional)
                  </summary>
                  <div className="space-y-3 pt-3">
                    <div className="space-y-1">
                      <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">
                        Custom Instagram Business Account ID
                      </label>
                      <input
                        type="text"
                        value={instagramAccountId}
                        onChange={(e) => setInstagramAccountId(e.target.value)}
                        placeholder="e.g. 17841400000000000"
                        className="w-full px-3 py-2 rounded-lg border-none text-xs font-sans tracking-normal bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#828282] font-bold uppercase tracking-[0.2em] font-bold text-[#ffffff] text-xs block">
                        Custom Page Access Token
                      </label>
                      <input
                        type="password"
                        value={instagramAccessToken}
                        onChange={(e) => setInstagramAccessToken(e.target.value)}
                        placeholder="EAAB..."
                        className="w-full px-3 py-2 rounded-lg border-none text-xs font-sans tracking-normal bg-[#1c1e21] border border-[#E1E0CC]/5 hover:border-[#E1E0CC]/15 transition-all text-[#ffffff]"
                      />
                    </div>
                  </div>
                </details>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#828282]/20">
                <button
                  onClick={() => setIsInstagramModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl border-none text-[#828282] font-bold text-xs uppercase hover:bg-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInstagram}
                  disabled={isSavingInstagram || !instagramHandle.trim()}
                  className="flex-1 py-2 rounded-full bg-primary text-black font-medium text-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer hover:bg-[#E1E0CC] hover:scale-[1.02]"
                >
                  {isSavingInstagram ? "Connecting Account..." : "Connect Instagram (1-Click)"}
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}
