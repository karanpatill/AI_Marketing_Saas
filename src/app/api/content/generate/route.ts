import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { AIGenerationService } from "@/backend/services/AIGenerationService";

export const POST = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();
  
  const body = await req.json();
  const { calendarItemId, orgId, prompt, jobType, aspectRatio } = body;

  if (!calendarItemId && !prompt) {
    return NextResponse.json({ error: "Missing calendarItemId or prompt in body" }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();
  const aiService = new AIGenerationService(supabaseAdmin);

  let topic = prompt || "A professional marketing post";
  let finalJobType = jobType || 'generate_post';
  let finalAspectRatio = aspectRatio || '1:1';
  let resolvedWorkspaceId = orgId || "00000000-0000-0000-0000-000000000000";

  if (calendarItemId) {
    const { data: item } = await supabaseAdmin
      .from('content_calendar')
      .select('*')
      .eq('id', calendarItemId)
      .single();

    if (item) {
      topic = item.title;
      // Depending on the content type, route to correct generator
      finalJobType = item.post_type?.toLowerCase().includes('carousel') ? 'generate_carousel' : 'generate_post';
      resolvedWorkspaceId = item.workspace_id || resolvedWorkspaceId;
      // Default aspect ratio for calendar items if not specified
      finalAspectRatio = "1:1";
    }
  }

  // Extract Brand DNA context directly from body or fallback to DB
  let brandName = body.brandName || "Brand";
  let brandPersonality = body.brandPersonality || "Luxury";
  let businessDescription = body.businessDescription || "";
  let targetAudience = body.targetAudience || "";
  let usp = body.usp || "";
  let website = body.website || "";
  let logoUrl = body.logoUrl || "";
  let fonts = body.fonts || [];
  let primaryColor = body.primaryColor || "#FFB800";
  let secondaryColor = body.secondaryColor || "#000000";

  let primaryFont = body.primaryFont || (Array.isArray(fonts) && fonts.length > 0 ? fonts[0] : "");
  let bodyFont = body.bodyFont || (Array.isArray(fonts) && fonts.length > 1 ? fonts[1] : "");

  const { data: brand } = await supabaseAdmin
    .from('brand_dna')
    .select('*')
    .eq('workspace_id', resolvedWorkspaceId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (brand) {
    brandName = brand.brand_name || brandName;
    brandPersonality = brand.brand_personality || brand.visual_style || brandPersonality;
    businessDescription = brand.business_description || businessDescription;
    targetAudience = brand.target_audience || targetAudience;
    usp = brand.usp || usp;
    website = brand.website || brand.website_url || website;

    const { data: assetData } = await supabaseAdmin
      .from('brand_assets')
      .select('*')
      .eq('brand_dna_id', brand.id)
      .maybeSingle();

    if (assetData) {
      logoUrl = assetData.logo_url || logoUrl;
      fonts = assetData.fonts || fonts;
      if (assetData.logo_studio_data?.colors) {
        primaryColor = assetData.logo_studio_data.colors.primaryHex || primaryColor;
        secondaryColor = assetData.logo_studio_data.colors.secondaryHex || secondaryColor;
      }
      if (assetData.logo_studio_data?.typography) {
        primaryFont = assetData.logo_studio_data.typography.primaryFont || primaryFont;
        bodyFont = assetData.logo_studio_data.typography.bodyFont || bodyFont;
      }
    }
  }

  const job = await aiService.enqueueJob({
    workspaceId: resolvedWorkspaceId,
    userId: user.id,
    jobType: finalJobType,
    payload: { 
      calendarItemId,
      prompt: topic,
      topic: topic,
      aspectRatio: finalAspectRatio,
      brandName,
      brandPersonality,
      businessDescription,
      targetAudience,
      usp,
      website,
      logoUrl,
      fonts,
      primaryFont,
      bodyFont,
      primaryColor,
      secondaryColor
    }
  });

  return NextResponse.json(
    { 
      success: true, 
      message: "Job enqueued successfully", 
      jobId: job.id 
    },
    { status: 202 }
  );
});
