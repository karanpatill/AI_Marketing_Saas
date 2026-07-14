import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalize URL
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // Perform web request with user agent configuration
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      next: { revalidate: 0 } // Disable caching to fetch fresh site copy
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch website contents (HTTP ${response.status})` }, { status: 500 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, and iframe tags to clean text
    $("script, style, iframe, nav, footer").remove();
    
    // Extract title, meta tags, and clean body text
    const title = $("title").text().trim();
    const metaDescription = $("meta[name='description']").attr("content")?.trim() || "";
    const rawBodyText = $("body").text().replace(/\s+/g, " ").trim();
    const cleanText = `Title: ${title}\nMeta Description: ${metaDescription}\nContent:\n${rawBodyText.slice(0, 8000)}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    // Call Gemini 2.5 Flash to semantically parse the page text into Brand DNA JSON
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are a world-class Brand Strategist and Analyst. 
Analyze the scraped website homepage details of a business and compile their structured Brand DNA profile.

Return ONLY a valid JSON object matching the following TypeScript interface structure (no markdown formatting, no backticks, no wrap text, just the raw JSON object):
interface BrandDna {
  brandName: string; // The official name of the brand
  website: string; // Keep as: "${targetUrl}"
  industry: string; // The main vertical, e.g. "Software Development", "B2B SaaS", "Marketing", "E-Commerce", "Finance"
  category: string; // More specific descriptor, e.g., "AI Engineering Studio", "D2C Apparel"
  subCategory: string;
  businessDescription: string; // Clear, premium explanation of what they do (1-2 sentences)
  mission: string; // A high-impact, inspiring mission statement (1 sentence)
  vision: string; // Forward-looking vision statement (1 sentence)
  usp: string; // The core unique selling proposition / differentiator
  brandValues: string[]; // Pick 3-4 professional brand values (e.g., Innovation, Trust, Simplicity, Sustainability)
  products: string[]; // Up to 3 main product offerings found or inferred
  services: string[]; // Up to 3 main services offered
  customerPersonas: string; // Description of their primary target audience personas
  competitors: string[]; // List of 2 likely competitors in their space
}

Scraped Website Content:
"""
${cleanText}
"""`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", await geminiResponse.text());
      throw new Error("Failed to parse website details using AI");
    }

    const resJson = await geminiResponse.json();
    const responseText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error("Empty response from AI parser");
    }
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
    }

    const brandData = JSON.parse(jsonText);
    return NextResponse.json(brandData);

  } catch (error: any) {
    console.error("Scraping handler error:", error);
    return NextResponse.json({ error: error.message || "Failed to process website data" }, { status: 500 });
  }
}
