import { NextResponse } from "next/server";
import { generateMarketingStrategy, getMarketingCalendar } from "@/lib/marketingStrategy";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandDnaId = searchParams.get("brandDnaId");
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    if (!brandDnaId) {
      return NextResponse.json({ error: "Missing brandDnaId parameter" }, { status: 400 });
    }

    const calendar = await getMarketingCalendar(brandDnaId, startDate, endDate);
    return NextResponse.json(calendar);

  } catch (error: any) {
    console.error("GET Marketing Calendar Error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve calendar" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandDnaId } = body;

    if (!brandDnaId) {
      return NextResponse.json({ error: "Missing brandDnaId" }, { status: 400 });
    }

    await generateMarketingStrategy(brandDnaId);
    return NextResponse.json({ success: true, message: "Marketing strategy and 30-day calendar generated successfully" });

  } catch (error: any) {
    console.error("POST Generate Strategy Error:", error);
    return NextResponse.json({ error: error.message || "Failed to compile marketing strategy" }, { status: 500 });
  }
}
