import { NextResponse } from "next/server";
import { 
  getBrandMemoryContext, 
  saveToMemoryBank, 
  recordPostPerformance 
} from "@/lib/brandMemory";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandDnaId = searchParams.get("brandDnaId");

    if (!brandDnaId) {
      return NextResponse.json({ error: "Missing brandDnaId parameter" }, { status: 400 });
    }

    const memoryContext = await getBrandMemoryContext(brandDnaId);
    return NextResponse.json(memoryContext);

  } catch (error: any) {
    console.error("GET Brand Memory Error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve brand memory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandDnaId, action } = body;

    if (!brandDnaId) {
      return NextResponse.json({ error: "Missing brandDnaId" }, { status: 400 });
    }

    if (action === "saveItem") {
      const { type, content, category } = body;
      if (!type || !content) {
        return NextResponse.json({ error: "Missing type or content for saveItem action" }, { status: 400 });
      }
      if (!["hook", "cta", "hashtag"].includes(type)) {
        return NextResponse.json({ error: "Invalid type. Must be hook, cta, or hashtag" }, { status: 400 });
      }

      await saveToMemoryBank(brandDnaId, type, content, category || "General");
      return NextResponse.json({ success: true, message: "Saved successfully to Brand Memory Bank" });
    }

    if (action === "recordPerformance") {
      const { postId, engagementScore } = body;
      if (!postId || engagementScore === undefined) {
        return NextResponse.json({ error: "Missing postId or engagementScore for recordPerformance action" }, { status: 400 });
      }

      await recordPostPerformance(postId, Number(engagementScore));
      return NextResponse.json({ success: true, message: "Updated post performance score" });
    }

    return NextResponse.json({ error: "Invalid action. Supported: saveItem, recordPerformance" }, { status: 400 });

  } catch (error: any) {
    console.error("POST Brand Memory Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process brand memory transaction" }, { status: 500 });
  }
}
