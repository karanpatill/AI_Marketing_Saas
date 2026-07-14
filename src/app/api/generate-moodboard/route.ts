import { NextResponse } from "next/server";

// Moodboard style definitions — each has a full visual system
const MOODBOARD_STYLES: Record<string, {
  name: string;
  tagline: string;
  palette: { name: string; hex: string; role: string }[];
  typography: { headline: string; body: string; style: string };
  keywords: string[];
  gradient: string;
  accentGradient: string;
  texture: string;
  imagePrompt: string;
}> = {
  luxury: {
    name: "Dark Luxury",
    tagline: "Opulent · Exclusive · Timeless",
    palette: [
      { name: "Obsidian", hex: "#0D0D0D", role: "Primary Background" },
      { name: "Gold Leaf", hex: "#C9A84C", role: "Primary Accent" },
      { name: "Champagne", hex: "#F5E6C8", role: "Text / Highlight" },
      { name: "Midnight", hex: "#1A1A2E", role: "Secondary Background" },
      { name: "Bronze", hex: "#8B6914", role: "Deep Accent" },
    ],
    typography: { headline: "Playfair Display", body: "Cormorant Garamond", style: "Elegant Serif" },
    keywords: ["Exclusive", "Refined", "Heritage", "Prestige", "Curated"],
    gradient: "linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 40%, #2D1B00 100%)",
    accentGradient: "linear-gradient(90deg, #C9A84C, #8B6914)",
    texture: "Fine-grain leather · Gold foil embossing · Black silk",
    imagePrompt: "Luxury brand editorial moodboard, dark obsidian background, gold leaf accents, champagne highlights, premium materials, cinematic dramatic lighting, high fashion editorial photography, editorial magazine layout composition, ultra premium feel, 16:9",
  },
  minimal: {
    name: "Minimal Pure",
    tagline: "Clean · Breathable · Essential",
    palette: [
      { name: "Snow", hex: "#FAFAFA", role: "Primary Background" },
      { name: "Graphite", hex: "#1C1C1C", role: "Primary Text" },
      { name: "Warm Gray", hex: "#8C8C8C", role: "Secondary Text" },
      { name: "Ivory", hex: "#F2EFE9", role: "Surface" },
      { name: "Stone", hex: "#D4CFC8", role: "Borders" },
    ],
    typography: { headline: "Inter", body: "Inter", style: "Clean Sans-Serif" },
    keywords: ["Clarity", "Breathing Room", "Precision", "Intentional", "Pure"],
    gradient: "linear-gradient(135deg, #FAFAFA 0%, #F2EFE9 100%)",
    accentGradient: "linear-gradient(90deg, #1C1C1C, #8C8C8C)",
    texture: "Uncoated matte paper · Thin hairlines · Generous whitespace",
    imagePrompt: "Minimalist brand moodboard, pure white background, generous whitespace, subtle gray tones, Scandinavian design aesthetic, clean geometric forms, uncoated paper textures, calm and focused composition, 16:9",
  },
  premium: {
    name: "Premium Steel",
    tagline: "Sharp · Confident · Authority",
    palette: [
      { name: "Navy Depths", hex: "#0A1628", role: "Primary Background" },
      { name: "Silver Chrome", hex: "#C0C0C8", role: "Primary Accent" },
      { name: "Electric Blue", hex: "#0066FF", role: "CTA Accent" },
      { name: "Slate", hex: "#2D3748", role: "Secondary BG" },
      { name: "Ice White", hex: "#F0F4FF", role: "Text" },
    ],
    typography: { headline: "Montserrat", body: "Source Sans Pro", style: "Modern Geometric" },
    keywords: ["Authority", "Innovation", "Precision", "Technology", "Forward"],
    gradient: "linear-gradient(135deg, #0A1628 0%, #1a2744 50%, #0D1F3C 100%)",
    accentGradient: "linear-gradient(90deg, #0066FF, #C0C0C8)",
    texture: "Brushed aluminum · Carbon fiber · Polished steel",
    imagePrompt: "Premium corporate technology brand moodboard, deep navy blue background, silver chrome metallic accents, electric blue highlights, brushed aluminum textures, authoritative and innovative feel, professional corporate photography, 16:9",
  },
  modern: {
    name: "Modern Vivid",
    tagline: "Dynamic · Fresh · Digital-First",
    palette: [
      { name: "Deep Violet", hex: "#4F46E5", role: "Primary Brand" },
      { name: "Electric Cyan", hex: "#06B6D4", role: "Secondary Accent" },
      { name: "Pure White", hex: "#FFFFFF", role: "Background" },
      { name: "Soft Lavender", hex: "#EEF2FF", role: "Surface" },
      { name: "Near Black", hex: "#0F172A", role: "Text" },
    ],
    typography: { headline: "Plus Jakarta Sans", body: "DM Sans", style: "Modern Variable" },
    keywords: ["Vibrant", "Digital", "Connected", "Scalable", "Fluid"],
    gradient: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
    accentGradient: "linear-gradient(90deg, #4F46E5, #7C3AED)",
    texture: "Glass morphism · Soft shadows · Gradient mesh",
    imagePrompt: "Modern digital startup brand moodboard, vibrant violet and cyan gradient background, glassmorphism UI elements, gradient mesh effects, tech startup aesthetic, digital-first visual language, clean product mockups, 16:9",
  },
  editorial: {
    name: "Editorial",
    tagline: "Structured · Journalistic · Authoritative",
    palette: [
      { name: "Newsprint White", hex: "#FAF9F7", role: "Background" },
      { name: "Press Black", hex: "#111111", role: "Primary Text" },
      { name: "Crimson", hex: "#CC2929", role: "Pull Quote Accent" },
      { name: "Warm Beige", hex: "#E8E4DC", role: "Secondary Surface" },
      { name: "Ink Gray", hex: "#555555", role: "Body Text" },
    ],
    typography: { headline: "Libre Baskerville", body: "Merriweather", style: "Classic Editorial Serif" },
    keywords: ["Credibility", "Depth", "Voice", "Narrative", "Structure"],
    gradient: "linear-gradient(135deg, #FAF9F7 0%, #E8E4DC 100%)",
    accentGradient: "linear-gradient(90deg, #CC2929, #111111)",
    texture: "Newsprint grain · Column grid · Editorial spacing",
    imagePrompt: "Editorial magazine brand moodboard, newsprint cream background, bold black typography, crimson accent details, journalistic photography, structured column grid layout, newspaper and magazine editorial aesthetic, 16:9",
  },
  apple: {
    name: "Apple Style",
    tagline: "Precise · Human · Magical",
    palette: [
      { name: "Pure White", hex: "#FFFFFF", role: "Primary Background" },
      { name: "SF Black", hex: "#1D1D1F", role: "Primary Text" },
      { name: "Apple Blue", hex: "#0071E3", role: "CTA Blue" },
      { name: "Frost", hex: "#F5F5F7", role: "Section Surface" },
      { name: "Mid Gray", hex: "#86868B", role: "Secondary Text" },
    ],
    typography: { headline: "SF Pro Display", body: "SF Pro Text", style: "Apple Human Interface" },
    keywords: ["Simplicity", "Details", "Craftsmanship", "Delight", "Intuitive"],
    gradient: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)",
    accentGradient: "linear-gradient(90deg, #0071E3, #00A3FF)",
    texture: "Anodized aluminum · Gorilla glass · Liquid Retina",
    imagePrompt: "Apple-inspired brand moodboard, pristine white background, product photography on pure white, precision minimal design, silicon valley technology aesthetic, blue accent details, clean geometric product renders, ultra high-end finish, 16:9",
  },
  tesla: {
    name: "Tesla Style",
    tagline: "Future · Electric · Inevitable",
    palette: [
      { name: "Space Black", hex: "#101010", role: "Primary Background" },
      { name: "Tesla Red", hex: "#CC0000", role: "Brand Red" },
      { name: "Chrome Silver", hex: "#E8E8E8", role: "Metallic Accent" },
      { name: "Charcoal", hex: "#1C1C1C", role: "Secondary BG" },
      { name: "Stark White", hex: "#F8F8F8", role: "Text" },
    ],
    typography: { headline: "Gotham", body: "Inter", style: "Industrial Geometric" },
    keywords: ["Electrified", "Engineered", "Inevitable", "Revolutionary", "Pure"],
    gradient: "linear-gradient(135deg, #101010 0%, #1C1C1C 100%)",
    accentGradient: "linear-gradient(90deg, #CC0000, #880000)",
    texture: "Carbon fiber · Matte finish · Precision engineering",
    imagePrompt: "Tesla-inspired industrial brand moodboard, space black background, electric red accents, chrome silver metallic reflections, carbon fiber texture details, precision engineering aesthetic, dramatic automotive product photography, minimalist but powerful, 16:9",
  },
  boldStartup: {
    name: "Bold Startup",
    tagline: "Disruptive · Energetic · Fearless",
    palette: [
      { name: "Electric Yellow", hex: "#FFD700", role: "Primary Brand" },
      { name: "Night Black", hex: "#0A0A0A", role: "Background" },
      { name: "Hot Pink", hex: "#FF2D78", role: "Secondary Accent" },
      { name: "Electric Green", hex: "#39FF14", role: "Highlight" },
      { name: "Off White", hex: "#F5F5F5", role: "Text" },
    ],
    typography: { headline: "Space Grotesk", body: "Space Mono", style: "Techno Bold" },
    keywords: ["Disruptive", "Fearless", "Hype", "Energy", "Culture"],
    gradient: "linear-gradient(135deg, #0A0A0A 0%, #1A0A00 100%)",
    accentGradient: "linear-gradient(90deg, #FFD700, #FF2D78)",
    texture: "Street art · Digital noise · Neon glow effects",
    imagePrompt: "Bold disruptive startup brand moodboard, dark black background, neon yellow and hot pink accents, electric glow effects, youth culture energy, tech startup disruptive aesthetic, neon signage, vibrant urban photography, 16:9",
  },
  scandinavian: {
    name: "Scandinavian",
    tagline: "Hygge · Natural · Balanced",
    palette: [
      { name: "Birch White", hex: "#F7F4EF", role: "Background" },
      { name: "Forest", hex: "#2D4A3E", role: "Primary Text" },
      { name: "Sage", hex: "#8FAF8F", role: "Natural Accent" },
      { name: "Warm Linen", hex: "#E8DFD0", role: "Secondary Surface" },
      { name: "Slate Blue", hex: "#4A6FA5", role: "Calm Accent" },
    ],
    typography: { headline: "Josefin Sans", body: "Lato", style: "Nordic Geometric" },
    keywords: ["Hygge", "Functional Beauty", "Nature", "Calm", "Sustainable"],
    gradient: "linear-gradient(135deg, #F7F4EF 0%, #E8DFD0 100%)",
    accentGradient: "linear-gradient(90deg, #2D4A3E, #8FAF8F)",
    texture: "Raw wood · Linen fabric · Ceramic matte · Natural stone",
    imagePrompt: "Scandinavian minimalist brand moodboard, birch white background, forest green and sage accents, natural wood textures, linen fabric details, hygge lifestyle photography, Nordic design aesthetic, warm and calm composition, 16:9",
  },
  softPastel: {
    name: "Soft Pastel",
    tagline: "Gentle · Joyful · Nurturing",
    palette: [
      { name: "Blush", hex: "#FDDDE6", role: "Primary Surface" },
      { name: "Lavender", hex: "#E8D5F5", role: "Secondary Surface" },
      { name: "Mint", hex: "#D5F5E3", role: "Tertiary" },
      { name: "Peach", hex: "#FFE4CC", role: "Warm Accent" },
      { name: "Slate Rose", hex: "#8B5A6A", role: "Text" },
    ],
    typography: { headline: "Nunito", body: "Nunito Sans", style: "Soft Rounded" },
    keywords: ["Warmth", "Gentle", "Creative", "Joyful", "Personal"],
    gradient: "linear-gradient(135deg, #FDDDE6 0%, #E8D5F5 50%, #D5F5E3 100%)",
    accentGradient: "linear-gradient(90deg, #FDDDE6, #E8D5F5)",
    texture: "Watercolor paper · Soft brushstrokes · Delicate patterns",
    imagePrompt: "Soft pastel brand moodboard, blush pink and lavender gradient background, watercolor paper textures, gentle botanical illustrations, feminine and nurturing lifestyle photography, soft diffused lighting, delicate floral elements, 16:9",
  },
  corporate: {
    name: "Corporate Pro",
    tagline: "Trustworthy · Structured · Global",
    palette: [
      { name: "Corporate Blue", hex: "#003580", role: "Primary Brand" },
      { name: "Warm White", hex: "#FDFCFB", role: "Background" },
      { name: "Steel Blue", hex: "#4A7FC1", role: "Secondary Accent" },
      { name: "Charcoal", hex: "#2C3E50", role: "Text" },
      { name: "Sky Gray", hex: "#ECF3FB", role: "Surface" },
    ],
    typography: { headline: "Arial", body: "Georgia", style: "Corporate Standard" },
    keywords: ["Professional", "Global", "Reliable", "Structured", "Leadership"],
    gradient: "linear-gradient(135deg, #003580 0%, #1a4d99 100%)",
    accentGradient: "linear-gradient(90deg, #003580, #4A7FC1)",
    texture: "Embossed paper · Clean grid · Professional photography",
    imagePrompt: "Corporate professional brand moodboard, deep corporate blue background, clean structured grid layout, professional business photography, global enterprise aesthetic, formal and trustworthy visual language, 16:9",
  },
  lifestyle: {
    name: "Lifestyle",
    tagline: "Real · Warm · Community",
    palette: [
      { name: "Sunset Orange", hex: "#F4845F", role: "Energy Color" },
      { name: "Earth Brown", hex: "#6B4226", role: "Grounded Text" },
      { name: "Golden Hour", hex: "#F6C26A", role: "Warm Accent" },
      { name: "Cream", hex: "#FFF8F0", role: "Background" },
      { name: "Deep Teal", hex: "#1B6CA8", role: "Cool Balance" },
    ],
    typography: { headline: "Poppins", body: "Open Sans", style: "Friendly Modern" },
    keywords: ["Authentic", "Aspirational", "Real Moments", "Community", "Everyday Joy"],
    gradient: "linear-gradient(135deg, #FFF8F0 0%, #F4845F 100%)",
    accentGradient: "linear-gradient(90deg, #F4845F, #F6C26A)",
    texture: "Linen textures · Golden hour photography · Real moments",
    imagePrompt: "Lifestyle brand moodboard, golden hour warm lighting, sunset orange and cream tones, authentic candid lifestyle photography, real community moments, warm earthy textures, joyful and aspirational visual storytelling, 16:9",
  },
};

export async function POST(req: Request) {
  try {
    const { style, brandName, industry, brandPersonality, brandValues, usp, generateImage } = await req.json();

    if (!style) {
      return NextResponse.json({ error: "Moodboard style is required" }, { status: 400 });
    }

    const styleDef = MOODBOARD_STYLES[style];
    if (!styleDef) {
      return NextResponse.json({ error: "Invalid moodboard style" }, { status: 400 });
    }

    // If generateImage is false (or not provided), just return the style definition
    if (!generateImage) {
      return NextResponse.json({
        style,
        styleDef,
        brandName,
        generatedImageUrl: null,
        imagePrompt: null,
        approvedAt: null,
      });
    }

    // === Real Fal.ai Image Generation ===
    const falApiKey = process.env.FAL_API_KEY;
    if (!falApiKey) {
      return NextResponse.json({ error: "FAL_API_KEY is not configured" }, { status: 500 });
    }

    // Build a rich, brand-specific prompt
    const brandContext = [
      brandName ? `Brand: "${brandName}"` : null,
      industry ? `Industry: ${industry}` : null,
      brandPersonality ? `Brand personality: ${brandPersonality}` : null,
      brandValues && Array.isArray(brandValues) && brandValues.length > 0 ? `Core values: ${brandValues.slice(0, 3).join(", ")}` : null,
      usp ? `USP: ${usp}` : null,
    ].filter(Boolean).join(". ");

    const fullPrompt = `${styleDef.imagePrompt}. ${brandContext}. ${styleDef.keywords.join(", ")} aesthetic. Professional brand photography, commercial quality, studio lighting, no text overlays, no logos, pure visual mood inspiration.`;

    // Call fal.ai sync endpoint (fal.run for synchronous, queue.fal.run for async)
    // We use fal.run which waits for result directly
    const falResponse = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        "Authorization": `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: "landscape_16_9",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
        output_format: "jpeg",
      }),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      console.error("Fal.ai API error:", errText);
      // Return style info without image rather than failing entirely
      return NextResponse.json({
        style,
        styleDef,
        brandName,
        generatedImageUrl: null,
        imagePrompt: fullPrompt,
        approvedAt: null,
        error: `Fal.ai generation failed: ${falResponse.status}`,
      });
    }

    const falResult = await falResponse.json();

    // fal.ai response structure: { images: [{ url: "...", ... }] }
    const generatedImageUrl = falResult?.images?.[0]?.url || null;

    return NextResponse.json({
      style,
      styleDef,
      brandName,
      generatedImageUrl,
      imagePrompt: fullPrompt,
      approvedAt: null,
    });

  } catch (error: any) {
    console.error("Moodboard generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate moodboard" }, { status: 500 });
  }
}

export async function GET() {
  // Return all available style definitions for the picker
  return NextResponse.json({
    styles: Object.entries(MOODBOARD_STYLES).map(([id, style]) => ({
      id,
      name: style.name,
      tagline: style.tagline,
      gradient: style.gradient,
      accentGradient: style.accentGradient,
      palette: style.palette.slice(0, 3),
      keywords: style.keywords,
    })),
  });
}
