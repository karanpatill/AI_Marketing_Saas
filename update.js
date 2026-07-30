
const fs = require("fs");
let content = fs.readFileSync("src/backend/ai/utils/htmlTemplates.ts", "utf8");

const newBrutalism = `
// 2. BRUTALISM
export function renderBrutalism(opt: TemplateOptions): string {
  const { title, content, category, brandName, website, primaryColor, secondaryColor, textColor, isLightBg, headlineFontStyle, bodyFontStyle, fontImportCss, aspectRatio, slideNum, totalSlides, bgImageUrl, logoUrl } = opt;
  const isCarousel = !!slideNum;
  
  // Brutalism needs high contrast. If the background is dark, we use light borders/shadows, and vice-versa.
  const borderColor = textColor;
  const shadowColor = primaryColor !== secondaryColor ? primaryColor : textColor;
  
  return \`
    \${fontImportCss ? \\\`<style>\${fontImportCss}</style>\\\` : ""}
    <div class="relative w-full h-full overflow-hidden flex flex-col justify-between p-8" style="background-color: \${secondaryColor}; color: \${textColor}; aspect-ratio: \${aspectRatio.replace(":", "/")}; border: 12px solid \${borderColor}">
      
      <!-- Background Graphic (Subtle large type behind everything) -->
      <div class="absolute inset-0 opacity-15 flex flex-col justify-between p-12 overflow-hidden pointer-events-none z-0">
        <div class="text-[30vw] leading-none font-black uppercase whitespace-nowrap" style="-webkit-text-stroke: 4px \${textColor}; color: transparent; \${headlineFontStyle}">
          \${category.substring(0, 5)}
        </div>
        <div class="text-[30vw] leading-none font-black uppercase whitespace-nowrap text-right" style="-webkit-text-stroke: 4px \${textColor}; color: transparent; \${headlineFontStyle}">
          \${(slideNum || "01").toString().padStart(2, "0")}
        </div>
      </div>
      
      <!-- Top Bar -->
      <div class="relative z-20 flex justify-between items-start w-full">
        <div class="flex flex-col gap-2">
          \${logoUrl ? \\\`<img src="\${logoUrl}" alt="\${brandName}" class="h-10 w-auto max-h-12 object-contain max-w-[160px] filter \${!isLightBg ? "invert" : ""}" />\\\` : \\\`<span class="font-black text-3xl uppercase tracking-tighter">\${brandName}</span>\\\`}
          <span class="inline-block mt-2 font-mono text-xs uppercase tracking-widest px-2 py-1" style="background-color: \${textColor}; color: \${secondaryColor}">
            SYS. // \${category}
          </span>
        </div>
        
        <div class="font-mono text-2xl font-bold uppercase px-4 py-2" style="border: 4px solid \${borderColor}; box-shadow: 6px 6px 0 0 \${shadowColor}; background-color: \${secondaryColor};">
          \${isCarousel ? \\\`\${slideNum} / \${totalSlides}\\\` : "01"}
        </div>
      </div>
      
      <!-- Main Content Area -->
      <div class="relative z-20 w-full mt-auto mb-16 flex flex-col gap-6">
        <div class="w-full p-8" style="border: 6px solid \${borderColor}; box-shadow: 16px 16px 0 0 \${shadowColor}; background-color: \${secondaryColor};">
          <h2 class="text-5xl md:text-[5.5rem] font-bold uppercase leading-[1.05] tracking-tight" style="\${headlineFontStyle}">
            \${title}
          </h2>
        </div>
        
        \${content ? \\\`<div class="w-[85%] self-end p-6" style="border: 4px solid \${borderColor}; box-shadow: -10px 10px 0 0 \${shadowColor}; background-color: \${secondaryColor};">
          <p class="text-xl md:text-2xl font-medium leading-snug" style="\${bodyFontStyle}">\${content}</p>
        </div>\\\` : ""}
      </div>
      
      <!-- Bottom Bar -->
      <div class="relative z-20 w-full flex justify-between items-end">
        <div class="w-16 h-16 flex items-center justify-center" style="border: 4px solid \${borderColor}; box-shadow: 4px 4px 0 0 \${shadowColor}; background-color: \${secondaryColor};">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="color: \${textColor}">
            <path d="M5 19L19 5M19 5H9M19 5V15"/>
          </svg>
        </div>
        <div class="font-mono font-bold uppercase tracking-widest text-sm px-4 py-2" style="border: 3px solid \${borderColor}; background-color: \${textColor}; color: \${secondaryColor};">
          \${website || brandName}
        </div>
      </div>
    </div>
  \`;
}
`;

const startIdx = content.indexOf("// 2. BRUTALISM");
const endIdx = content.indexOf("// 3. MINIMALISM");

const newContent = content.substring(0, startIdx) + newBrutalism + "\n" + content.substring(endIdx);
fs.writeFileSync("src/backend/ai/utils/htmlTemplates.ts", newContent);
console.log("Replaced successfully");

