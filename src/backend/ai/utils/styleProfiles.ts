export function getContrastColor(hex: string): string {
  if (!hex) return "#FFFFFF";
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  if (cleanHex.length !== 6) return "#FFFFFF";
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "#FFFFFF";
  
  const fn = (c: number) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  
  const luminance = 0.2126 * fn(r) + 0.7152 * fn(g) + 0.0722 * fn(b);
  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}

export function blendColors(hexBg: string, hexPrimary: string, ratio: number = 0.08): string {
  const parseHex = (hex: string) => {
    let clean = hex.replace("#", "").trim();
    if (clean.length === 3) {
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  };

  const bg = parseHex(hexBg) || { r: 0, g: 0, b: 0 };
  const prim = parseHex(hexPrimary) || { r: 255, g: 184, b: 0 };

  const r = Math.round(bg.r * (1 - ratio) + prim.r * ratio);
  const g = Math.round(bg.g * (1 - ratio) + prim.g * ratio);
  const b = Math.round(bg.b * (1 - ratio) + prim.b * ratio);

  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const CURATED_PHOTOS: Record<string, string[]> = {
  tech: [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1080&auto=format&fit=crop", // code editor
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1080&auto=format&fit=crop", // laptop and coffee
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1080&auto=format&fit=crop", // code on screen
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1080&auto=format&fit=crop", // html tag code
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=1080&auto=format&fit=crop", // Macbook coding
    "https://images.unsplash.com/photo-1580894732444-8fecef2271ff?q=80&w=1080&auto=format&fit=crop", // coding desk setup
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1080&auto=format&fit=crop", // green matrix code
    "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1080&auto=format&fit=crop", // programmer coding
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1080&auto=format&fit=crop"  // tech motherboard cyber
  ],
  workspace: [
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1080&auto=format&fit=crop", // clean desk setup
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1080&auto=format&fit=crop", // minimalist conference room
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1080&auto=format&fit=crop", // modern office reception
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1080&auto=format&fit=crop", // coworking space
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1080&auto=format&fit=crop", // office setup
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1080&auto=format&fit=crop", // workspace workstation
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1080&auto=format&fit=crop", // creative group work
    "https://images.unsplash.com/photo-1531535934200-87342993049b?q=80&w=1080&auto=format&fit=crop"  // modern office window desk
  ],
  design: [
    "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=1080&auto=format&fit=crop", // creative colors
    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1080&auto=format&fit=crop", // drawing tablet
    "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=1080&auto=format&fit=crop", // design monitor
    "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1080&auto=format&fit=crop", // UX design sketch
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080&auto=format&fit=crop", // abstract painting
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1080&auto=format&fit=crop"  // UI elements screen
  ],
  analytics: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop", // financial chart laptop
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080&auto=format&fit=crop", // charts on tablet
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1080&auto=format&fit=crop", // stock dashboard
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1080&auto=format&fit=crop", // crypto stocks
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1080&auto=format&fit=crop"  // office presentation analytics
  ],
  finance: [
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1080&auto=format&fit=crop", // financial planning
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1080&auto=format&fit=crop", // money coins growth
    "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=1080&auto=format&fit=crop", // financial graphs
    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=1080&auto=format&fit=crop"  // piggy bank and budget
  ],
  meeting: [
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1080&auto=format&fit=crop", // creative meeting
    "https://images.unsplash.com/photo-1531539738883-fb4c7159a2e6?q=80&w=1080&auto=format&fit=crop", // team presentation
    "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?q=80&w=1080&auto=format&fit=crop", // business meeting
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1080&auto=format&fit=crop"  // group collaboration
  ],
  medical: [
    "https://images.unsplash.com/photo-1584515901407-d8f469399991?q=80&w=1080&auto=format&fit=crop", // medical lab test
    "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1080&auto=format&fit=crop", // stethoscope doctor
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1080&auto=format&fit=crop"  // hospital laboratory
  ],
  education: [
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1080&auto=format&fit=crop", // library books
    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1080&auto=format&fit=crop", // study workspace
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1080&auto=format&fit=crop"  // student workspace
  ],
  abstract: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop", // blue pink abstract
    "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1080&auto=format&fit=crop", // aesthetic abstract art
    "https://images.unsplash.com/photo-1618005198143-e528346d9a59?q=80&w=1080&auto=format&fit=crop", // gradient waves
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1080&auto=format&fit=crop"  // neon geometry
  ]
};

export function getFallbackImage(query: string): string {
  if (!query) {
    const list = CURATED_PHOTOS.abstract;
    return list[Math.floor(Math.random() * list.length)];
  }
  const q = query.toLowerCase();
  if (q.includes("tech") || q.includes("code") || q.includes("developer") || q.includes("program") || q.includes("computer")) {
    return CURATED_PHOTOS.tech[Math.floor(Math.random() * CURATED_PHOTOS.tech.length)];
  }
  if (q.includes("office") || q.includes("workspace") || q.includes("desk")) {
    return CURATED_PHOTOS.workspace[Math.floor(Math.random() * CURATED_PHOTOS.workspace.length)];
  }
  if (q.includes("design") || q.includes("creative") || q.includes("art")) {
    return CURATED_PHOTOS.design[Math.floor(Math.random() * CURATED_PHOTOS.design.length)];
  }
  if (q.includes("analytics") || q.includes("chart") || q.includes("data")) {
    return CURATED_PHOTOS.analytics[Math.floor(Math.random() * CURATED_PHOTOS.analytics.length)];
  }
  if (q.includes("finance") || q.includes("money") || q.includes("business")) {
    return CURATED_PHOTOS.finance[Math.floor(Math.random() * CURATED_PHOTOS.finance.length)];
  }
  if (q.includes("meeting") || q.includes("team") || q.includes("group")) {
    return CURATED_PHOTOS.meeting[Math.floor(Math.random() * CURATED_PHOTOS.meeting.length)];
  }
  if (q.includes("medical") || q.includes("health") || q.includes("doctor")) {
    return CURATED_PHOTOS.medical[Math.floor(Math.random() * CURATED_PHOTOS.medical.length)];
  }
  if (q.includes("education") || q.includes("learn") || q.includes("book")) {
    return CURATED_PHOTOS.education[Math.floor(Math.random() * CURATED_PHOTOS.education.length)];
  }
  
  // Custom queries fall back to dynamic LoremFlickr search instead of abstract wallpapers
  const tags = query.trim().replace(/\s+/g, " ").split(" ").map(encodeURIComponent).join(",");
  const cacheBuster = Math.floor(Math.random() * 1000000);
  return `https://loremflickr.com/1080/1080/${tags}?random=${cacheBuster}`;
}

export async function resolveInitialImage(industry: string, topic: string, imageKeywords?: string): Promise<{ url: string; query: string }> {
  let queryTerm = "";
  try {
    if (imageKeywords && imageKeywords.trim()) {
      const tags = imageKeywords.split(/[\s,]+/).filter(Boolean);
      queryTerm = tags.join(" ");
    } else {
      const cleanIndustry = (industry || "").trim().replace(/[^a-zA-Z0-9\s]/g, "");
      if (cleanIndustry) {
        queryTerm = cleanIndustry;
      } else {
        const words = topic.trim().replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);
        queryTerm = words.slice(0, 2).join(" ");
      }
    }

    let finalQuery = queryTerm;
    const lowerQuery = queryTerm.toLowerCase();
    if (lowerQuery.includes("tech agency") || lowerQuery === "tech" || lowerQuery.includes("agency") || lowerQuery === "webs" || lowerQuery === "website") {
      finalQuery = "tech workspace laptop coding";
    } else if (lowerQuery.includes("coding") || lowerQuery.includes("programming") || lowerQuery.includes("developer")) {
      finalQuery = "developer coding workspace";
    }

    const cleanQuery = encodeURIComponent(finalQuery.substring(0, 80));
    const searchUrl = `https://unsplash.com/napi/search/photos?query=${cleanQuery}&per_page=15&orientation=landscape`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const limit = Math.min(data.results.length, 8);
        const randomIndex = Math.floor(Math.random() * limit);
        const photo = data.results[randomIndex];
        const rawUrl = photo.urls?.raw || photo.urls?.regular;
        if (rawUrl) {
          const finalUrl = `${rawUrl.split('?')[0]}?q=80&w=1080&auto=format&fit=crop`;
          return { url: finalUrl, query: queryTerm };
        }
      }
    }
  } catch (err) {
    console.error("Resolve initial image failed:", err);
  }
  return { url: getFallbackImage(queryTerm), query: queryTerm || `${industry} ${topic}`.trim() };
}


export function getBgStyleForSlide(index: number): string {
  const transforms = [
    { scale: 1.25, rotate: 0, origin: "center", position: "center" },
    { scale: 1.4, rotate: 5, origin: "top left", position: "top left" },
    { scale: 1.35, rotate: -6, origin: "bottom right", position: "bottom right" },
    { scale: 1.45, rotate: 10, origin: "center", position: "center" },
    { scale: 1.3, rotate: -5, origin: "top right", position: "top right" },
    { scale: 1.5, rotate: 8, origin: "bottom left", position: "bottom left" },
    { scale: 1.28, rotate: -10, origin: "center", position: "center" },
  ];
  const t = transforms[index % transforms.length];
  return `background-image: var(--bg-image); opacity: var(--bg-opacity, 0.08); background-size: cover; background-position: ${t.position}; transform: scale(${t.scale}) rotate(${t.rotate}deg); transform-origin: ${t.origin}; -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 80%); mask-image: radial-gradient(circle at center, black 30%, transparent 80%); position: absolute; inset: 0px; pointer-events: none; z-index: 0;`;
}

export function getStyleProfile(vibe: string) {
  const v = vibe.toLowerCase().trim();
  if (v === "luxury") {
    return {
      fontName: "Editorial Luxury",
      headingClass: "font-cormorant font-normal italic",
      bodyClass: "font-outfit font-light",
      headingDesc: "Elegant, high-end editorial serif. Headings should feel like a premium print magazine, often with sentence-case italicized accents. NEVER use all-caps uppercase.",
      bodyDesc: "Sleek, high-fashion sans-serif. Always use small sizes like text-[13px] md:text-sm.",
      borderClass: "border border-black/10 rounded-none",
      cardClass: "bg-black/[0.02] border border-black/5 rounded-none",
      bgStyle: "radial-gradient",
      layoutStyle: "Ultra-premium minimal editorial. Focus on asymmetrical layouts, huge margins, elegant italic subtitles, and clean single-column or split text."
    };
  } else if (v === "editorial") {
    return {
      fontName: "Editorial Luxury",
      headingClass: "font-cormorant font-normal",
      bodyClass: "font-outfit font-light",
      headingDesc: "Sophisticated editorial serif. Headings should look like newspaper or magazine titles.",
      bodyDesc: "Clean sans-serif. Always use small sizes like text-[13px] md:text-sm.",
      borderClass: "border-b border-black/20 pb-2",
      cardClass: "border-l-4 border-black/40 pl-4 py-2 bg-transparent rounded-none",
      bgStyle: "linear-gradient-vertical",
      layoutStyle: "Magazine editorial. Use two-column text splits (left column for title, right column for cards), large blockquotes, and fine horizontal divider lines."
    };
  } else if (v === "minimal") {
    return {
      fontName: "Tech Minimalist",
      headingClass: "font-space font-bold tracking-tight uppercase",
      bodyClass: "font-outfit font-normal",
      headingDesc: "Modern, clean, geometric sans-serif. Keep headings short and sharp.",
      bodyDesc: "Sleek, clean sans-serif. Always use small sizes like text-[13px] md:text-sm.",
      borderClass: "border-none",
      cardClass: "bg-black/[0.03] border-none rounded-none",
      bgStyle: "solid",
      layoutStyle: "Ultra-minimalist layout. No borders, no divider lines. Pure whitespace, tiny labels, and clean text blocks aligned in a single axis."
    };
  } else if (v === "bold") {
    return {
      fontName: "Bold Impact",
      headingClass: "font-syne font-extrabold uppercase tracking-tight leading-none",
      bodyClass: "font-space font-medium",
      headingDesc: "Wide, heavy, highly expressive display font. Headings must be uppercase, loud, and short (3-5 words max).",
      bodyDesc: "Clean geometric sans-serif. Always use text-sm.",
      borderClass: "border-4 border-black",
      cardClass: "border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      bgStyle: "linear-gradient-diagonal",
      layoutStyle: "Neobrutalist style. Solid thick black borders, heavy uppercase titles, cards with sharp black offset shadows, raw blocks."
    };
  } else if (v === "playful") {
    return {
      fontName: "Trendy Condense",
      headingClass: "font-bricolage font-black tracking-tight uppercase",
      bodyClass: "font-outfit font-normal",
      headingDesc: "Bold, condensed, modern startup sans-serif.",
      bodyDesc: "Sleek, rounded feel sans-serif. Always use text-[13px] md:text-sm.",
      borderClass: "border border-black/30 rounded-full px-3 py-1",
      cardClass: "bg-black/[0.04] border border-black/10 rounded-2xl p-5",
      bgStyle: "radial-gradient",
      layoutStyle: "Modern friendly startup. Soft rounded-2xl corners on cards, badges with pill-shaped rounded borders, and playful color gradients."
    };
  } else {
    // raw or default
    return {
      fontName: "Raw Industrial",
      headingClass: "font-syne font-bold uppercase tracking-tight",
      bodyClass: "font-space font-normal",
      headingDesc: "Heavy industrial display font. Headings should feel structural.",
      bodyDesc: "Monospace/geometric style sans-serif. Always use text-[13px] md:text-sm.",
      borderClass: "border-2 border-black",
      cardClass: "border-2 border-black bg-transparent rounded-none",
      bgStyle: "linear-gradient-vertical",
      layoutStyle: "Raw/code aesthetic. Use grid lines, monospace badges, thin divider lines, and code-like structures."
    };
  }
}

