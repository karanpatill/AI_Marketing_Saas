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
  Settings, Bell, Search, Activity, Trash2,
  Shield, CreditCard, Mail, User, AlertCircle,
  X, Check, Lock, ChevronDown, RefreshCw, Globe, Clock
} from "lucide-react";
import Navbar from "@/components/Navbar";
import WordsPullUp from "@/components/ui/WordsPullUp";

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
  const [activeTab, setActiveTab] = useState<"control" | "dna" | "campaigns" | "mix" | "studio" | "carousel" | "video" | "settings">("control");

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
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: postPrompt,
          aspectRatio: postAspectRatio,
          jobType: 'generate_post',
          orgId: (dna as any)?.workspace_id || activeWorkspace?.id,
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
            setGeneratedPostPrompt(jobData.job.output_reference?.prompt || "HTML generated.");
            isCompleted = true;
          } else if (jobData.job.status === 'failed') {
            throw new Error(jobData.job.error?.message || "Generation job failed");
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
    setGeneratedCarouselPrompt(null);
    setCarouselSlides([]);

    const activeColors = assets?.logo_studio_data?.colors || {
      primaryHex: "#0D0D0D",
      secondaryHex: "#C9A84C"
    };

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: carouselPrompt,
          aspectRatio: "4/5",
          jobType: 'generate_carousel',
          orgId: (dna as any)?.workspace_id || activeWorkspace?.id,
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
            setGeneratedCarouselPrompt(jobData.job.output_reference?.prompt || "HTML generated.");
            setCarouselSlides(jobData.job.output_reference?.slides || []);
            isCompleted = true;
          } else if (jobData.job.status === 'failed') {
            throw new Error(jobData.job.error?.message || "Generation job failed");
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
      secondaryHex: "#C9A84C"
    };

    try {
      // 1. Submit to queue
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace?.id,
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
            throw new Error(jobData.job.error?.message || "Video generation job failed");
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

      const { supabase } = await import("@/lib/supabase");
      const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(10);
      setActivityLogs(logs || []);
    } catch (err) {
      console.error("Failed to load org details:", err);
    }
  };

  // --- Fetch Brand DNA & Assets scoped by activeWorkspace ───
  useEffect(() => {
    async function fetchWorkspaceData() {
      if (!activeWorkspace) return;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#E1E0CC]">
        <div className="animate-spin rounded-full border-2 border-[#E1E0CC]/20 border-t-[#E1E0CC] w-8 h-8" />
        <p className="text-xs text-[#E1E0CC]/60 mt-3 font-mono">Loading Workspace Dashboard...</p>
      </div>
    );
  }

  if (!dna) {
    return (
      <div className="min-h-screen bg-black flex flex-col text-[#E1E0CC]">
        <div className="flex-1 flex flex-col items-center justify-center w-full p-6 text-center">
          <Layers className="w-16 h-16 text-[#E1E0CC]/20 mb-4" />
          <h2 className="text-2xl font-medium text-[#E1E0CC] tracking-tight">No Brand Configured</h2>
          <p className="text-[#E1E0CC]/60 mt-2 max-w-md mx-auto text-sm font-light">
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
    accent: "linear-gradient(135deg, #C9A84C 0%, #E5C158 100%)"
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
    <div className="min-h-screen bg-black text-[#E1E0CC] flex flex-col justify-between relative">
      {/* Noise Texture Background */}
      <div className="fixed inset-0 bg-noise opacity-[0.04] pointer-events-none z-0 mix-blend-overlay" />
      
      {/* Main Workspace Grid */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left App Sidebar */}
        <aside className="hidden md:flex flex-col justify-between w-[220px] bg-[#101010] border border-[#E1E0CC]/10 rounded-2xl p-4 shrink-0 shadow-2xl">
          <div className="space-y-4">
            
            {/* SaaS Workspace & Organization Switcher */}
            <div className="space-y-2 pb-3 border-b border-[#E1E0CC]/10">
              <div className="relative">
                <label className="text-[9px] font-black text-[#E1E0CC]/50 uppercase tracking-widest block mb-1">Organization</label>
                <div className="flex items-center justify-between p-2.5 bg-black border border-[#E1E0CC]/10 rounded-xl cursor-pointer hover:bg-[#E1E0CC]/10/60 transition-all text-[#E1E0CC] font-semibold text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building className="w-3.5 h-3.5 text-[#E1E0CC]/50 shrink-0" />
                    <span className="truncate">{dna?.brand_name || activeOrg?.name || "My Organization"}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-[#E1E0CC]/50 uppercase tracking-widest block mb-1">Workspace</label>
                <select
                  value={activeWorkspace?.id || ""}
                  onChange={(e) => {
                    const ws = workspaces.find(w => w.id === e.target.value);
                    if (ws) setActiveWorkspace(ws);
                  }}
                  className="w-full p-2.5 bg-black border border-[#E1E0CC]/10 rounded-xl text-xs font-semibold text-[#E1E0CC] outline-none focus:border-[#E1E0CC]/10 cursor-pointer hover:bg-[#E1E0CC]/10/60 transition-all"
                >
                  {workspaces
                    .filter(w => w.org_id === activeOrg?.id)
                    .map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("control")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "control"
                    ? "bg-black border border-[#E1E0CC]/10 text-[#E1E0CC] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                    : "text-[#E1E0CC]/50 hover:text-[#E1E0CC]/90 hover:bg-[#E1E0CC]/5"
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Mission Control</span>
              </button>

              <button
                onClick={() => setActiveTab("dna")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "dna"
                    ? "bg-black border border-[#E1E0CC]/10 text-[#E1E0CC] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                    : "text-[#E1E0CC]/50 hover:text-[#E1E0CC]/90 hover:bg-[#E1E0CC]/5"
                  }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Brand DNA Details</span>
              </button>

              <button
                onClick={() => setActiveTab("campaigns")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "campaigns"
                    ? "bg-black border border-[#E1E0CC]/10 text-[#E1E0CC] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                    : "text-[#E1E0CC]/50 hover:text-[#E1E0CC]/90 hover:bg-[#E1E0CC]/5"
                  }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Campaigns & Calendar</span>
              </button>



              <button
                onClick={() => setActiveTab("studio")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "studio"
                    ? "bg-black border border-[#E1E0CC]/10 text-[#E1E0CC] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                    : "text-[#E1E0CC]/50 hover:text-[#E1E0CC]/90 hover:bg-[#E1E0CC]/5"
                  }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>Post Generator Studio</span>
              </button>

              <button
                onClick={() => setActiveTab("carousel")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                  ${activeTab === "carousel"
                    ? "bg-black border border-[#E1E0CC]/10 text-[#E1E0CC] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                    : "text-[#E1E0CC]/50 hover:text-[#E1E0CC]/90 hover:bg-[#E1E0CC]/5"
                  }`}
              >
                <Plus className="w-3.5 h-3.5 text-[#0A0A0A]" />
                <span>Carousel Studio</span>
              </button>
            </nav>
          </div>

          {/* Settings & Sign Out */}
          <div className="space-y-1 pt-3 border-t border-[#E1E0CC]/10">
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                ${activeTab === "settings"
                  ? "bg-black border border-[#E1E0CC]/10 text-[#E1E0CC] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                  : "text-[#E1E0CC]/50 hover:text-[#E1E0CC]/90 hover:bg-[#E1E0CC]/5"
                }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#E1E0CC]/60 hover:text-[#E1E0CC] hover:bg-[#E1E0CC]/10/50 rounded-xl transition-all text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Right Dashboard Area */}
        <main className="flex-1 space-y-6">

          {/* SaaS Utility Top Bar: Global Search & Notifications */}
          <div className="flex items-center justify-between gap-4 bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgb(0,0,0,0.01)] relative">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 max-w-sm bg-black border border-[#E1E0CC]/10 rounded-xl px-3 py-1.5 text-xs text-[#E1E0CC]/50">
              <Search className="w-3.5 h-3.5 text-[#E1E0CC]/50 shrink-0" />
              <input
                type="text"
                placeholder="Search campaigns, assets, strategies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[#E1E0CC] placeholder-gray-400 w-full font-medium"
              />
            </div>

            {/* Notification Bell + Profile Info */}
            <div className="flex items-center gap-4 relative">
              {/* Toast notifier absolute helper */}
              {toast && (
                <div 
                  className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border animate-fade-left text-xs font-semibold
                    ${toast.type === "success" 
                      ? "bg-[#E1E0CC]/10 text-[#E1E0CC] border-[#E1E0CC]/20" 
                      : toast.type === "error"
                      ? "bg-[#E1E0CC]/10 text-[#E1E0CC] border-[#E1E0CC]/20"
                      : "bg-[#E1E0CC]/10 text-[#E1E0CC] border-[#E1E0CC]/20"
                    }`}
                >
                  {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{toast.message}</span>
                  <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-black hover:bg-[#E1E0CC]/10 rounded-xl border border-[#E1E0CC]/10 transition-all text-[#E1E0CC]/60 hover:text-[#E1E0CC] relative cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#0A0A0A] border border-[#E1E0CC]/10 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#E1E0CC]/10">
                      <h4 className="text-xs font-black text-[#E1E0CC] uppercase tracking-wider">Notifications</h4>
                      <button onClick={() => setShowNotifications(false)} className="text-[#E1E0CC]/50 hover:text-[#E1E0CC]/80 text-xs">Close</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <p className="text-[10px] text-[#E1E0CC]/50 text-center py-4 font-mono">No new notifications.</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="pt-2 text-xs text-[#E1E0CC]/70">
                            <h5 className="font-bold text-[#E1E0CC]">{n.title}</h5>
                            <p className="text-[10px] text-[#E1E0CC]/60 mt-0.5">{n.message}</p>
                            <span className="text-[8px] text-[#E1E0CC]/50 block mt-1">{new Date(n.created_at).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Card */}
              <div className="flex items-center gap-2 pl-3 border-l border-[#E1E0CC]/10">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-[#E1E0CC]/15" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#101010] flex items-center justify-center text-white font-bold text-xs uppercase">
                    {userName?.charAt(0) || "U"}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-bold text-[#E1E0CC]/80 max-w-[80px] truncate">{userName}</span>
              </div>
            </div>
          </div>

          {/* Empty State / Onboarding requirement checker */}
          {!dna && activeTab !== "settings" ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="max-w-md w-full bg-[#0A0A0A] border border-[#E1E0CC]/15 rounded-3xl p-8 text-center shadow-[0_4px_20px_rgb(0,0,0,0.01)] space-y-5 animate-fade-up">
                <div className="w-12 h-12 rounded-full bg-[#E1E0CC]/10 flex items-center justify-center text-[#E1E0CC] mx-auto">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#E1E0CC] uppercase tracking-wider">Workspace DNA Required</h3>
                  <p className="text-xs text-[#E1E0CC]/50 leading-relaxed">
                    This workspace does not have a Brand DNA profile configured yet. Run the brand builder to generate marketing roadmap, strategies, logos and design assets.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/onboarding")}
                  className="w-full flex items-center justify-center gap-1.5 py-4 rounded-full bg-[#0A0A0A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-none shadow-black/5"
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
                <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <WordsPullUp 
                      text={`${dna?.brand_name || 'Brand'} Brand Dashboard`}
                      className="text-lg font-bold text-[#E1E0CC] tracking-tight"
                    />
                    <div className="flex flex-wrap gap-2 text-[10px] text-[#E1E0CC]/50">
                      <span><strong>Category:</strong> {dna?.category}</span>
                      {dna?.sub_category && (
                        <>
                          <span>•</span>
                          <span><strong>Sub-category:</strong> {dna?.sub_category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E1E0CC]/10 border border-[#E1E0CC]/20 text-[#E1E0CC] text-xs font-semibold tracking-tight shrink-0 self-start sm:self-center">
                    <ShieldCheck className="w-4 h-4" />
                    Memory Synced
                  </div>
                </div>
              )}

          {/* Tab 1: Mission Control (Visual Style Tile Moodboard) */}
          {activeTab === "control" && (
            <div className="bg-[#0A0A0A] text-[#E1E0CC] rounded-3xl p-6 md:p-8 border border-[#E1E0CC]/10 shadow-xl relative overflow-hidden font-normal space-y-6">
              
              {/* Top Header Section */}
              <div className="border-b border-[#E1E0CC]/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#101010] text-[#E1E0CC]">
                      Brand Board Direction
                    </span>
                    {moodboard?.id && (
                      <span className="text-[10px] text-[#E1E0CC]/70">Preset ID: {moodboard.id}</span>
                    )}
                  </div>
                  <WordsPullUp 
                    text={dna?.brand_name || 'Brand'}
                    className="text-xl font-extrabold mt-1 text-[#E1E0CC] uppercase tracking-tight"
                  />
                  <p className="text-xs text-[#E1E0CC]/70 font-medium">
                    {moodboard?.name || "Bespoke Brand Strategy Board"} {moodboard?.tagline ? `— ${moodboard.tagline}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#E1E0CC]/70 shrink-0">
                  <span><strong>Industry:</strong> {dna?.industry}</span>
                  <span>•</span>
                  <span><strong>Category:</strong> {dna?.category}</span>
                </div>
              </div>

              {/* ── BRAND BOARD CANVAS GRID ── */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                {/* ── ROW 1 ── */}

                {/* BLOCK A: Logo + Brand Identity (4 cols) */}
                <div className="md:col-span-4 bg-[#101010]/50 border border-[#E1E0CC]/10 rounded-2xl p-5 flex flex-col gap-4 shadow-none">
                  <p className="text-[9px] font-black text-[#E1E0CC]/70 uppercase tracking-[0.2em]">Brand Identity</p>

                  {/* Logo circle — large and filled */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 border-[#E1E0CC]/10 shadow-none bg-[#0A0A0A]"
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
                            {(dna?.brand_name || "B").charAt(0).toUpperCase()}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-center">
                      <p className="text-[#E1E0CC] font-bold text-base tracking-tight">{dna?.brand_name}</p>
                      <p className="text-[#E1E0CC]/70 text-[10px] mt-0.5 italic max-w-[160px] text-center leading-snug">
                        {dna?.usp ? `"${dna?.usp}"` : "No tagline set"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#E1E0CC]/10 pt-3 space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-[#E1E0CC]/70 uppercase tracking-wider">Industry</span>
                      <span className="text-[#E1E0CC] font-bold">{dna?.industry}</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-[#E1E0CC]/70 uppercase tracking-wider">Personality</span>
                      <span className="text-[#E1E0CC] font-bold capitalize">
                        {dna?.brand_personality}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BLOCK B: Color Palette (5 cols) */}
                <div className="md:col-span-5 bg-[#101010]/50 border border-[#E1E0CC]/10 rounded-2xl p-5 flex flex-col gap-3 shadow-none">
                  <p className="text-[9px] font-black text-[#E1E0CC]/70 uppercase tracking-[0.2em]">Color Palette</p>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    {/* Primary */}
                    <div className="space-y-2">
                      <div
                        className="h-20 w-full rounded-xl border border-[#E1E0CC]/10 shadow-inner"
                        style={{ backgroundColor: colors.primaryHex || "#1A0A00" }}
                      />
                      <div>
                        <p className="text-[9px] font-bold text-slate-885 uppercase tracking-wider">Primary</p>
                        <p className="text-[8px] text-[#E1E0CC]/70 font-mono mt-0.5">{colors.primaryHex || "#1A0A00"}</p>
                      </div>
                    </div>
                    {/* Accent */}
                    <div className="space-y-2">
                      <div
                        className="h-20 w-full rounded-xl border border-[#E1E0CC]/10 shadow-inner"
                        style={{ backgroundColor: colors.secondaryHex || "#C9A84C" }}
                      />
                      <div>
                        <p className="text-[9px] font-bold text-slate-885 uppercase tracking-wider">Accent</p>
                        <p className="text-[8px] text-[#E1E0CC]/70 font-mono mt-0.5">{colors.secondaryHex || "#C9A84C"}</p>
                      </div>
                    </div>
                    {/* Dark neutral */}
                    <div className="space-y-2">
                      <div className="h-14 w-full rounded-xl border border-[#E1E0CC]/10 bg-[#101010]" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-885 uppercase tracking-wider">Background</p>
                        <p className="text-[8px] text-[#E1E0CC]/70 font-mono mt-0.5">#0F172A</p>
                      </div>
                    </div>
                    {/* White/light */}
                    <div className="space-y-2">
                      <div className="h-14 w-full rounded-xl border border-[#E1E0CC]/10 bg-[#101010]" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-885 uppercase tracking-wider">Highlight</p>
                        <p className="text-[8px] text-[#E1E0CC]/70 font-mono mt-0.5">#F8FAFC</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOCK C: Typography (3 cols) */}
                <div className="md:col-span-3 bg-[#101010]/50 border border-[#E1E0CC]/10 rounded-2xl p-5 flex flex-col gap-3 shadow-none">
                  <p className="text-[9px] font-black text-[#E1E0CC]/70 uppercase tracking-[0.2em]">Typography System</p>
                  <div className="space-y-4 flex-1">
                    <div>
                      <span className="text-[8px] text-[#E1E0CC]/70 block mb-1 uppercase tracking-wider">Headline</span>
                      <span className="text-lg font-bold text-[#E1E0CC] block tracking-tight" style={{ fontFamily: typography.primaryFont }}>
                        {typography.primaryFont}
                      </span>
                      <span className="text-[9px] text-[#E1E0CC]/70 font-mono block mt-1">AaBbCc 123</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-[#E1E0CC]/70 block mb-1 uppercase tracking-wider">Body</span>
                      <span className="text-sm text-[#E1E0CC] block" style={{ fontFamily: typography.bodyFont }}>
                        {typography.bodyFont}
                      </span>
                      <span className="text-[9px] text-[#E1E0CC]/70 font-mono block mt-1">aAbBcC 456</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-[#E1E0CC]/70 border-t border-[#E1E0CC]/10 pt-2 leading-relaxed font-mono">
                    {typography.usage}
                  </p>
                </div>

                {/* ── ROW 2 ── */}

                {/* BLOCK D: Brand Mood & Tone — TEXT ONLY (5 cols) */}
                <div className="md:col-span-5 bg-[#101010]/50 border border-[#E1E0CC]/10 rounded-2xl p-5 flex flex-col gap-4 shadow-none">
                  <p className="text-[9px] font-black text-[#E1E0CC]/70 uppercase tracking-[0.2em]">Brand Mood & Tone</p>

                  {/* Personality tags */}
                  <div className="flex flex-wrap gap-2">
                    {(dna?.brand_values || []).map((v) => (
                      <span
                        key={v}
                        className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border bg-black text-[#0A0A0A] border-[#E1E0CC]/15"
                      >
                        {v}
                      </span>
                    ))}
                  </div>

                  {/* Tone descriptors */}
                  <div className="space-y-2 flex-1">
                    <p className="text-[8px] text-[#E1E0CC]/70 uppercase tracking-wider">Voice Attributes</p>
                    <div className="space-y-1.5">
                      {[
                        { label: "Tone", value: dna?.brand_personality || "Professional" },
                        { label: "Audience", value: dna?.target_audience || "Not defined" },
                        { label: "Mission", value: dna?.mission || "Not defined" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-2 text-[9px]">
                          <span className="text-[#E1E0CC]/70 uppercase tracking-wider w-14 shrink-0">{label}</span>
                          <span className="text-[#E1E0CC]/70 leading-snug line-clamp-2">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Separator words */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E1E0CC]/10 text-[8px] font-black text-[#E1E0CC]/70 uppercase tracking-widest">
                    <span>Luxurious</span>
                    <span>•</span>
                    <span>Timeless</span>
                    <span>•</span>
                    <span>Exclusive</span>
                  </div>
                </div>

                {/* BLOCK E: Social Post Visual Direction — approved moodboard (7 cols) */}
                <div className="md:col-span-7 bg-[#101010]/50 border border-[#E1E0CC]/10 rounded-2xl overflow-hidden flex flex-col shadow-none">
                  <div className="px-5 pt-5 pb-3">
                    <p className="text-[9px] font-black text-[#E1E0CC]/70 uppercase tracking-[0.2em]">Social Post Visual Direction</p>
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
                        <p className="text-[#E1E0CC]/70 text-xs font-semibold">No moodboard approved yet.</p>
                        <p className="text-[#E1E0CC]/70 text-[10px] mt-1 leading-snug">Generate and approve a direction in the onboarding visual direction step.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── ROW 3 — Full width: Visual Brain Summary ── */}
                <div className="md:col-span-12 bg-[#101010]/80 border border-[#E1E0CC]/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-5 shadow-none">
                  <div className="space-y-2 flex-1">
                    <p className="text-[9px] font-black text-[#E1E0CC]/70 uppercase tracking-[0.2em]">Visual Brand Summary</p>
                    <p className="text-xs text-[#E1E0CC]/70 leading-relaxed font-medium">
                      {dna?.business_description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 md:shrink-0">
                    <div className="w-8 h-8 rounded-full border border-[#E1E0CC]/10" style={{ backgroundColor: colors.primaryHex || "#1A0A00" }} />
                    <div className="w-8 h-8 rounded-full border border-[#E1E0CC]/10" style={{ backgroundColor: colors.secondaryHex || "#C9A84C" }} />
                    <div className="w-8 h-8 rounded-full border border-[#E1E0CC]/10 bg-[#101010]" />
                    <div className="w-8 h-8 rounded-full border border-[#E1E0CC]/10 bg-[#101010]" />
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
                <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <h3 className="text-xs font-bold text-[#E1E0CC]/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-brand-secondary" />
                    Company Definition
                  </h3>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex flex-col gap-1 border-b border-[#E1E0CC]/10 pb-2">
                      <span className="text-[#E1E0CC]/50 font-medium">Business Description</span>
                      <p className="text-[#E1E0CC]/80 leading-relaxed">{dna?.business_description}</p>
                    </div>
                    {dna?.website && (
                      <div className="flex justify-between border-b border-[#E1E0CC]/10 pb-2">
                        <span className="text-[#E1E0CC]/50">Website</span>
                        <a href={dna?.website} target="_blank" rel="noreferrer" className="text-brand-secondary hover:underline font-semibold">{dna?.website}</a>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#E1E0CC]/50">USP (Unique Value)</span>
                      <span className="font-semibold text-[#E1E0CC] text-right max-w-[200px]">{dna?.usp}</span>
                    </div>
                  </div>
                </div>

                {/* Box 2: Mission, Vision & Personality */}
                <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <h3 className="text-xs font-bold text-[#E1E0CC]/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-brand-secondary" />
                    Brand Identity DNA
                  </h3>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex flex-col gap-1 border-b border-[#E1E0CC]/10 pb-2">
                      <span className="text-[#E1E0CC]/50 font-medium">Mission</span>
                      <p className="text-[#E1E0CC]/80 font-medium">{dna?.mission}</p>
                    </div>
                    {dna?.vision && (
                      <div className="flex flex-col gap-1 border-b border-[#E1E0CC]/10 pb-2">
                        <span className="text-[#E1E0CC]/50 font-medium">Vision</span>
                        <p className="text-[#E1E0CC]/80">{dna?.vision}</p>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-[#E1E0CC]/10 pb-2">
                      <span className="text-[#E1E0CC]/50">Brand Personality</span>
                      <span className="font-semibold text-[#E1E0CC] capitalize">{dna?.brand_personality}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[#E1E0CC]/50">Core Brand Values</span>
                      <div className="flex flex-wrap gap-1">
                        {(dna?.brand_values || []).map((v) => (
                          <span key={v} className="px-2 py-1 rounded bg-black border border-[#E1E0CC]/15 text-[10px] text-[#E1E0CC]/70 font-semibold">{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 3: Offerings & Pricing */}
                <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <h3 className="text-xs font-bold text-[#E1E0CC]/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-brand-secondary" />
                    Offerings & Commercials
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    {dna?.products && dna?.products.length > 0 && (
                      <div className="flex flex-col gap-1.5 border-b border-[#E1E0CC]/10 pb-2">
                        <span className="text-[#E1E0CC]/50">Products</span>
                        <div className="flex flex-wrap gap-1">
                          {dna?.products.map(p => (
                            <span key={p} className="px-2 py-1 rounded bg-[#E1E0CC]/10/50 border border-[#E1E0CC]/20 text-[10px] text-[#E1E0CC] font-semibold">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {dna?.services && dna?.services.length > 0 && (
                      <div className="flex flex-col gap-1.5 border-b border-[#E1E0CC]/10 pb-2">
                        <span className="text-[#E1E0CC]/50">Services</span>
                        <div className="flex flex-wrap gap-1">
                          {dna?.services.map(s => (
                            <span key={s} className="px-2 py-1 rounded bg-[#E1E0CC]/10/50 border border-[#E1E0CC]/20 text-[10px] text-[#E1E0CC] font-semibold">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#E1E0CC]/50">Pricing Strategy</span>
                      <span className="font-semibold text-[#E1E0CC]">{dna?.pricing}</span>
                    </div>
                  </div>
                </div>

                {/* Box 4: Target Audience Profile */}
                <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <h3 className="text-xs font-bold text-[#E1E0CC]/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-secondary" />
                    Target Audience & Market
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex flex-col gap-1 border-b border-[#E1E0CC]/10 pb-2">
                      <span className="text-[#E1E0CC]/50 font-medium">Target Demographics</span>
                      <p className="text-[#E1E0CC]/80">{dna?.target_audience}</p>
                    </div>
                    {dna?.customer_personas && (
                      <div className="flex flex-col gap-1 border-b border-[#E1E0CC]/10 pb-2">
                        <span className="text-[#E1E0CC]/50 font-medium">Customer Persona</span>
                        <p className="text-[#E1E0CC]/70 italic leading-relaxed">{dna?.customer_personas}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[#E1E0CC]/50 block mb-1">Country Focus</span>
                        <span className="font-semibold text-[#E1E0CC]">{dna?.country}</span>
                      </div>
                      <div>
                        <span className="text-[#E1E0CC]/50 block mb-1">Languages</span>
                        <span className="font-semibold text-[#E1E0CC]">{(dna?.languages || []).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Box 5: Brand Assets & Media Locker */}
              {assets && (
                <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-6 space-y-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <h3 className="text-xs font-bold text-[#E1E0CC]/50 uppercase tracking-widest flex items-center gap-1.5 border-b border-[#E1E0CC]/10 pb-3">
                    <Image className="w-4 h-4 text-brand-secondary" />
                    Brand Assets & Media Locker
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    
                    {/* Logo & Guideline Column */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[#E1E0CC]/50 block mb-1.5 font-semibold">Active Logo Graphic</span>
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
                              ? dna?.brand_name.toUpperCase() 
                              : dna?.brand_name;
                            return (
                              <div className="w-32 h-32 bg-[#0A0A0A] border border-[#E1E0CC]/15 rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner bg-gradient-to-b from-white to-gray-50/30">
                                <div className="flex-1 flex items-center justify-center w-full">
                                  <img src={assets.logo_url} alt="Symbol Mark" className="max-h-[55%] max-w-[55%] object-contain" />
                                </div>
                                <div className="pt-1 text-center">
                                  <span 
                                    className={`text-[#E1E0CC] ${activeFontStyle}`}
                                    style={{ fontFamily: activeFontName }}
                                  >
                                    {displayActiveBrandName}
                                  </span>
                                </div>
                              </div>
                            );
                          })()
                        ) : assets.logo_studio_data?.assets?.primaryLogoSvg ? (
                          <div className="w-24 h-24 bg-black rounded-xl flex items-center justify-center p-2 shadow-none" dangerouslySetInnerHTML={{ __html: assets.logo_studio_data.assets.primaryLogoSvg }} />
                        ) : (
                          <span className="text-[#E1E0CC]/50 italic text-[10px]">No logo uploaded or generated</span>
                        )}
                      </div>
                    </div>

                    {/* Media Gallery & Resources Columns */}
                    <div className="md:col-span-2 space-y-4">
                      {/* Row 1: Images Gallery */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Product Photos */}
                        <div className="space-y-1.5">
                          <span className="text-[#E1E0CC]/50 block font-semibold">Product Images ({assets.product_images?.length || 0})</span>
                          {assets.product_images && assets.product_images.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.product_images.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-[#E1E0CC]/10 overflow-hidden bg-black block hover:opacity-80">
                                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#E1E0CC]/50 italic text-[9px] block">No product images</span>
                          )}
                        </div>

                        {/* Team Photos */}
                        <div className="space-y-1.5">
                          <span className="text-[#E1E0CC]/50 block font-semibold">Team Photos ({assets.team_photos?.length || 0})</span>
                          {assets.team_photos && assets.team_photos.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.team_photos.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-[#E1E0CC]/10 overflow-hidden bg-black block hover:opacity-80">
                                  <img src={img} alt="Team" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#E1E0CC]/50 italic text-[9px] block">No team photos</span>
                          )}
                        </div>

                        {/* Office Workspace */}
                        <div className="space-y-1.5">
                          <span className="text-[#E1E0CC]/50 block font-semibold">Office Images ({assets.office_images?.length || 0})</span>
                          {assets.office_images && assets.office_images.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.office_images.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-[#E1E0CC]/10 overflow-hidden bg-black block hover:opacity-80">
                                  <img src={img} alt="Office" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#E1E0CC]/50 italic text-[9px] block">No office images</span>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Videos, Fonts & Icons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#E1E0CC]/10 pt-3">
                        {/* Brand Videos */}
                        <div className="space-y-1.5">
                          <span className="text-[#E1E0CC]/50 block font-semibold">Brand Videos ({assets.brand_videos?.length || 0})</span>
                          {assets.brand_videos && assets.brand_videos.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.brand_videos.map((vid, i) => (
                                <a key={i} href={vid} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white/50 hover:bg-[#E1E0CC]">
                                  <Video className="w-4 h-4" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#E1E0CC]/50 italic text-[9px] block">No videos uploaded</span>
                          )}
                        </div>

                        {/* Custom Fonts */}
                        <div className="space-y-1.5">
                          <span className="text-[#E1E0CC]/50 block font-semibold">Brand Fonts ({assets.fonts?.length || 0})</span>
                          {assets.fonts && assets.fonts.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.fonts.map((f, i) => (
                                <a key={i} href={f} target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-black border border-[#E1E0CC]/15 text-[8px] font-mono font-bold text-[#E1E0CC]/80 hover:bg-[#E1E0CC]/10">
                                  FONT {i + 1}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#E1E0CC]/50 italic text-[9px] block">No fonts uploaded</span>
                          )}
                        </div>

                        {/* Custom Icons */}
                        <div className="space-y-1.5">
                          <span className="text-[#E1E0CC]/50 block font-semibold">Brand Icons ({assets.icons?.length || 0})</span>
                          {assets.icons && assets.icons.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assets.icons.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-[#E1E0CC]/10 overflow-hidden bg-black block hover:opacity-80">
                                  <img src={img} alt="Icon" className="w-full h-full object-contain p-1" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#E1E0CC]/50 italic text-[9px] block">No icons uploaded</span>
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
                        ? dna?.brand_name.toUpperCase() 
                        : dna?.brand_name;

                      return (
                        <div className="border-t border-[#E1E0CC]/10 pt-5 mt-5">
                          <style dangerouslySetInnerHTML={{ __html: getFontImport(typography.primaryFont) }} />
                          <span className="text-[#E1E0CC]/50 block mb-3 font-bold uppercase tracking-wider text-[10px]">
                            Dynamic Logo Variations Suite (12+ Custom Layouts & Formats)
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {/* 1. Primary Full Color */}
                            <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-[#0A0A0A] rounded-lg border border-[#E1E0CC]/10">
                                <img src={logoSource} alt="Primary" className="max-w-full max-h-full object-contain" />
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/60 mt-2 block">Primary Full Color</span>
                            </div>

                            {/* 2. Solid Black Silhouette */}
                            <div className="bg-[#0A0A0A] border border-[#E1E0CC]/10 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-[#0A0A0A] rounded-lg">
                                <img src={logoSource} alt="Solid Black" className="max-w-full max-h-full object-contain" style={{ filter: "grayscale(1) contrast(1000%)" }} />
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/60 mt-2 block">Black Version</span>
                            </div>

                            {/* 3. Solid White (Inverted) */}
                            <div className="bg-black border border-[#E1E0CC]/50 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-black rounded-lg">
                                <img src={logoSource} alt="Solid White" className="max-w-full max-h-full object-contain" style={{ filter: "grayscale(1) contrast(1000%) invert(1)" }} />
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/50 mt-2 block">White Inverted</span>
                            </div>

                            {/* 4. Grayscale */}
                            <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-[#0A0A0A] rounded-lg border border-[#E1E0CC]/10">
                                <img src={logoSource} alt="Grayscale" className="max-w-full max-h-full object-contain" style={{ filter: "grayscale(1)" }} />
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/60 mt-2 block">Grayscale</span>
                            </div>

                            {/* 5. Watermark */}
                            <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-[#0A0A0A] rounded-lg border border-[#E1E0CC]/10 relative">
                                <img src={logoSource} alt="Watermark" className="max-w-full max-h-full object-contain opacity-20" />
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/60 mt-2 block">Watermark (20% Op)</span>
                            </div>

                            {/* 6. Favicon / Icon Version */}
                            <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex items-center justify-center">
                                <div className="w-7 h-7 rounded-lg bg-[#E1E0CC] border border-white/10 flex items-center justify-center p-0.5 overflow-hidden shadow-none">
                                  <img src={logoSource} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                </div>
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/60 mt-2 block">Favicon / App Icon</span>
                            </div>

                            {/* 7. Wordmark / Typographic */}
                            <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex items-center justify-center">
                                <span 
                                  className={`text-[10px] text-[#E1E0CC] text-center font-bold ${getFontStyle(typography.primaryFont)}`}
                                  style={{ fontFamily: typography.primaryFont }}
                                >
                                  {displayBrandName}
                                </span>
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/60 mt-2 block">Wordmark / Text</span>
                            </div>

                            {/* 8. Horizontal Layout */}
                            <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none col-span-2 sm:col-span-1">
                              <div className="w-full h-14 flex items-center justify-center gap-1.5 px-1 bg-[#0A0A0A] rounded-lg border border-[#E1E0CC]/10">
                                <img src={logoSource} alt="Icon" className="w-4 h-4 object-contain" style={{ filter: "grayscale(1) contrast(1000%)" }} />
                                <span 
                                  className="text-[8px] font-bold text-[#E1E0CC] uppercase truncate max-w-[50px]"
                                  style={{ fontFamily: typography.primaryFont }}
                                >
                                  {displayBrandName}
                                </span>
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/60 mt-2 block">Horizontal Layout</span>
                            </div>

                            {/* 9. Stacked / Vertical Layout */}
                            <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex flex-col items-center justify-center gap-0.5 bg-[#0A0A0A] rounded-lg border border-[#E1E0CC]/10">
                                <img src={logoSource} alt="Icon" className="w-4 h-4 object-contain" style={{ filter: "grayscale(1) contrast(1000%)" }} />
                                <span 
                                  className="text-[7px] font-bold text-[#E1E0CC] max-w-[45px] truncate text-center uppercase"
                                  style={{ fontFamily: typography.primaryFont }}
                                >
                                  {displayBrandName}
                                </span>
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/60 mt-2 block">Vertical Stacked</span>
                            </div>

                            {/* 10. Vintage Style */}
                            <div className="bg-[#FAF6EE] border border-[#EBE3D5] rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-[#FAF6EE] rounded-lg">
                                <img src={logoSource} alt="Vintage" className="max-w-full max-h-full object-contain" style={{ filter: "sepia(0.8) contrast(1.2)" }} />
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC] mt-2 block">Vintage / Retro</span>
                            </div>

                            {/* 11. Minimalist Style */}
                            <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex items-center justify-center p-1 bg-[#0A0A0A] rounded-lg border border-[#E1E0CC]/10">
                                <img src={logoSource} alt="Minimalist" className="max-w-full max-h-full object-contain" style={{ filter: "contrast(1.5) brightness(1.05)" }} />
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/60 mt-2 block">Minimalist</span>
                            </div>

                            {/* 12. Emblem / Badge Layout */}
                            <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-none">
                              <div className="w-14 h-14 flex items-center justify-center">
                                <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#E1E0CC]/10 flex items-center justify-center p-1 overflow-hidden">
                                  <img src={logoSource} alt="Emblem" className="max-w-full max-h-full object-contain" />
                                </div>
                              </div>
                              <span className="text-[8px] font-bold text-[#E1E0CC]/60 mt-2 block">Emblem Badge</span>
                            </div>

                          </div>
                        </div>
                      );
                    })()
                  ) || null}

                  {/* If generated via AI Logo Studio, show colors & typographies specifications */}
                  {assets.logo_studio_data?.colors && (
                    <div className="border-t border-[#E1E0CC]/10 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] text-[#E1E0CC]/50 font-mono">
                      <div>
                        <span className="text-[9px] text-[#E1E0CC]/50 block font-normal">PRIMARY HEX</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#E1E0CC]">
                          <span className="w-3 h-3 rounded border border-[#E1E0CC]/15" style={{ backgroundColor: assets.logo_studio_data.colors.primaryHex }} />
                          {assets.logo_studio_data.colors.primaryHex}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#E1E0CC]/50 block font-normal">SECONDARY HEX</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#E1E0CC]">
                          <span className="w-3 h-3 rounded border border-[#E1E0CC]/15" style={{ backgroundColor: assets.logo_studio_data.colors.secondaryHex }} />
                          {assets.logo_studio_data.colors.secondaryHex}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#E1E0CC]/50 block font-normal">CMYK</span>
                        <div className="font-bold text-[#E1E0CC]/80">{assets.logo_studio_data.colors.primaryCmyk}</div>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#E1E0CC]/50 block font-normal">PANTONE APPROX</span>
                        <div className="font-bold text-[#E1E0CC]/80">{assets.logo_studio_data.colors.pantoneApprox}</div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* Tab 3: Content Planner & Automation Engine */}
          {activeTab === "campaigns" && (
            <div className="space-y-8 animate-fade-up">
              
              {/* MAIN USP HERO: AUTOMATE YOUR BRAND */}
              <div className="relative overflow-hidden rounded-2xl bg-[#101010] border border-[#E1E0CC]/15 p-6 sm:p-8 shadow-none text-white">
                <div className="relative z-10 space-y-6">
                  {/* Top USP Banner Title */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E0CC]/50 pb-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1E0CC]/10 border border-[#E1E0CC]/20 text-[#E1E0CC] text-[10px] font-mono font-bold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-brand-secondary" />
                        CORE USP • BRAND AUTOMATION ENGINE
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        Automate Your Brand
                        <span className={`text-[11px] font-bold tracking-wide px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          isAutopilotActive 
                            ? "bg-[#E1E0CC]/15 text-[#E1E0CC]" 
                            : "bg-black/50 text-[#E1E0CC]/50"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAutopilotActive ? "bg-[#E1E0CC]/10 animate-pulse" : "bg-gray-400"}`} />
                          {isAutopilotActive ? "AUTO-PILOT ACTIVE" : "AUTO-PILOT PAUSED"}
                        </span>
                      </h2>
                      <p className="text-xs text-[#E1E0CC]/50 leading-relaxed">
                        Connect your social channels once. Our autonomous AI engine plans, generates, designs, and auto-posts 30 days of brand strategy directly to your target channels.
                      </p>
                    </div>

                    {/* Auto-Pilot Toggle Button */}
                    <button
                      onClick={() => setIsAutopilotActive(!isAutopilotActive)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                        isAutopilotActive 
                          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
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
                      <span className="text-[10px] font-mono font-bold uppercase text-[#E1E0CC]/50 tracking-wider">
                        Connected Publishing Target (Instagram Active)
                      </span>
                      <button
                        onClick={() => setIsInstagramModalOpen(true)}
                        className="text-[10px] font-mono font-bold text-[#E1E0CC] hover:underline cursor-pointer"
                      >
                        + Configure Instagram Connection
                      </button>
                    </div>
                    
                    <div className="bg-black/50 border border-[#E1E0CC]/15 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-white tracking-wider">Instagram Business</span>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#E1E0CC]/10/10 text-[#E1E0CC]/70 border border-[#E1E0CC]/20/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E1E0CC]/10 animate-pulse" />
                            PRIMARY & EXCLUSIVE PLATFORM
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#E1E0CC]">
                          Connected Account: <span className="text-white font-bold">{instagramHandle}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <span className="text-xs font-bold text-white block">
                            {calendar.length} Posts Planned
                          </span>
                          <span className="text-[9px] text-[#E1E0CC]/50">
                            {calendar.filter(i => i.status === "completed").length} Completed • {calendar.filter(i => i.status === "scheduled" || !i.status).length} Auto-Scheduled
                          </span>
                        </div>
                        <button
                          onClick={() => setIsInstagramModalOpen(true)}
                          className="px-3.5 py-2 bg-[#E1E0CC] hover:bg-white text-[#101010] font-mono text-[10px] font-bold uppercase rounded-lg border border-[#E1E0CC]/40 transition-all cursor-pointer"
                        >
                          Settings
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Engine Rules & Schedule */}
                  <div className="bg-gray-850 border border-[#E1E0CC]/50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#E1E0CC]/90 rounded-lg text-[#E1E0CC]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#E1E0CC]/50 uppercase font-mono font-bold tracking-wider block">Posting Schedule</span>
                        <span className="font-semibold text-white text-xs">1 Post / Day (09:30 AM EST)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#E1E0CC]/90 rounded-lg text-[#E1E0CC]">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#E1E0CC]/50 uppercase font-mono font-bold tracking-wider block">Target Timezone</span>
                        <span className="font-semibold text-white text-xs">US / Eastern (EST Peak Window)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#E1E0CC]/90 rounded-lg text-[#E1E0CC]">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#E1E0CC]/50 uppercase font-mono font-bold tracking-wider block">Publishing Mode</span>
                        <span className="font-semibold text-white text-xs">Smart Review & AI Publishing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 30-DAY CONTENT PLANNER GRID */}
              <div className="space-y-4">
                
                {/* Header & Controls */}
                <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-2 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-[#E1E0CC]/80" />
                      30-Day Content Timeline
                    </h3>
                    <p className="text-[11px] text-[#E1E0CC]/50 mt-0.5">
                      Detailed post blueprints, concept briefs, prompts, and direct AI studio generators.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Format Filter */}
                    <div className="flex items-center bg-[#E1E0CC]/10 p-1 rounded-xl text-[10px] font-bold">
                      {["all", "carousel", "static"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setCalendarFilterType(type)}
                          className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                            calendarFilterType === type ? "bg-[#0A0A0A] text-[#E1E0CC] shadow-none" : "text-[#E1E0CC]/60 hover:text-[#E1E0CC]"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsCampaignModalOpen(true)}
                      className="px-4 py-2 bg-[#101010] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-darkHover transition-all flex items-center gap-1.5 shadow-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Plan New Campaign
                    </button>
                  </div>
                </div>

                {/* Content Cards Grid */}
                <div className="space-y-4">
                  {calendar.length === 0 ? (
                    <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-12 text-center space-y-3">
                      <Loader2 className="w-6 h-6 text-[#E1E0CC]/50 animate-spin mx-auto" />
                      <p className="text-[#E1E0CC]/50 italic text-xs font-mono">Compiling 30-day strategy timeline...</p>
                    </div>
                  ) : (
                    calendar
                      .filter((item) => {
                        if (calendarFilterType === "carousel") return item.post_type === "carousel";
                        if (calendarFilterType === "static") return item.post_type !== "carousel";
                        return true;
                      })
                      .map((item, idx) => {
                        const isCarousel = item.post_type === "carousel";
                        return (
                          <div 
                            key={item.id || idx} 
                            className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:border-[#E1E0CC]/20 transition-all space-y-4"
                          >
                            {/* Card Top Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E1E0CC]/10 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-[#E1E0CC] text-[#101010] font-mono text-[10px] font-bold rounded-md">
                                  {item.date || `DAY ${idx + 1}`}
                                </span>
                                <span className="text-[10px] font-mono text-[#E1E0CC]/50 font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#E1E0CC]/50" />
                                  09:30 AM EST (Optimal Peak Window)
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Format Badge */}
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                                  isCarousel 
                                    ? "bg-[#E1E0CC]/10 text-[#E1E0CC] border-[#E1E0CC]/20" 
                                    : "bg-[#E1E0CC]/10 text-[#E1E0CC] border-[#E1E0CC]/20"
                                }`}>
                                  {isCarousel ? "Carousel Deck (5 Slides)" : "Static Post Graphic (1:1)"}
                                </span>

                                {/* Status Badge */}
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                                  item.status === "completed" 
                                    ? "bg-[#E1E0CC]/10 text-[#E1E0CC] border-[#E1E0CC]/20" 
                                    : "bg-[#E1E0CC]/10 text-[#E1E0CC] border-[#E1E0CC]/20"
                                }`}>
                                  {item.status === "completed" ? (
                                    <>
                                      <Check className="w-3 h-3 text-[#E1E0CC]" />
                                      <span>Generated</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3 text-[#E1E0CC]" />
                                      <span>Scheduled</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Content Body */}
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h4 className="text-sm font-bold text-[#E1E0CC] leading-snug">
                                  {item.title}
                                </h4>
                                <span className="text-[10px] font-mono font-bold text-[#E1E0CC]/70 bg-[#E1E0CC]/10 px-2.5 py-1 rounded-md border border-[#E1E0CC]/15 w-fit shrink-0 flex items-center gap-1">
                                  <Target className="w-3 h-3 text-[#E1E0CC]/60" />
                                  {item.goal || item.category || 'Thought Leadership & Lead Gen'}
                                </span>
                              </div>

                              {/* Detailed Concept Brief Box */}
                              <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#E1E0CC]/50">
                                    Visual Concept & Execution Prompt
                                  </span>
                                  <span className="text-[9px] font-mono text-[#E1E0CC]/50">
                                    Brand Vibe: {dna?.brand_personality || "Luxury Minimalist"}
                                  </span>
                                </div>
                                <p className="text-xs text-[#E1E0CC]/70 leading-relaxed font-normal">
                                  {item.concept_brief || item.description || item.title}
                                </p>
                              </div>

                              {/* Publishing Channels */}
                              <div className="flex items-center gap-2 text-[10px] text-[#E1E0CC]/50 font-semibold">
                                <span>Publishing Target:</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-[#E1E0CC] text-[#101010] px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border border-[#E1E0CC]/50">
                                    Instagram ({instagramHandle})
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="border-t border-[#E1E0CC]/10 pt-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {/* Redirection Button */}
                                <button
                                  onClick={() => handleRedirectToStudio(item)}
                                  className="px-4 py-2 bg-[#101010] hover:bg-brand-darkHover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-none flex items-center gap-2 cursor-pointer"
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
                                          body: JSON.stringify({ calendarItemId: item.id })
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
                                    className="px-3.5 py-2 bg-[#E1E0CC]/10 hover:bg-[#E1E0CC]/20 text-[#E1E0CC] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer border border-[#E1E0CC]/15"
                                  >
                                    {generatingAssetId === item.id ? (
                                      <>
                                        <Loader2 className="w-3 h-3 animate-spin text-brand-primary" />
                                        <span>Quick Generating...</span>
                                      </>
                                    ) : (
                                      <span>Quick Auto-Generate</span>
                                    )}
                                  </button>
                                )}

                                {/* INSTAGRAM AUTO-POST BUTTON */}
                                <button
                                  disabled={publishingInstagramId === item.id}
                                  onClick={() => handlePublishToInstagram(item)}
                                  className="px-3.5 py-2 bg-[#E1E0CC] hover:bg-white text-[#101010] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-none flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  {publishingInstagramId === item.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span>Posting to IG...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Share2 className="w-3.5 h-3.5" />
                                      <span>Auto-Post to IG</span>
                                    </>
                                  )}
                                </button>

                                {publishedPostLink && publishedPostLink.id === item.id && (
                                  <a
                                    href={publishedPostLink.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-[#E1E0CC]/10 text-[#E1E0CC] border border-[#E1E0CC]/20 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 hover:underline"
                                  >
                                    <Check className="w-3 h-3 text-[#E1E0CC]" />
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
                                  className="px-4 py-2 bg-[#E1E0CC]/10 hover:bg-[#E1E0CC]/10 text-[#E1E0CC] font-bold text-xs uppercase tracking-wider rounded-xl border border-[#E1E0CC]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Asset</span>
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })
                  )}
                </div>

              </div>

            </div>
          )}


          {/* Tab 5: Post Generator Studio */}
          {activeTab === "studio" && (
            <div className="space-y-6 animate-fade-up">
              {/* Header */}
              <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-1.5 uppercase tracking-wider">
                    <Image className="w-4 h-4 text-[#0A0A0A]" />
                    Post Generator Studio
                  </h3>
                  <p className="text-[11px] text-[#E1E0CC]/50 mt-0.5">
                    Generate premium, brand-consistent marketing graphics using Flux Schnell.
                  </p>
                </div>
                {/* Active Brand Visual Indicator */}
                <div className="flex items-center gap-2 bg-[#0D0D0D] px-3.5 py-2 rounded-xl border border-[#E1E0CC]/50 text-[10px] text-[#E1E0CC]/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1E0CC]/10 animate-pulse" />
                  <span>Brand Guidelines Active</span>
                  <div className="flex items-center gap-1 ml-1.5 border-l border-[#E1E0CC]/50 pl-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: assets?.logo_studio_data?.colors?.primaryHex || "#0D0D0D" }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: assets?.logo_studio_data?.colors?.secondaryHex || "#C9A84C" }} />
                  </div>
                </div>
              </div>

              {/* Main Studio Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left panel: Prompt & Settings (5 Cols) */}
                <div className="lg:col-span-5 bg-[#0A0A0A] border border-[#E1E0CC]/15 rounded-2xl p-5 shadow-none space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#E1E0CC]/50 uppercase tracking-wider block">
                      Describe your post topic / idea
                    </label>
                    <textarea
                      value={postPrompt}
                      onChange={(e) => setPostPrompt(e.target.value)}
                      placeholder="e.g. A premium, minimal advertisement post showcasing a luxury watch with sleek metallic textures and dark dramatic lighting..."
                      className="w-full h-32 px-3 py-2.5 rounded-xl border border-[#E1E0CC]/15 focus:border-[#0A0A0A] text-xs bg-[#0A0A0A] text-[#E1E0CC] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Ratio Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#E1E0CC]/50 uppercase tracking-wider block">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-3 gap-2">
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
                            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5
                              ${active
                                ? "bg-[#E1E0CC] border-[#E1E0CC] text-[#101010]"
                                : "bg-[#0A0A0A] border-[#E1E0CC]/15 text-[#E1E0CC]/50 hover:bg-[#101010] hover:text-[#E1E0CC]/80"
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
                    className="w-full py-3 bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#0A0A0A]/15 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3.5 text-[10px] text-[#E1E0CC]/60 space-y-1.5">
                      <p className="font-bold text-[#E1E0CC]/80 uppercase tracking-wider">Brand DNA Context (Locked-in)</p>
                      <div className="grid grid-cols-2 gap-2 text-[9px] pt-1">
                        <div>
                          <span className="text-[#E1E0CC]/50 uppercase tracking-wider block">Personality</span>
                          <span className="font-semibold text-[#E1E0CC]/80 capitalize">{dna?.brand_personality}</span>
                        </div>
                        <div>
                          <span className="text-[#E1E0CC]/50 uppercase tracking-wider block">Industry</span>
                          <span className="font-semibold text-[#E1E0CC]/80">{dna?.industry}</span>
                        </div>
                        {dna?.approved_moodboard && (
                          <div className="col-span-2">
                            <span className="text-[#E1E0CC]/50 uppercase tracking-wider block">Visual Direction</span>
                            <span className="font-semibold text-[#E1E0CC]/80">{dna?.approved_moodboard.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {postError && (
                    <div className="p-3 bg-[#E1E0CC]/10 border border-[#E1E0CC]/20 rounded-xl text-[10px] text-[#E1E0CC] leading-normal">
                      {postError}
                    </div>
                  )}
                </div>

                {/* Right panel: Post Preview Canvas (7 Cols) */}
                <div className="lg:col-span-7 bg-[#0D0D0D] border border-[#E1E0CC]/50 rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[460px] overflow-hidden shadow-2xl">
                  {isGeneratingPost ? (
                    <div className="text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#0A0A0A] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Rendering Brand Asset...</p>
                        <p className="text-[10px] text-[#E1E0CC]/60">Injecting color swatches, visual styles, and moodboard rules.</p>
                      </div>
                    </div>
                  ) : generatedPostImage ? (
                    <div className="w-full flex flex-col gap-4">
                      {/* Social post frame */}
                      <div className="bg-[#111111] border border-[#E1E0CC]/50 rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto w-full">
                        {/* Header */}
                        <div className="p-3 flex items-center justify-between border-b border-[#E1E0CC]/10">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#0A0A0A]/10 border border-[#0A0A0A]/30 flex items-center justify-center text-xs font-black text-white">
                              {(dna?.brand_name || "B").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{dna?.brand_name || "Aethera"}</p>
                              <p className="text-[8px] text-[#E1E0CC]/60">Sponsored</p>
                            </div>
                          </div>
                          <span className="text-[#E1E0CC]/70 text-xs">•••</span>
                        </div>

                        {/* Image body */}
                        <div className={`w-full overflow-hidden bg-black flex items-center justify-center relative
                          ${postAspectRatio === '9:16' ? 'aspect-[9/16]' : postAspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-square'}
                        `}>
                          <style dangerouslySetInnerHTML={{ __html: `
                            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Syne:wght@400;750;800&family=Bricolage+Grotesque:wght@300;500;800&family=Space+Grotesk:wght@400;700&family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;700&family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');
                          `}} />
                          <div
                            dangerouslySetInnerHTML={{ __html: generatedPostImage }}
                            className="w-full h-full [&>div]:w-full [&>div]:h-full"
                          />
                        </div>

                        {/* Footer action buttons */}
                        <div className="p-3 flex items-center justify-between text-[#E1E0CC]/50 border-t border-[#E1E0CC]/10">
                          <div className="flex items-center gap-4 text-xs">
                            <span className="cursor-pointer hover:text-white">♥</span>
                            <span className="cursor-pointer hover:text-white">💬</span>
                            <span className="cursor-pointer hover:text-white">✈</span>
                          </div>
                          <span className="text-[10px] text-[#0A0A0A] font-bold">Learn More</span>
                        </div>
                      </div>

                      {/* Download / Info block */}
                      <div className="bg-black/40 border border-[#E1E0CC]/10 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-[#E1E0CC]/60 uppercase tracking-widest">Post Generation Details</span>
                          <button
                            onClick={() => {
                              const blob = new Blob([generatedPostImage], { type: 'text/html' });
                              const url = URL.createObjectURL(blob);
                              window.open(url, '_blank');
                            }}
                            className="text-[9px] font-bold bg-[#0A0A0A] text-white px-3 py-1.5 rounded-lg hover:bg-[#0A0A0A]/80 transition-all uppercase tracking-wider"
                          >
                            Open HTML Render
                          </button>
                        </div>
                        {generatedPostPrompt && (
                          <div className="space-y-1">
                            <span className="text-[8px] text-[#E1E0CC]/70 uppercase tracking-wider">Compiled AI Prompt</span>
                            <p className="text-[10px] text-[#E1E0CC]/50 leading-relaxed font-mono bg-black/60 p-2.5 rounded-lg border border-[#E1E0CC]/50 max-h-24 overflow-y-auto">
                              {generatedPostPrompt}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 max-w-sm px-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#E1E0CC] border border-[#E1E0CC]/50 flex items-center justify-center mx-auto text-[#E1E0CC]/70">
                        <Image className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Post Generation Canvas</h4>
                        <p className="text-[10px] text-[#E1E0CC]/60 mt-1.5 leading-relaxed">
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
              <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-1.5 uppercase tracking-wider">
                    <Plus className="w-4 h-4 text-[#0A0A0A]" />
                    Carousel Studio
                  </h3>
                  <p className="text-[11px] text-[#E1E0CC]/50 mt-0.5">
                    Generate visual slide decks with matching background graphics & custom HTML overlays.
                  </p>
                </div>
                {/* Visual guidelines indicator */}
                <div className="flex items-center gap-2 bg-[#0D0D0D] px-3.5 py-2 rounded-xl border border-[#E1E0CC]/50 text-[10px] text-[#E1E0CC]/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] animate-pulse" />
                  <span>Fluid Image Treatment Active</span>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Input Panel */}
                <div className="lg:col-span-5 bg-[#0A0A0A] border border-[#E1E0CC]/15 rounded-2xl p-5 shadow-none space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#E1E0CC]/50 uppercase tracking-wider block">
                      Carousel Objective / Concept
                    </label>
                    <textarea
                      value={carouselPrompt}
                      onChange={(e) => setCarouselPrompt(e.target.value)}
                      placeholder="e.g. 5 steps to curate the perfect weekend getaway. Focus on slow-living travel, nature escapes, and mental wellness..."
                      className="w-full h-32 px-3 py-2.5 rounded-xl border border-[#E1E0CC]/15 focus:border-[#0A0A0A] text-xs bg-[#0A0A0A] text-[#E1E0CC] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCarousel}
                    disabled={isGeneratingCarousel || !carouselPrompt.trim()}
                    className="w-full py-3 bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#0A0A0A]/15 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    <div className="p-3 bg-[#E1E0CC]/10 border border-[#E1E0CC]/20 rounded-xl text-[10px] text-[#E1E0CC]">
                      {carouselError}
                    </div>
                  )}

                  {/* Settings specs info */}
                  <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3.5 text-[9px] text-[#E1E0CC]/60 space-y-2">
                    <p className="font-bold text-[#E1E0CC]/80 uppercase tracking-wider">CAROUSEL MECHANICS</p>
                    <ul className="space-y-1 list-disc pl-3.5 leading-relaxed">
                      <li>Generates a unified, matching visual backdrop using FLUX.</li>
                      <li>Backdrop image is uniquely transformed on every slide (rotation shifts, scale variations, and custom vignetting).</li>
                      <li>Renders crisp, high-fidelity brand typography and logo watermarks directly in HTML layer.</li>
                    </ul>
                  </div>
                </div>

                {/* Carousel Viewer/Canvas (7 Cols) */}
                <div className="lg:col-span-7 bg-[#0D0D0D] border border-[#E1E0CC]/50 rounded-2xl p-6 flex flex-col min-h-[500px] justify-between relative shadow-2xl overflow-hidden">
                  
                  {isGeneratingCarousel ? (
                    <div className="my-auto text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#0A0A0A] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Synthesizing Slide Assets...</p>
                        <p className="text-[10px] text-[#E1E0CC]/60">Writing HTML copy, extracting logo marks, and rendering backdrop variations.</p>
                      </div>
                    </div>
                  ) : carouselSlides.length > 0 && generatedCarouselImage ? (
                    <div className="w-full flex flex-col gap-4">
                      {/* Social Carousel Post Frame */}
                      <div className="bg-[#111111] border border-[#E1E0CC]/50 rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto w-full">
                        
                        {/* Post Header */}
                        <div className="p-3 flex items-center justify-between border-b border-[#E1E0CC]/10">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#0A0A0A]/20 border border-[#0A0A0A]/40 flex items-center justify-center text-xs font-black text-white">
                              {(dna?.brand_name || "B").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{dna?.brand_name || "Aethera"}</p>
                              <p className="text-[8px] text-[#E1E0CC]/60">Carousel Post • Sponsored</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#E1E0CC]/50 bg-black/60 px-2 py-0.5 rounded border border-[#E1E0CC]/50">
                              {activeSlide + 1} / {carouselSlides.length}
                            </span>
                            <span className="text-[#E1E0CC]/70 text-xs">•••</span>
                          </div>
                        </div>

                        {/* Live slide viewport */}
                        <div className="relative aspect-[4/5] w-full bg-black overflow-hidden flex items-center justify-center">
                          <style dangerouslySetInnerHTML={{ __html: `
                            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Syne:wght@400;750;800&family=Bricolage+Grotesque:wght@300;500;800&family=Space+Grotesk:wght@400;700&family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;700&family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');
                            
                            .brand-font-heading {
                              font-family: '${assets?.logo_studio_data?.typography?.primaryFont || "inherit"}', sans-serif !important;
                            }
                            .brand-font-body {
                              font-family: '${assets?.logo_studio_data?.typography?.bodyFont || "inherit"}', sans-serif !important;
                            }
                          `}} />
                          {(() => {
                            const slide = carouselSlides[activeSlide];
                            const activeColors = assets?.logo_studio_data?.colors || {
                              primaryHex: "#0D0D0D",
                              secondaryHex: "#C9A84C"
                            };
                            if (!slide?.html) {
                              return (
                                <div className="relative h-full w-full flex flex-col justify-between p-6 z-10 select-none">
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
                                    <span className="text-[10px] font-bold text-white/95 uppercase">{dna?.brand_name || "Aethera"}</span>
                                    <span className="text-[10px] font-mono font-bold text-white/60">0{activeSlide + 1}</span>
                                  </div>

                                  <div className="relative space-y-3.5 my-auto max-w-[90%] z-10">
                                    <h2 className="text-lg md:text-xl font-extrabold text-white leading-tight">{slide?.title}</h2>
                                    <p className="text-xs text-white/80 leading-relaxed font-medium">{slide?.description}</p>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <div 
                                className="w-full h-full [&>div]:h-full [&>div]:w-full select-none"
                                dangerouslySetInnerHTML={{
                                  __html: injectBgIntoHtml(slide.html, generatedCarouselImage, 0.08, undefined, undefined, activeColors.secondaryHex, activeColors.primaryHex)
                                }}
                              />
                            );
                          })()}
                        </div>

                        {/* Footer action bar & slide dots */}
                        <div className="p-3 flex items-center justify-between text-[#E1E0CC]/50 border-t border-[#E1E0CC]/10 bg-[#0F0F0F]">
                          <div className="flex items-center gap-3 text-xs">
                            <span className="cursor-pointer hover:text-white">♥</span>
                            <span className="cursor-pointer hover:text-white">💬</span>
                            <span className="cursor-pointer hover:text-white">✈</span>
                          </div>

                          {/* Slide Indicator Dots */}
                          <div className="flex items-center gap-1.5">
                            {carouselSlides.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveSlide(i)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  activeSlide === i ? "bg-[#0A0A0A] w-3" : "bg-gray-700 hover:bg-black0 w-1.5"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Navigation buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={activeSlide === 0}
                              onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                              className="px-2 py-0.5 bg-[#E1E0CC] text-[#101010] rounded text-[10px] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-all cursor-pointer"
                            >
                              ←
                            </button>
                            <button
                              disabled={activeSlide === carouselSlides.length - 1}
                              onClick={() => setActiveSlide(prev => Math.min(carouselSlides.length - 1, prev + 1))}
                              className="px-2 py-0.5 bg-[#0A0A0A] text-white rounded text-[10px] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-all cursor-pointer"
                            >
                              →
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Clean Export Footer (Removed HTML generated tag) */}
                      <div className="bg-black/40 border border-[#E1E0CC]/10 rounded-xl p-3.5 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-white block">Slide {activeSlide + 1} of {carouselSlides.length}</span>
                          <span className="text-[9px] text-[#E1E0CC]/60 block">High-resolution vector HTML layer with brand color palette</span>
                        </div>
                        <button
                          onClick={() => {
                            const slideHtml = carouselSlides[activeSlide]?.html || "";
                            const blob = new Blob([slideHtml], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                          }}
                          className="text-[9px] font-bold bg-[#0A0A0A] text-white px-3 py-1.5 rounded-lg hover:bg-[#0A0A0A]/80 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          Open Slide Render
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center space-y-4 max-w-sm px-6 my-auto mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-[#E1E0CC] border border-[#E1E0CC]/50 flex items-center justify-center mx-auto text-[#E1E0CC]/70">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Carousel Studio Canvas</h4>
                        <p className="text-[10px] text-[#E1E0CC]/60 mt-1.5 leading-relaxed font-normal">
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
              <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-1.5 uppercase tracking-wider">
                    <Video className="w-4 h-4 text-[#0A0A0A]" />
                    Video Studio
                  </h3>
                  <p className="text-[11px] text-[#E1E0CC]/50 mt-0.5">
                    Generate cinematic social ads & video campaigns using the LongCat-Video 13.6B generation engine.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-[#0D0D0D] px-3.5 py-2 rounded-xl border border-[#E1E0CC]/50 text-[10px] text-[#E1E0CC]/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1E0CC]/10 animate-pulse" />
                  <span>Meituan LongCat Engine Active</span>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Input Panel */}
                <div className="lg:col-span-5 bg-[#0A0A0A] border border-[#E1E0CC]/15 rounded-2xl p-5 shadow-none space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#E1E0CC]/50 uppercase tracking-wider block">
                      Video Scene / Concept Description
                    </label>
                    <textarea
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="e.g. A panning cinematic shot of a luxury boutique resort room in Maharashtra with sunlight casting long shadows. A hot cup of tea steaming gently on a low wooden table..."
                      className="w-full h-32 px-3 py-2.5 rounded-xl border border-[#E1E0CC]/15 focus:border-[#0A0A0A] text-xs bg-[#0A0A0A] text-[#E1E0CC] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Duration Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#E1E0CC]/50 uppercase tracking-wider block">
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
                              ? "bg-[#0A0A0A] text-[#090D16] border-[#0A0A0A]"
                              : "bg-[#0A0A0A] text-[#E1E0CC]/70 border-[#E1E0CC]/15 hover:bg-black"
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
                    className="w-full py-3 bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#0A0A0A]/15 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    <div className="p-3 bg-[#E1E0CC]/10 border border-[#E1E0CC]/20 rounded-xl text-[10px] text-[#E1E0CC]">
                      {videoError}
                    </div>
                  )}

                  {/* Mechanics Details */}
                  <div className="bg-black border border-[#E1E0CC]/10 rounded-xl p-3.5 text-[9px] text-[#E1E0CC]/60 space-y-2">
                    <p className="font-bold text-[#E1E0CC]/80 uppercase tracking-wider">LONG CAT VIDEO SPECS</p>
                    <ul className="space-y-1 list-disc pl-3.5 leading-relaxed">
                      <li>Uses a 13.6B parameter Dense Transformer model.</li>
                      <li>Calculates smooth camera shifts & volumetric lighting matching your primary color ({assets?.logo_studio_data?.colors?.primaryHex || "#0D0D0D"}) and accent color ({assets?.logo_studio_data?.colors?.secondaryHex || "#C9A84C"}).</li>
                      <li>Ensures temporal coherence and subject appearance stability across all generated frames.</li>
                    </ul>
                  </div>
                </div>

                {/* Video Preview Canvas */}
                <div className="lg:col-span-7 bg-[#0D0D0D] border border-[#E1E0CC]/50 rounded-2xl p-6 flex flex-col min-h-[500px] justify-between relative shadow-2xl overflow-hidden">
                  
                  {isGeneratingVideo ? (
                    <div className="my-auto text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#0A0A0A] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{videoQueueStatus || "Processing Video..."}</p>
                        <p className="text-[10px] text-[#E1E0CC]/60">Compiling visual context, computing frame sequences, and generating video stream.</p>
                      </div>
                    </div>
                  ) : generatedVideoUrl ? (
                    <div className="space-y-6 w-full">
                      <span className="text-[9px] font-black text-[#0A0A0A] uppercase tracking-widest block">
                        Cinematic Feed Preview
                      </span>

                      {/* Video Player */}
                      <div className="relative aspect-video w-full max-w-lg mx-auto bg-black rounded-2xl overflow-hidden border border-[#E1E0CC]/50 shadow-2xl">
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
                      <div className="bg-black/40 border border-[#E1E0CC]/10 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-[#E1E0CC]/60 uppercase tracking-widest">Video Output Details</span>
                          <a
                            href={generatedVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold bg-[#0A0A0A] text-white px-3 py-1.5 rounded-lg hover:bg-[#0A0A0A]/80 transition-all uppercase tracking-wider"
                          >
                            Download Video
                          </a>
                        </div>
                        {generatedVideoPrompt && (
                          <div className="space-y-1">
                            <span className="text-[8px] text-[#E1E0CC]/70 uppercase tracking-wider">Compiled Video Motion Prompt</span>
                            <p className="text-[10px] text-[#E1E0CC]/50 leading-relaxed font-mono bg-black/60 p-2.5 rounded-lg border border-[#E1E0CC]/50 max-h-24 overflow-y-auto">
                              {generatedVideoPrompt}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center space-y-4 max-w-sm px-6 my-auto mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-[#E1E0CC] border border-[#E1E0CC]/50 flex items-center justify-center mx-auto text-[#E1E0CC]/70">
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Video Studio Canvas</h4>
                        <p className="text-[10px] text-[#E1E0CC]/60 mt-1.5 leading-relaxed font-normal">
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
              <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-1.5 uppercase tracking-wider">
                    <Settings className="w-4 h-4 text-brand-dark" />
                    SaaS Platform Settings
                  </h3>
                  <p className="text-[11px] text-[#E1E0CC]/50 mt-0.5">
                    Manage your personal profile, workspaces, invite team members, and check billing.
                  </p>
                </div>
              </div>

              {/* Layout: Inner tabs */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Inner Sub-Nav */}
                <button
                  onClick={() => router.push("/onboarding")}
                  className="w-full bg-[#0A0A0A] hover:bg-black text-white rounded-full py-4 text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-none shadow-black/5"
                >
                  Start Brand Onboarding
                </button>
                <div className="w-full lg:w-48 bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-3 shrink-0 h-fit space-y-1">
                  <button
                    onClick={() => setSettingsTab("profile")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                      ${settingsTab === "profile"
                        ? "bg-black border border-[#E1E0CC]/10 text-[#E1E0CC] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                        : "text-[#E1E0CC]/50 hover:text-[#E1E0CC]/90 hover:bg-[#E1E0CC]/5"
                      }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => setSettingsTab("workspace")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                      ${settingsTab === "workspace"
                        ? "bg-black border border-[#E1E0CC]/10 text-[#E1E0CC] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                        : "text-[#E1E0CC]/50 hover:text-[#E1E0CC]/90 hover:bg-[#E1E0CC]/5"
                      }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Workspaces</span>
                  </button>

                  <button
                    onClick={() => setSettingsTab("team")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                      ${settingsTab === "team"
                        ? "bg-black border border-[#E1E0CC]/10 text-[#E1E0CC] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                        : "text-[#E1E0CC]/50 hover:text-[#E1E0CC]/90 hover:bg-[#E1E0CC]/5"
                      }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Team & Members</span>
                  </button>

                  <button
                    onClick={() => setSettingsTab("billing")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left
                      ${settingsTab === "billing"
                        ? "bg-black border border-[#E1E0CC]/10 text-[#E1E0CC] shadow-[0_0_15px_rgba(225,224,204,0.03)]"
                        : "text-[#E1E0CC]/50 hover:text-[#E1E0CC]/90 hover:bg-[#E1E0CC]/5"
                      }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Billing & Quota</span>
                  </button>
                </div>

                {/* Right Sub-Tab Content */}
                <div className="flex-1 bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)] min-h-[400px]">
                  
                  {/* profile tab */}
                  {settingsTab === "profile" && (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-[#E1E0CC] mb-1">Profile Details</h4>
                        <p className="text-[11px] text-[#E1E0CC]/50">Update your email, full name, and avatar settings.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#E1E0CC]/60 uppercase tracking-wider">Email Address (Read-only)</label>
                          <input
                            type="text"
                            disabled
                            value={currentUser?.email || ""}
                            className="bg-black border border-[#E1E0CC]/15 text-[#E1E0CC]/50 outline-none rounded-xl px-3.5 py-2.5 text-xs cursor-not-allowed"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#E1E0CC]/80 uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="bg-[#0A0A0A] border border-[#E1E0CC]/15 focus:border-[#E1E0CC]/10 outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#E1E0CC] transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#E1E0CC]/80 uppercase tracking-wider">Avatar Image URL</label>
                          <input
                            type="text"
                            value={userAvatar}
                            onChange={(e) => setUserAvatar(e.target.value)}
                            className="bg-[#0A0A0A] border border-[#E1E0CC]/15 focus:border-[#E1E0CC]/10 outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#E1E0CC] transition-colors placeholder-gray-400"
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#E1E0CC]/10 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="px-4 py-2 bg-[#101010] hover:bg-brand-darkHover text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
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
                  )}

                  {/* workspace tab */}
                  {settingsTab === "workspace" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-[#E1E0CC] mb-1">Workspace Architecture</h4>
                        <p className="text-[11px] text-[#E1E0CC]/50">View your active workspaces and create new marketing project groups.</p>
                      </div>

                      {/* Active Workspaces List */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-[#E1E0CC]/80 uppercase tracking-wider">Workspaces in {dna?.brand_name || activeOrg?.name || "My Organization"}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {workspaces
                            .filter(w => w.org_id === activeOrg?.id)
                            .map((w) => (
                              <div
                                key={w.id}
                                onClick={() => setActiveWorkspace(w)}
                                className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between
                                  ${activeWorkspace?.id === w.id
                                    ? "border-[#E1E0CC]/10 bg-black shadow-none"
                                    : "border-[#E1E0CC]/15 hover:bg-black/50"
                                  }`}
                              >
                                <div>
                                  <h5 className="text-xs font-bold text-[#E1E0CC]">{w.name}</h5>
                                  <p className="text-[10px] text-[#E1E0CC]/50 mt-0.5">Slug: /{w.slug}</p>
                                </div>
                                {activeWorkspace?.id === w.id && (
                                  <span className="px-2 py-0.5 bg-[#101010] text-white rounded text-[8px] font-bold uppercase tracking-wider">Active</span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Create Workspace Form */}
                      <form onSubmit={handleCreateWorkspace} className="pt-6 border-t border-[#E1E0CC]/10 space-y-4">
                        <h5 className="text-xs font-bold text-[#E1E0CC]">Create New Workspace</h5>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Workspace Name (e.g. Acme EMEA)"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            className="flex-1 bg-[#0A0A0A] border border-[#E1E0CC]/15 focus:border-[#E1E0CC]/10 outline-none rounded-xl px-3.5 py-2 text-xs text-[#E1E0CC] transition-colors"
                          />
                          <button
                            type="submit"
                            disabled={isCreatingWorkspace || !newWorkspaceName}
                            className="bg-[#101010] hover:bg-brand-darkHover disabled:opacity-50 text-white font-bold text-xs rounded-xl px-4 py-2 flex items-center gap-1 transition-all"
                          >
                            {isCreatingWorkspace ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                            Create
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* team tab */}
                  {settingsTab === "team" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-[#E1E0CC] mb-1">Team & Members</h4>
                          <p className="text-[11px] text-[#E1E0CC]/50">Invite colleagues, edit roles, and trace activity history logs.</p>
                        </div>
                      </div>

                      {/* Invite Form */}
                      <form onSubmit={handleInvite} className="bg-black border border-[#E1E0CC]/15/60 rounded-xl p-4 space-y-3">
                        <h5 className="text-xs font-bold text-[#E1E0CC]">Invite New Colleague</h5>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="email"
                            placeholder="colleague@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="flex-1 bg-[#0A0A0A] border border-[#E1E0CC]/15 focus:border-[#E1E0CC]/10 outline-none rounded-xl px-3.5 py-2 text-xs text-[#E1E0CC] transition-colors"
                          />
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="bg-[#0A0A0A] border border-[#E1E0CC]/15 outline-none rounded-xl px-3.5 py-2 text-xs text-[#E1E0CC] cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            type="submit"
                            disabled={isInviting || !inviteEmail}
                            className="bg-[#101010] hover:bg-brand-darkHover disabled:opacity-50 text-white font-bold text-xs rounded-xl px-4 py-2 flex items-center gap-1 transition-all"
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
                        <h5 className="text-xs font-bold text-[#E1E0CC]">Active Team Members</h5>
                        <div className="border border-[#E1E0CC]/15/80 rounded-xl divide-y divide-gray-150">
                          {teamMembers.map((m) => (
                            <div key={m.userId} className="p-3.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                {m.avatarUrl ? (
                                  <img src={m.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#E1E0CC]/15" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#E1E0CC]/10 flex items-center justify-center font-bold text-[#E1E0CC]/60 uppercase">
                                    {m.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <h6 className="font-bold text-[#E1E0CC]">{m.name} {m.userId === currentUser?.id && <span className="text-[#E1E0CC]/50 font-normal text-[10px]">(You)</span>}</h6>
                                  <p className="text-[10px] text-[#E1E0CC]/50">{m.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-gray-150 rounded text-[9px] font-bold uppercase tracking-wider text-[#E1E0CC]/70">
                                  {m.role}
                                </span>
                                {m.userId !== currentUser?.id && (
                                  <button
                                    onClick={() => handleRemoveMember(m.userId)}
                                    className="p-1 text-[#E1E0CC]/50 hover:text-[#E1E0CC] rounded transition-all"
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
                          <h5 className="text-xs font-bold text-[#E1E0CC]">Pending Invitations</h5>
                          <div className="border border-[#E1E0CC]/15/80 rounded-xl divide-y divide-gray-150">
                            {pendingInvitations.map((inv) => (
                              <div key={inv.id} className="p-3 flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-bold text-[#E1E0CC]">{inv.email}</p>
                                  <p className="text-[9px] text-[#E1E0CC]/50">Invited as {inv.role}</p>
                                </div>
                                <button
                                  onClick={() => handleClearInvite(inv.id)}
                                  className="text-[10px] text-[#E1E0CC] hover:underline font-bold"
                                >
                                  Revoke
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Audit Trail / Activity Logs */}
                      <div className="space-y-3 pt-6 border-t border-[#E1E0CC]/10">
                        <h5 className="text-xs font-bold text-[#E1E0CC] flex items-center gap-1">
                          <Activity className="w-4 h-4 text-[#E1E0CC]/50" />
                          Security Activity Logs
                        </h5>
                        <div className="border border-[#E1E0CC]/15/80 rounded-xl divide-y divide-gray-150 bg-black/50">
                          {activityLogs.length === 0 ? (
                            <div className="p-4 text-center text-[10px] text-[#E1E0CC]/50 font-mono">No recent logs recorded.</div>
                          ) : (
                            activityLogs.map((log) => (
                              <div key={log.id} className="p-3 text-[10px] text-[#E1E0CC]/60 font-mono flex justify-between items-center">
                                <div>
                                  <span className="text-[#E1E0CC] font-bold">Action: {log.action}</span>
                                  <p className="text-[9px] text-[#E1E0CC]/50 mt-0.5">{JSON.stringify(log.details)}</p>
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
                        <h4 className="text-sm font-bold text-[#E1E0CC] mb-1">Billing & Quota</h4>
                        <p className="text-[11px] text-[#E1E0CC]/50">Manage plan subscriptions, usage metrics and quotas.</p>
                      </div>

                      {/* Active subscription card */}
                      <div className="p-4 bg-gradient-to-br from-brand-dark to-slate-900 text-white rounded-2xl shadow-none border border-[#E1E0CC]/50 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-black text-[#E1E0CC] uppercase tracking-widest font-mono">Active Plan</span>
                            <h4 className="text-base font-black tracking-wide mt-0.5">Automarc Pro Beta</h4>
                          </div>
                          <span className="px-2.5 py-1 bg-[#0A0A0A]/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider border border-white/15">Active</span>
                        </div>
                        <p className="text-xs text-[#E1E0CC] leading-relaxed max-w-sm">
                          Your account has full access to the AI Provider Router, Content planning mixes, logo studios, and LongCat-Video models.
                        </p>
                        <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-[#E1E0CC]/50">
                          <span>Renews: 14 Aug 2026</span>
                          <span>Price: $0.00 (Beta Partner)</span>
                        </div>
                      </div>

                      {/* Quotas progress bar */}
                      <div className="space-y-4 pt-4">
                        <h5 className="text-xs font-bold text-[#E1E0CC]">Usage Analytics & Quotas</h5>
                        <div className="space-y-3.5">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#E1E0CC]/60 font-medium">AI Copywriting generation</span>
                              <span className="text-[#E1E0CC] font-bold">142 / 500 requests</span>
                            </div>
                            <div className="h-2 bg-[#E1E0CC]/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#101010] rounded-full" style={{ width: "28.4%" }} />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#E1E0CC]/60 font-medium">AI Media Generation (Images/Videos)</span>
                              <span className="text-[#E1E0CC] font-bold">38 / 100 media files</span>
                            </div>
                            <div className="h-2 bg-[#E1E0CC]/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#0A0A0A] rounded-full" style={{ width: "38%" }} />
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
            <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#E1E0CC] flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  Plan Custom AI Campaign
                </h3>
                <p className="text-xs text-[#E1E0CC]/50 mt-1">AI generates a detailed campaign and schedules 5 target post concepts.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[#E1E0CC]/60 font-bold block">Campaign Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Launching AI Scraper V2"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full bg-black border border-[#E1E0CC]/15 rounded-xl px-3 py-2 text-[#E1E0CC] outline-none focus:border-[#E1E0CC]/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#E1E0CC]/60 font-bold block">Campaign Type</label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="w-full bg-black border border-[#E1E0CC]/15 rounded-xl px-3 py-2 text-[#E1E0CC] outline-none focus:border-[#E1E0CC]/10"
                  >
                    <option>Product Launch</option>
                    <option>Sales & Promotion</option>
                    <option>Educational</option>
                    <option>Urgency/Awareness</option>
                    <option>Hiring</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#E1E0CC]/60 font-bold block">Campaign Brief / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your campaign objectives, USPs to highlight..."
                    value={campaignDesc}
                    onChange={(e) => setCampaignDesc(e.target.value)}
                    className="w-full bg-black border border-[#E1E0CC]/15 rounded-xl px-3 py-2 text-[#E1E0CC] outline-none focus:border-[#E1E0CC]/10 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#E1E0CC]/60 font-bold block">Target Platforms</label>
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
                            ${active ? "bg-black/10 border-[#E1E0CC]/10 text-brand-primary" : "bg-black border-[#E1E0CC]/15 text-[#E1E0CC]/60"}`}
                        >
                          {platform}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-[#E1E0CC]/10 pt-4">
                <button
                  disabled={isSubmittingCampaign}
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E1E0CC]/15 text-[#E1E0CC]/60 hover:bg-black font-bold text-xs uppercase"
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
                  className="flex-1 py-2.5 rounded-xl bg-[#101010] hover:bg-brand-darkHover text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50"
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
            <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#E1E0CC]/10 pb-3">
                <div>
                  <span className="text-[8px] font-black text-[#E1E0CC]/50 uppercase tracking-widest font-mono">Assets Preview</span>
                  <h3 className="text-base font-bold text-[#E1E0CC] capitalize">{viewingAsset.post_type} Asset Details</h3>
                </div>
                <button
                  onClick={() => setViewingAsset(null)}
                  className="w-7 h-7 rounded-full bg-black border border-[#E1E0CC]/15 hover:bg-[#E1E0CC]/10 flex items-center justify-center font-bold text-[#E1E0CC]/50 hover:text-[#E1E0CC]/80 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Copy Caption */}
                <div className="space-y-1">
                  <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">Social Caption</label>
                  <div className="p-3 bg-black border border-[#E1E0CC]/10 rounded-xl font-normal text-[#E1E0CC]/80 leading-relaxed whitespace-pre-wrap">
                    {viewingAsset.caption}
                  </div>
                </div>

                {/* Hooks & CTAs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">Alternative Hook Idea</label>
                    <div className="p-2.5 bg-black border border-[#E1E0CC]/10 rounded-xl text-[#E1E0CC]/70 font-medium leading-relaxed italic">
                      {viewingAsset.hooks?.[0] || "None generated"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">Primary CTA</label>
                    <div className="p-2.5 bg-black border border-[#E1E0CC]/10 rounded-xl text-[#0A0A0A] font-bold">
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
                        <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">Static Feed Post Preview</label>
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#E1E0CC]/15 bg-[#101010] shadow-inner">
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
                              <div className="w-8 h-8 rounded-full bg-[#0A0A0A]/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white text-xs">
                                {dna?.brand_name?.[0] || "A"}
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-xs font-normal tracking-wide leading-none">{dna?.brand_name || "Asenra"}</h4>
                                <span className="text-[8px] text-[#E1E0CC] font-medium font-normal">Sponsored</span>
                              </div>
                            </div>
                            {/* Overlay Content Card */}
                            <div className="bg-[#0A0A0A]/10 backdrop-blur-lg border border-white/25 p-4 rounded-xl space-y-1.5 shadow-xl">
                              <h4 className="font-bold text-white text-sm font-normal tracking-wide leading-tight">
                                {viewingAsset.title}
                              </h4>
                              <p className="text-[10px] text-[#E1E0CC] font-medium leading-relaxed line-clamp-3">
                                {viewingAsset.caption}
                              </p>
                              <div className="pt-2 flex justify-between items-center border-t border-white/10">
                                <span className="text-[9px] text-[#C9A84C] font-bold tracking-wider uppercase font-mono">{viewingAsset.ctas?.[0] || "Learn More"}</span>
                                <div className="px-3 py-1 bg-[#0A0A0A] text-black font-bold text-[9px] rounded-lg shadow-none hover:scale-105 transition-transform uppercase tracking-wider">
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
                        <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">Interactive Carousel Post Preview</label>
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#E1E0CC]/15 bg-black shadow-2xl flex flex-col justify-between p-5">
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
                              <div className="w-7 h-7 rounded-full bg-[#0A0A0A]/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white text-[10px]">
                                {dna?.brand_name?.[0] || "A"}
                              </div>
                              <span className="text-[10px] font-bold text-white tracking-wider">{dna?.brand_name || "Asenra"}</span>
                            </div>
                            <span className="text-[9px] font-mono bg-[#0A0A0A]/10 backdrop-blur-md px-2 py-0.5 rounded-full text-white/90 border border-white/10">
                              {activeSlide + 1} / {viewingAsset.generated_assets.slides.length}
                            </span>
                          </div>

                          {/* Animated Slide Content Overlay */}
                          <div className="relative my-auto py-4 px-2 space-y-3">
                            <span className="text-[8px] font-black text-[#C9A84C] tracking-widest uppercase font-mono bg-[#C9A84C]/10 border border-[#C9A84C]/25 px-2.5 py-0.5 rounded-full inline-block">
                              Slide {viewingAsset.generated_assets.slides[activeSlide]?.slideNumber || (activeSlide + 1)}
                            </span>
                            <h3 className="text-base font-black text-white leading-tight font-normal tracking-wide">
                              {viewingAsset.generated_assets.slides[activeSlide]?.headline || "Slide Title"}
                            </h3>
                            <p className="text-[10px] text-[#E1E0CC] leading-relaxed font-normal font-medium">
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
                                className="w-7 h-7 rounded-full bg-[#0A0A0A]/10 border border-white/10 hover:bg-[#0A0A0A]/20 text-white flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all"
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
                        <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">Video Reels Mock Player</label>
                        <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto rounded-3xl overflow-hidden border-4 border-[#E1E0CC]/10 bg-black shadow-2xl flex flex-col justify-between p-4">
                          {/* Background B-roll thumbnail */}
                          <img
                            src={viewingAsset.generated_assets.thumbnailUrl || viewingAsset.generated_assets.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"}
                            alt="B-roll Background"
                            className="absolute inset-0 w-full h-full object-cover opacity-65 pointer-events-none"
                          />

                          {/* Header overlay */}
                          <div className="relative flex items-center justify-between text-white text-[10px]">
                            <span className="font-bold tracking-wider font-normal">Reels</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 bg-[#E1E0CC]/10 rounded-full animate-ping" />
                              <span className="text-[9px] uppercase font-mono tracking-wider font-bold">Preview</span>
                            </div>
                          </div>

                          {/* Play overlay / Dynamic subtitle container */}
                          <div className="relative flex flex-col items-center justify-center my-auto space-y-4 min-h-[120px] w-full">
                            {!isVideoPlaying ? (
                              <button
                                onClick={() => setIsVideoPlaying(true)}
                                className="w-12 h-12 rounded-full bg-[#0A0A0A]/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-lg hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
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
                                <p className="text-white text-xs font-bold leading-normal tracking-wide font-normal">
                                  {getActiveSubtitleText()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Footer Info Overlay */}
                          <div className="relative space-y-2 text-white">
                            {/* Brand bar */}
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-[#0A0A0A]/10 border border-white/20 flex items-center justify-center font-bold text-[9px]">
                                {dna?.brand_name?.[0] || "A"}
                              </div>
                              <span className="text-[9px] font-bold tracking-wide">{dna?.brand_name || "Asenra"}</span>
                              <button className="px-2 py-0.5 bg-[#0A0A0A]/25 rounded-md text-[8px] font-bold uppercase tracking-wider">Follow</button>
                            </div>
                            {/* Audio track label */}
                            <p className="text-[8px] text-[#E1E0CC] flex items-center space-x-1 truncate font-mono">
                              <span>&#9835;</span> <span>Original Audio - {dna?.brand_name || "Asenra"}</span>
                            </p>
                            {/* Interactive timeline bar */}
                            <div className="h-1 bg-[#0A0A0A]/25 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#C9A84C] transition-all duration-1000 ease-linear"
                                style={{ width: `${(videoTimer / 30) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[7px] text-[#E1E0CC]/50 font-mono">
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
                  <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">AI Visual Prompt (Stable Diffusion / LongCat)</label>
                  <div className="p-3 bg-black border border-[#E1E0CC]/10 rounded-xl font-mono text-[10px] text-[#E1E0CC]/70 leading-normal">
                    {viewingAsset.visual_prompt}
                  </div>
                </div>

                {/* Format Specific Details (e.g. Slides JSON or Video Script timings) */}
                {viewingAsset.post_type === "carousel" && viewingAsset.generated_assets?.slides && (
                  <div className="space-y-2">
                    <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">Slides Blueprint ({viewingAsset.generated_assets.slides.length})</label>
                    <div className="space-y-2">
                      {viewingAsset.generated_assets.slides.map((slide: any, idx: number) => (
                        <div key={idx} className="p-3 bg-[#111] border border-white/10 rounded-xl space-y-1 text-white">
                          <span className="text-[8px] font-black text-[#C9A84C] uppercase tracking-wider font-mono">Slide {slide.slideNumber}</span>
                          <h4 className="font-bold text-xs text-white">{slide.headline}</h4>
                          <p className="text-[10px] text-[#E1E0CC] leading-normal">{slide.bodyText}</p>
                          <p className="text-[8px] text-[#E1E0CC]/60 italic mt-1">Graphic: {slide.visualDescription}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingAsset.post_type === "video" && viewingAsset.generated_assets?.script && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">Voiceover Script</label>
                      <div className="p-2.5 bg-black border border-[#E1E0CC]/10 rounded-xl text-[#E1E0CC]/80 italic">
                        &ldquo;{viewingAsset.generated_assets.script.voiceover}&rdquo;
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">Subtitle Timings</label>
                      <div className="grid grid-cols-1 gap-1">
                        {viewingAsset.generated_assets.script.timings?.map((t: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-black border border-[#E1E0CC]/10 rounded-lg">
                            <span className="font-mono text-[9px] text-[#0A0A0A] font-bold shrink-0">{t.time}</span>
                            <span className="text-[#E1E0CC]/70 font-medium text-right ml-4 truncate">{t.subtitles}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                <div className="space-y-1">
                  <label className="text-[#E1E0CC]/50 font-bold uppercase tracking-wider text-[9px] block">Hashtags</label>
                  <div className="flex flex-wrap gap-1">
                    {viewingAsset.hashtags?.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-[#E1E0CC]/10 border border-[#E1E0CC]/15 text-[#E1E0CC]/60 font-mono text-[9px] font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              <div className="border-t border-[#E1E0CC]/10 pt-3 flex">
                <button
                  onClick={() => setViewingAsset(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#101010] hover:bg-brand-darkHover text-white font-bold text-xs uppercase"
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
            <div className="bg-[#0A0A0A] border border-[#E1E0CC]/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-[#E1E0CC]/10 pb-3">
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#E1306C] uppercase tracking-wider">Zero-Friction Social Integration</span>
                  <h3 className="text-base font-bold text-[#E1E0CC]">Connect Instagram Account</h3>
                </div>
                <button
                  onClick={() => setIsInstagramModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-black border border-[#E1E0CC]/15 hover:bg-[#E1E0CC]/10 flex items-center justify-center font-bold text-[#E1E0CC]/50 hover:text-[#E1E0CC]/80 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Managed 1-Click Banner */}
                <div className="p-3 bg-[#E1306C]/10 border border-[#E1306C]/20 rounded-xl space-y-1">
                  <span className="font-bold text-[#E1306C] text-[10px] uppercase block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E1306C]" />
                    Managed SaaS Meta API (1-Click Connect)
                  </span>
                  <p className="text-[10px] text-[#E1E0CC]/70 leading-relaxed">
                    Simply enter your Instagram username below. Our platform automatically manages all Meta Graph API tokens, OAuth handshakes, and container publishing on your behalf!
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#E1E0CC]/80 font-bold uppercase tracking-wider text-[10px] block">
                    Instagram Account Handle / Username
                  </label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="e.g. @yourbrand_official"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E0CC]/20 focus:border-[#E1306C] text-xs outline-none bg-[#0A0A0A] text-[#E1E0CC] font-semibold"
                  />
                  <p className="text-[9px] font-mono text-[#E1E0CC]/50">
                    No technical Developer Tokens or Facebook App setup required by you.
                  </p>
                </div>

                {/* Collapsible Custom Developer Tokens */}
                <details className="text-[10px] text-[#E1E0CC]/60 border-t border-[#E1E0CC]/10 pt-2 cursor-pointer">
                  <summary className="font-bold uppercase tracking-wider hover:text-[#E1E0CC]">
                    + Advanced Custom Meta App Developer Keys (Optional)
                  </summary>
                  <div className="space-y-3 pt-3">
                    <div className="space-y-1">
                      <label className="text-[#E1E0CC]/70 font-bold uppercase tracking-wider text-[9px] block">
                        Custom Instagram Business Account ID
                      </label>
                      <input
                        type="text"
                        value={instagramAccountId}
                        onChange={(e) => setInstagramAccountId(e.target.value)}
                        placeholder="e.g. 17841400000000000"
                        className="w-full px-3 py-2 rounded-lg border border-[#E1E0CC]/15 text-xs font-mono bg-[#0A0A0A] text-[#E1E0CC]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#E1E0CC]/70 font-bold uppercase tracking-wider text-[9px] block">
                        Custom Page Access Token
                      </label>
                      <input
                        type="password"
                        value={instagramAccessToken}
                        onChange={(e) => setInstagramAccessToken(e.target.value)}
                        placeholder="EAAB..."
                        className="w-full px-3 py-2 rounded-lg border border-[#E1E0CC]/15 text-xs font-mono bg-[#0A0A0A] text-[#E1E0CC]"
                      />
                    </div>
                  </div>
                </details>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E1E0CC]/10">
                <button
                  onClick={() => setIsInstagramModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E1E0CC]/15 text-[#E1E0CC]/70 font-bold text-xs uppercase hover:bg-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInstagram}
                  disabled={isSavingInstagram || !instagramHandle.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#E1306C] hover:bg-[#E1306C]/90 text-white font-bold text-xs uppercase tracking-wider shadow-none flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingInstagram ? "Connecting Account..." : "Connect Instagram (1-Click)"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* GDPR Footer */}
      <footer className="px-6 py-4 text-center border-t border-[#E1E0CC]/10 bg-[#0A0A0A]">
        <p className="text-[10px] text-[#E1E0CC]/50 flex items-center justify-center gap-1 font-semibold uppercase tracking-wider">
          Secure 256-bit encryption · GDPR & DPDP compliant
        </p>
      </footer>

    </div>
  );
}
