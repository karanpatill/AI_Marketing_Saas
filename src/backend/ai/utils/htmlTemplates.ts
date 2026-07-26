export interface TemplateOptions {
  brandName: string;
  website: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  isLightBg: boolean;
  fontImportCss: string;
  headlineFontStyle: string;
  bodyFontStyle: string;
  category: string;
  title: string;
  content: string;
  aspectRatio: string;
  slideNum?: string; // If it's a carousel
  totalSlides?: string;
  bgImageUrl?: string; // For layouts that support backgrounds
}

// Utility to replace color variables if needed, though we can just build the HTML directly
function getGridDotPattern(color: string) {
  return `background-image: radial-gradient(${color} 2px, transparent 2px); background-size: 24px 24px;`;
}

// 1. SWISS STYLE
export function renderSwissStyle(opt: TemplateOptions): string {
  const { title, content, category, brandName, website, primaryColor, secondaryColor, textColor, isLightBg, headlineFontStyle, bodyFontStyle, fontImportCss, aspectRatio, slideNum, totalSlides, bgImageUrl, logoUrl } = opt;
  const isCarousel = !!slideNum;
  const borderCol = isLightBg ? "border-black/20" : "border-white/20";
  const gridPattern = getGridDotPattern(isLightBg ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)");
  
  return `
    ${fontImportCss ? `<style>${fontImportCss}</style>` : ""}
    <div class="relative w-full h-full bg-[${secondaryColor}] text-[${textColor}] overflow-hidden flex flex-col p-12" style="background-color: ${secondaryColor}; color: ${textColor}; aspect-ratio: ${aspectRatio.replace(":", "/")};">
      <div class="absolute top-0 right-0 w-1/3 h-1/3" style="${gridPattern}"></div>
      
      ${bgImageUrl ? `<div class="absolute bottom-0 right-0 w-[45%] h-[60%] bg-cover bg-center grayscale opacity-80" style="background-image: url('${bgImageUrl}'); border-top: 1px solid ${textColor}; border-left: 1px solid ${textColor};"></div>` : ""}
      
      <div class="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[9px] tracking-[0.3em] uppercase font-mono opacity-50 flex gap-4">
        <span>${category || "STRATEGY"}</span>
        <span class="w-8 border-t border-current self-center"></span>
        <span>${brandName}</span>
      </div>

      <div class="w-full flex justify-between items-center z-10 border-b ${borderCol} pb-4 mb-12">
        <div class="flex items-center gap-3">
          ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="h-6 w-auto max-h-7 object-contain max-w-[110px]" />` : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M12 2v20"/></svg>`}
          <span class="text-[12px] uppercase font-bold tracking-widest">${brandName}</span>
        </div>
        <span class="text-[10px] uppercase tracking-widest opacity-70">${isCarousel ? `${slideNum} / ${totalSlides}` : "MARKETING INSIGHT"}</span>
      </div>

      <div class="flex-1 z-10 w-[85%] ml-12 pr-12 flex flex-col justify-center">
        <h2 class="text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-8" style="${headlineFontStyle}">
          ${title}
        </h2>
        ${content ? `<p class="text-xl md:text-2xl leading-relaxed opacity-80 w-3/4 border-l-2 pl-6" style="${bodyFontStyle}; border-color: ${primaryColor};">${content}</p>` : ""}
      </div>

      <div class="w-full flex justify-between items-end z-10 mt-auto border-t ${borderCol} pt-6 ml-12">
        <div class="w-16 h-16 flex items-center justify-center bg-[${textColor}] text-[${secondaryColor}]" style="background-color: ${textColor}; color: ${secondaryColor}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 19L19 5M19 5H9M19 5V15"/></svg>
        </div>
        <span class="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">${website || "ASENRA.IN"}</span>
      </div>
    </div>
  `;
}

// 2. BRUTALISM
export function renderBrutalism(opt: TemplateOptions): string {
  const { title, content, category, brandName, website, primaryColor, secondaryColor, textColor, isLightBg, headlineFontStyle, bodyFontStyle, fontImportCss, aspectRatio, slideNum, totalSlides, bgImageUrl, logoUrl } = opt;
  const isCarousel = !!slideNum;
  
  return `
    ${fontImportCss ? `<style>${fontImportCss}</style>` : ""}
    <div class="relative w-full h-full overflow-hidden flex flex-col justify-center items-center p-8" style="background-color: ${secondaryColor}; color: ${textColor}; aspect-ratio: ${aspectRatio.replace(":", "/")}; border: 8px solid ${textColor}">
      <div class="absolute inset-0 opacity-10 flex flex-col justify-center overflow-hidden pointer-events-none text-[20vw] leading-none font-black uppercase whitespace-nowrap" style="${headlineFontStyle}">
        <div class="animate-marquee">${category} ${category}</div>
        <div class="animate-marquee-reverse text-transparent" style="-webkit-text-stroke: 2px ${textColor}">${title.substring(0, 20)} ${title.substring(0, 20)}</div>
      </div>
      
      <div class="relative z-20 w-full max-w-[90%] bg-[${primaryColor}] text-white border-4 border-black p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)]" style="background-color: ${primaryColor}; color: #000; border-color: #000;">
        <div class="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
          <div class="flex items-center gap-3">
            ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="h-6 w-auto max-h-7 object-contain max-w-[110px]" />` : ""}
            <span class="font-black text-xl uppercase tracking-tighter">${brandName}</span>
          </div>
          <span class="bg-black text-white px-3 py-1 text-sm font-bold uppercase">${isCarousel ? `${slideNum}/${totalSlides}` : "VOL.01"}</span>
        </div>
        
        <h2 class="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-6" style="${headlineFontStyle}">
          ${title}
        </h2>
        
        ${content ? `<div class="bg-white border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] text-black">
          <p class="text-xl md:text-2xl font-bold leading-tight" style="${bodyFontStyle}">${content}</p>
        </div>` : ""}
      </div>
      
      <div class="absolute bottom-6 right-8 z-20 bg-black text-white border-2 border-black px-4 py-2 font-mono font-bold uppercase shadow-[4px_4px_0_0_rgba(255,255,255,1)]">
        ${website || brandName}
      </div>
    </div>
  `;
}

// 3. MINIMALISM
export function renderMinimalism(opt: TemplateOptions): string {
  const { title, content, category, brandName, website, primaryColor, secondaryColor, textColor, isLightBg, headlineFontStyle, bodyFontStyle, fontImportCss, aspectRatio, slideNum, totalSlides, bgImageUrl, logoUrl } = opt;
  const isCarousel = !!slideNum;
  
  return `
    ${fontImportCss ? `<style>${fontImportCss}</style>` : ""}
    <div class="relative w-full h-full overflow-hidden flex flex-col p-14" style="background-color: ${secondaryColor}; color: ${textColor}; aspect-ratio: ${aspectRatio.replace(":", "/")};">
      <div class="w-full flex justify-between items-start">
        <div class="flex items-center gap-3">
          ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="h-10 w-auto max-h-12 object-contain max-w-[180px]" />` : ""}
          <span class="text-sm tracking-widest uppercase opacity-50">${brandName}</span>
        </div>
        ${isCarousel ? `<span class="text-[10px] tracking-widest opacity-40">${slideNum}</span>` : ""}
      </div>

      <div class="flex-1 min-h-0 flex flex-col justify-center py-16 w-[88%]">
        <span class="text-xs tracking-[0.2em] uppercase mb-8" style="color: ${primaryColor}">— ${category}</span>
        <h2 class="text-7xl md:text-8xl font-light leading-[1.05] tracking-wide mb-10" style="${headlineFontStyle}">
          ${title}
        </h2>
        ${content ? `<p class="text-2xl md:text-3xl leading-relaxed opacity-70 font-light max-w-[92%]" style="${bodyFontStyle}">${content}</p>` : ""}
      </div>

      <div class="w-full flex justify-end items-end mt-auto">
        <span class="text-[9px] tracking-[0.3em] uppercase opacity-30">${website}</span>
      </div>
    </div>
  `;
}

// 4. LUXURY
export function renderLuxury(opt: TemplateOptions): string {
  const { title, content, category, brandName, website, primaryColor, secondaryColor, textColor, isLightBg, headlineFontStyle, bodyFontStyle, fontImportCss, aspectRatio, slideNum, totalSlides, bgImageUrl, logoUrl } = opt;
  const isCarousel = !!slideNum;
  const borderColor = isLightBg ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)";
  
  return `
    ${fontImportCss ? `<style>${fontImportCss}</style>` : ""}
    <div class="relative w-full h-full overflow-hidden flex flex-col p-8" style="background-color: ${secondaryColor}; color: ${textColor}; aspect-ratio: ${aspectRatio.replace(":", "/")};">
      <div class="w-full h-full border p-8 flex flex-col relative" style="border-color: ${borderColor};">
        
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[${secondaryColor}] px-6 flex items-center gap-3" style="background-color: ${secondaryColor}">
          ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="h-5 w-auto max-h-6 object-contain max-w-[100px]" />` : ""}
          <span class="text-[10px] tracking-[0.4em] uppercase font-light">${brandName}</span>
        </div>

        <div class="flex-1 flex flex-col justify-center items-center text-center max-w-[85%] mx-auto">
          <span class="text-[9px] tracking-[0.3em] uppercase italic opacity-60 mb-8" style="color: ${primaryColor}">${category}</span>
          
          <h2 class="text-5xl md:text-6xl font-serif leading-[1.15] mb-8" style="${headlineFontStyle}">
            ${title}
          </h2>
          
          ${content ? `
            <div class="w-12 h-[1px] mb-8 mx-auto" style="background-color: ${primaryColor}"></div>
            <p class="text-lg md:text-xl leading-loose opacity-70 font-light" style="${bodyFontStyle}">${content}</p>
          ` : ""}
        </div>

        ${isCarousel ? `
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[${secondaryColor}] px-6" style="background-color: ${secondaryColor}">
          <span class="text-[9px] tracking-[0.2em] font-serif italic opacity-50">${slideNum} / ${totalSlides}</span>
        </div>
        ` : `
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[${secondaryColor}] px-6" style="background-color: ${secondaryColor}">
          <span class="text-[9px] tracking-[0.3em] uppercase font-light opacity-50">${website}</span>
        </div>
        `}
      </div>
    </div>
  `;
}

// 5. BLUEPRINT
export function renderBlueprint(opt: TemplateOptions): string {
  const { title, content, category, brandName, website, primaryColor, secondaryColor, textColor, isLightBg, headlineFontStyle, bodyFontStyle, fontImportCss, aspectRatio, slideNum, totalSlides, bgImageUrl, logoUrl } = opt;
  const isCarousel = !!slideNum;
  const gridLine = isLightBg ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const blueprintBg = `background-image: linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px); background-size: 40px 40px;`;
  
  return `
    ${fontImportCss ? `<style>${fontImportCss}</style>` : ""}
    <div class="relative w-full h-full overflow-hidden flex flex-col p-10 font-mono" style="background-color: ${secondaryColor}; color: ${textColor}; ${blueprintBg} aspect-ratio: ${aspectRatio.replace(":", "/")};">
      
      <div class="w-full flex justify-between items-center border-b-2 pb-4" style="border-color: ${textColor}">
        <div class="flex items-center gap-4">
          ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="h-6 w-auto max-h-7 object-contain max-w-[110px]" />` : ""}
          <div class="flex flex-col">
            <span class="text-sm font-bold tracking-widest">${brandName}</span>
            <span class="text-[9px] opacity-60">SYS.ID: ${Math.floor(Math.random()*10000)}</span>
          </div>
        </div>
        <div class="text-right flex flex-col">
          <span class="text-[10px] tracking-widest opacity-80" style="color: ${primaryColor}">[ ${category} ]</span>
          ${isCarousel ? `<span class="text-[9px] opacity-60 mt-1">SEQ: ${slideNum}/${totalSlides}</span>` : ""}
        </div>
      </div>

      <div class="flex-1 flex flex-col justify-center py-10 relative">
        <div class="absolute left-0 top-1/4 w-4 h-4 border-l-2 border-t-2" style="border-color: ${primaryColor}"></div>
        <div class="absolute right-0 bottom-1/4 w-4 h-4 border-r-2 border-b-2" style="border-color: ${primaryColor}"></div>
        
        <h2 class="text-4xl md:text-5xl font-bold leading-snug tracking-tight mb-8 ml-8" style="${headlineFontStyle}">
          > ${title}
        </h2>
        
        ${content ? `
        <div class="ml-12 border-l border-dashed pl-6 py-2 opacity-80" style="border-color: ${textColor}">
          <p class="text-lg md:text-xl leading-relaxed" style="${bodyFontStyle}">${content}</p>
        </div>
        ` : ""}
      </div>

      <div class="w-full flex justify-between items-center border-t-2 pt-4" style="border-color: ${textColor}">
        <div class="flex gap-2 opacity-50">
          <div class="w-3 h-3 rounded-full" style="background-color: ${textColor}"></div>
          <div class="w-3 h-3 rounded-full border border-current"></div>
        </div>
        <span class="text-[10px] tracking-widest opacity-80">${website}</span>
      </div>
    </div>
  `;
}

// 6. GENERIC / DEFAULT
export function renderGeneric(opt: TemplateOptions): string {
  const { title, content, category, brandName, website, logoUrl, primaryColor, secondaryColor, textColor, isLightBg, headlineFontStyle, bodyFontStyle, fontImportCss, aspectRatio, slideNum, totalSlides, bgImageUrl } = opt;
  const isCarousel = !!slideNum;
  const borderCol = isLightBg ? "border-black/20" : "border-white/20";

  return `
    ${fontImportCss ? `<style>${fontImportCss}</style>` : ""}
    <div class="relative w-full h-full p-8 flex flex-col justify-between overflow-hidden" style="background-color: ${secondaryColor}; color: ${textColor}; aspect-ratio: ${aspectRatio.replace(":", "/")};">
      ${bgImageUrl ? `<div class="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style="background-image: url('${bgImageUrl}');"></div>` : ""}
      
      <div class="w-full flex justify-between items-center shrink-0 border-b ${borderCol} pb-2 z-10 gap-3">
        <div class="flex items-center gap-2.5">
          ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="h-6 w-auto max-h-7 object-contain max-w-[110px]" />` : ""}
          <span class="text-[10px] uppercase font-black tracking-widest" style="color: ${primaryColor}">${category || "INSIGHT"}</span>
        </div>
      </div>
      
      <div class="flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-4 gap-3 z-10 w-[90%]">
        <div class="w-8 h-1 rounded-full shrink-0" style="background-color: ${primaryColor};"></div>
        <h2 class="text-4xl md:text-5xl font-bold leading-tight" style="${headlineFontStyle}">${title}</h2>
        ${content ? `<p class="text-lg md:text-xl leading-relaxed opacity-80" style="${bodyFontStyle}">${content}</p>` : ""}
      </div>
      
      <div class="w-full flex justify-between items-center shrink-0 border-t ${borderCol} pt-2 z-10">
        ${isCarousel 
          ? `<span class="text-[10px] font-bold tracking-widest opacity-60">${slideNum} / ${totalSlides}</span>`
          : `<span class="text-[10px] uppercase font-bold tracking-[0.25em] opacity-60">${brandName.toUpperCase()}</span>`
        }
        <span class="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">${website.toUpperCase() || "@" + brandName.toLowerCase()}</span>
      </div>
    </div>
  `;
}

// Main Factory Function
export function getTemplateForLanguage(language: string, options: TemplateOptions): string {
  const normalized = language.toLowerCase();
  if (normalized.includes("swiss")) return renderSwissStyle(options);
  if (normalized.includes("brutal")) return renderBrutalism(options);
  if (normalized.includes("minimal")) return renderMinimalism(options);
  if (normalized.includes("luxur") || normalized.includes("premium") || normalized.includes("editorial")) return renderLuxury(options);
  if (normalized.includes("blueprint") || normalized.includes("tech")) return renderBlueprint(options);
  
  // Hand drawn, surreal, maximalism, etc can use generic for now or specific ones if added later
  return renderGeneric(options);
}
