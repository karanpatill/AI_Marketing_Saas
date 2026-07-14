import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createMarketingCampaign } from "@/lib/campaignPlanner";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandDnaId = searchParams.get("brandDnaId");

    if (!brandDnaId) {
      return NextResponse.json({ error: "Missing brandDnaId parameter" }, { status: 400 });
    }

    const { data: campaigns, error } = await supabase
      .from("brand_campaigns")
      .select("*")
      .eq("brand_dna_id", brandDnaId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    return NextResponse.json(campaigns || []);

  } catch (error: any) {
    console.error("GET Campaigns Error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve campaigns" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandDnaId, title, campaignType, description, platforms } = body;

    if (!brandDnaId || !title || !campaignType || !description || !platforms) {
      return NextResponse.json({ error: "Missing required parameters in body" }, { status: 400 });
    }

    const campaignId = await createMarketingCampaign(brandDnaId, title, campaignType, description, platforms);
    return NextResponse.json({ success: true, campaignId, message: "Campaign and posts planned successfully" });

  } catch (error: any) {
    console.error("POST Create Campaign Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status: 500 });
  }
}
