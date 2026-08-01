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

    const prompt = `You are a senior LinkedIn content strategist writing for a professional brand.

Write a single, high-quality LinkedIn post caption for the following:

- Topic / Content: "${title}"
- Brand Name: "${brandName || "our brand"}"
- Industry: "${industry || "business"}"
- Content Type: ${contentType === "carousel" ? "a carousel post with multiple slides" : "a branded visual post"}
- Tone: ${tone || "authoritative and insightful"}

Rules you MUST follow:
1. NO emojis whatsoever — zero, none. This is a professional post.
2. Write 3 to 5 concise paragraphs maximum.
3. Start with a compelling hook — a bold statement, a thought-provoking question, or a counterintuitive insight.
4. Use short punchy sentences mixed with medium-length ones for rhythm.
5. Include one clear insight or takeaway.
6. End with a subtle, non-salesy call to action or reflection prompt.
7. Do NOT use hashtags.
8. Do NOT use bullet points or numbered lists.
9. Sound like a respected industry leader, not a marketer.
10. Output ONLY the caption text — no labels, no quotes, no preamble.`;

    const result = await model.generateContent(prompt);
    const caption = result.response.text().trim();

    return NextResponse.json({ caption });
  } catch (err: any) {
    console.error("[LinkedIn Caption Generation Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate caption" },
      { status: 500 }
    );
  }
}
