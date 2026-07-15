import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Semantic local fallback parser to scrape website using Cheerio if Gemini API fails or is rate-limited
function parseLocalCheerio($: cheerio.CheerioAPI, targetUrl: string, title: string, metaDescription: string, rawText: string) {
  // Brand Name extraction
  let brandName = "";
  const ogSiteName = $("meta[property='og:site_name']").attr("content");
  if (ogSiteName) {
    brandName = ogSiteName.trim();
  } else if (title) {
    const parts = title.split(/[|:-]/);
    brandName = parts[0].trim();
  }
  if (!brandName || brandName.length < 2 || brandName.toLowerCase() === "home") {
    try {
      const hostname = new URL(targetUrl).hostname;
      brandName = hostname.replace("www.", "").split(".")[0];
      brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    } catch {
      brandName = "My Brand";
    }
  }

  // Business Description extraction
  let businessDescription = metaDescription || "";
  if (!businessDescription) {
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 50 && text.length < 250) {
        businessDescription = text;
        return false; // break
      }
    });
  }
  if (!businessDescription) {
    businessDescription = `A professional company offering specialized services and products to support enterprise development.`;
  }

  // USP / Tagline extraction
  let usp = $("h1").first().text().trim() || "";
  if (!usp || usp.length < 10) {
    usp = $("h2").first().text().trim() || "";
  }
  if (!usp || usp.length < 10) {
    usp = `Innovating and delivering premium value for all our partners.`;
  }

  const mission = `To empower our clients through outstanding expertise and industry-leading solutions.`;
  const vision = `To build a smarter, more connected future for our global community.`;

  // Industry estimation
  let industry = "Technology";
  const lowerText = rawText.toLowerCase();
  if (lowerText.includes("finance") || lowerText.includes("crypto") || lowerText.includes("bank") || lowerText.includes("payment")) {
    industry = "Finance";
  } else if (lowerText.includes("ecommerce") || lowerText.includes("shop") || lowerText.includes("store") || lowerText.includes("apparel")) {
    industry = "E-Commerce";
  } else if (lowerText.includes("health") || lowerText.includes("clinic") || lowerText.includes("medical") || lowerText.includes("fitness")) {
    industry = "Health & Wellness";
  } else if (lowerText.includes("agency") || lowerText.includes("marketing") || lowerText.includes("advertise") || lowerText.includes("social")) {
    industry = "Marketing";
  } else if (lowerText.includes("education") || lowerText.includes("learn") || lowerText.includes("school") || lowerText.includes("course")) {
    industry = "Education";
  }

  // Brand values search
  const availableValues = ["Innovation", "Trust", "Simplicity", "Integrity", "Excellence", "Collaboration", "Sustainability", "Customer-First"];
  const brandValues: string[] = [];
  availableValues.forEach(val => {
    if (lowerText.includes(val.toLowerCase()) && brandValues.length < 4) {
      brandValues.push(val);
    }
  });
  if (brandValues.length < 3) {
    brandValues.push("Innovation", "Integrity", "Excellence");
  }

  // Products and Services guessing
  const products: string[] = [];
  const services: string[] = [];
  
  $("h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 3 && text.length < 45) {
      if (lowerText.includes("product") && products.length < 3) {
        products.push(text);
      } else if (lowerText.includes("service") && services.length < 3) {
        services.push(text);
      }
    }
  });

  if (products.length === 0) {
    products.push("Core Enterprise Solution", "Analytics Dashboard");
  }
  if (services.length === 0) {
    services.push("Strategic Consultation", "Implementation Support");
  }

  return {
    brandName,
    website: targetUrl,
    industry,
    category: industry + " Solutions",
    subCategory: "Enterprise Integration",
    businessDescription,
    mission,
    vision,
    usp,
    brandValues,
    products,
    services,
    customerPersonas: "Modern businesses and forward-looking consumers.",
    competitors: ["Competitor A", "Competitor B"],
    warning: "Scraped using local Cheerio parser fallback due to Gemini rate-limiting."
  };
}

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
      next: { revalidate: 0 }
    });

    const emptyFallback = (urlStr: string) => ({
      brandName: "",
      website: urlStr,
      industry: "Technology",
      category: "",
      subCategory: "",
      businessDescription: "",
      mission: "",
      vision: "",
      usp: "",
      brandValues: [],
      products: [],
      services: [],
      customerPersonas: "",
      competitors: [],
      warning: "Website scraping was blocked. Please enter brand details manually."
    });

    if (!response.ok) {
      console.warn(`Scrape request blocked (HTTP ${response.status}). Returning manual entry fallback.`);
      return NextResponse.json(emptyFallback(targetUrl));
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
      console.warn("Gemini API key is not configured. Running Cheerio local fallback.");
      const fallbackData = parseLocalCheerio($, targetUrl, title, metaDescription, rawBodyText);
      return NextResponse.json(fallbackData);
    }

    // Call Gemini 2.5 Flash to semantically parse the page text into Brand DNA JSON
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are a world-class Brand Strategist and Analyst. 
Analyze the scraped website homepage details of a business and compile their structured Brand DNA profile.

Return ONLY a valid JSON object matching the following TypeScript interface structure (no markdown formatting, no backticks, no wrap text, just the raw JSON object):
interface BrandDna {
  brandName: string;
  website: string;
  industry: string;
  category: string;
  subCategory: string;
  businessDescription: string;
  mission: string;
  vision: string;
  usp: string;
  brandValues: string[];
  products: string[];
  services: string[];
  customerPersonas: string;
  competitors: string[];
}

Scraped Website Content:
"""
${cleanText}
"""`;

    let brandData = null;
    try {
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

      if (geminiResponse.ok) {
        const resJson = await geminiResponse.json();
        const responseText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          let jsonText = responseText.trim();
          if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
          }
          brandData = JSON.parse(jsonText);
        }
      } else {
        console.error("Gemini API returned error response:", await geminiResponse.text());
      }
    } catch (geminiError) {
      console.error("Gemini invocation failed:", geminiError);
    }

    if (!brandData) {
      console.warn("Gemini parsing failed or was skipped. Executing Cheerio semantic fallback parsing.");
      brandData = parseLocalCheerio($, targetUrl, title, metaDescription, rawBodyText);
    }

    return NextResponse.json(brandData);

  } catch (error: any) {
    console.error("Scraping handler error:", error);
    
    const finalFallback = {
      brandName: "",
      website: "",
      industry: "Technology",
      category: "",
      subCategory: "",
      businessDescription: "",
      mission: "",
      vision: "",
      usp: "",
      brandValues: [],
      products: [],
      services: [],
      customerPersonas: "",
      competitors: [],
      warning: "Could not scrape the website. Please enter details manually."
    };
    return NextResponse.json(finalFallback);
  }
}
