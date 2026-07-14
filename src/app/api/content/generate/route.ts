import { NextResponse } from "next/server";
import { generateContentForCalendarItem } from "@/lib/contentFactory";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { calendarItemId } = body;

    if (!calendarItemId) {
      return NextResponse.json({ error: "Missing calendarItemId in body" }, { status: 400 });
    }

    const postId = await generateContentForCalendarItem(calendarItemId);
    return NextResponse.json({ success: true, postId, message: "Asset compiled and saved to Brand Posts history" });

  } catch (error: any) {
    console.error("POST Content Generate Error:", error);
    return NextResponse.json({ error: error.message || "Failed to compile marketing asset" }, { status: 500 });
  }
}
