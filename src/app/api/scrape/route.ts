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

    // 1. Brand Name Extraction
    const title = $("title").text().trim() || $("meta[property='og:title']").attr("content")?.trim() || "";
    let brandName = title.split(/[|:-]/)[0]?.trim() || "";
    if (!brandName) {
      try {
        const parsed = new URL(targetUrl);
        brandName = parsed.hostname.replace("www.", "").split(".")[0];
        brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
      } catch (e) {
        brandName = "My Brand";
      }
    }

    // 2. Business Description Extraction
    const metaDescription = $("meta[name='description']").attr("content")?.trim() || 
                            $("meta[property='og:description']").attr("content")?.trim() || "";
    
    // Fallback: extract first text paragraph longer than 60 characters
    let fallbackDesc = "";
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 60 && text.length < 250 && !fallbackDesc) {
        fallbackDesc = text;
      }
    });
    const businessDescription = metaDescription || fallbackDesc || `${brandName} offers specialized products and services tailored to industry standards.`;

    // 3. Industry & Category detection from page body text keywords
    const bodyText = $("body").text().toLowerCase();
    let industry = "Technology";
    let category = "Software Service";

    // Priority 1: Software, AI Agents, Dev Agencies
    if (
      bodyText.includes("software") || 
      bodyText.includes("ai agent") || 
      bodyText.includes("custom software") || 
      bodyText.includes("bespoke") || 
      bodyText.includes("developer") || 
      bodyText.includes("engineering") || 
      bodyText.includes("coding")
    ) {
      industry = "Software / Tech";
      category = bodyText.includes("agent") || bodyText.includes("agency") || bodyText.includes("bespoke")
        ? "AI & Software Engineering Agency"
        : "B2B SaaS Platform";
    } 
    // Priority 2: Marketing & Creative Agency
    else if (bodyText.includes("agency") || bodyText.includes("marketing") || bodyText.includes("advertise") || bodyText.includes("creative")) {
      industry = "Marketing & Creative Agency";
      category = "Marketing Services";
    } 
    // Priority 3: E-Commerce / Online Retail (specific keywords)
    else if (
      bodyText.includes("ecommerce") || 
      bodyText.includes("e-commerce") || 
      bodyText.includes("shop") || 
      bodyText.includes("retail") || 
      bodyText.includes("shopify") || 
      bodyText.includes("add to cart") || 
      bodyText.includes("checkout")
    ) {
      industry = "E-Commerce / Retail";
      category = "Online Store";
    } 
    // Priority 4: Finance / FinTech
    else if (bodyText.includes("finance") || bodyText.includes("crypto") || bodyText.includes("blockchain") || bodyText.includes("payment")) {
      industry = "Finance / FinTech";
      category = "Financial Software";
    }

    // 4. Mission Statement guesses
    let mission = "";
    $("p, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      const textLower = text.toLowerCase();
      if ((textLower.includes("mission") || textLower.includes("believe") || textLower.includes("our aim") || textLower.includes("we help")) && 
          text.length > 30 && text.length < 160 && !mission) {
        mission = text;
      }
    });
    if (!mission) {
      mission = `To deliver superior value and high-quality ${industry.toLowerCase()} solutions to our clients.`;
    }

    // 5. Unique Selling Proposition (USP)
    let usp = "";
    $("h1, h2").each((_, el) => {
      const text = $(el).text().trim();
      const textLower = text.toLowerCase();
      if ((textLower.includes("only") || textLower.includes("unlike") || textLower.includes("first") || textLower.includes("best")) && 
          text.length > 20 && text.length < 100 && !usp) {
        usp = text;
      }
    });
    if (!usp) {
      usp = `Leading the market with customized ${category.toLowerCase()} systems.`;
    }

    // 6. Values Detection
    const valueKeywords = [
      { kw: "trust", label: "Trust" },
      { kw: "innovat", label: "Innovation" },
      { kw: "simpl", label: "Simplicity" },
      { kw: "transparen", label: "Transparency" },
      { kw: "secur", label: "Security" },
      { kw: "custom", label: "Customer First" },
      { kw: "qualit", label: "Premium Quality" },
    ];
    const detectedValues: string[] = [];
    valueKeywords.forEach(({ kw, label }) => {
      if (bodyText.includes(kw) && detectedValues.length < 4) {
        detectedValues.push(label);
      }
    });
    if (detectedValues.length === 0) {
      detectedValues.push("Innovation", "Trust");
    }

    return NextResponse.json({
      brandName,
      website: targetUrl,
      industry,
      category,
      subCategory: category.includes("Agency") ? "Software Agency" : "SaaS Solution",
      businessDescription,
      mission,
      vision: `To lead the future of ${industry.toLowerCase()} by delivering high-impact, scalable solutions.`,
      usp,
      brandValues: detectedValues,
      products: [brandName + " Core Engine"],
      services: [brandName + " Custom Integration", brandName + " Managed Setup"],
      customerPersonas: `Primary: Tech-savvy businesses and teams looking for modern ${industry.toLowerCase()} solutions. Secondary: Small-to-medium enterprises needing reliable execution.`,
      competitors: ["Traditional Competitor A", "Legacy Provider B"],
    });

  } catch (error: any) {
    console.error("Scraping handler error:", error);
    return NextResponse.json({ error: error.message || "Failed to process website data" }, { status: 500 });
  }
}
