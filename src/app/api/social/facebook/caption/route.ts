import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, contentType, brandName, industry, tone } = body;

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a senior Facebook content strategist writing for a professional brand.

Write a single, high-quality Facebook post caption for the following:

- Topic / Content: "${title}"
- Brand Name: "${brandName || "our brand"}"
- Industry: "${industry || "business"}"
- Content Type: ${contentType === "carousel" ? "a carousel post with multiple slides" : "a branded visual post"}
- Tone: ${tone || "professional and engaging"}

Rules you MUST follow:
1. NO emojis whatsoever — zero, none. This is a professional post.
2. Write 2 to 4 concise paragraphs maximum.
3. Start with a compelling hook.
4. Make it engaging but maintain a highly professional tone.
5. End with a clear call to action.
6. Do NOT use hashtags.
7. Output ONLY the caption text — no labels, no quotes, no preamble.`;

    const result = await model.generateContent(prompt);
    const caption = result.response.text().trim();

    return NextResponse.json({ caption });
  } catch (err: any) {
    console.error("[Facebook Caption Generation Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate caption" },
      { status: 500 }
    );
  }
}
