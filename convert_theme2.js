const fs = require('fs');

function convertTheme(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Text colors
  content = content.replace(/text-gray-900/g, 'text-[#E1E0CC]');
  content = content.replace(/text-gray-800/g, 'text-[#E1E0CC]');
  content = content.replace(/text-gray-700/g, 'text-[#E1E0CC]/80');
  content = content.replace(/text-gray-600/g, 'text-[#E1E0CC]/70');
  content = content.replace(/text-gray-500/g, 'text-[#E1E0CC]/60');
  content = content.replace(/text-gray-400/g, 'text-[#E1E0CC]/50');
  
  // Backgrounds
  content = content.replace(/bg-white/g, 'bg-[#0A0A0A]');
  content = content.replace(/bg-gray-50/g, 'bg-black');
  content = content.replace(/bg-gray-100/g, 'bg-[#E1E0CC]/10');
  content = content.replace(/bg-gray-200/g, 'bg-[#E1E0CC]/20');
  content = content.replace(/bg-gray-800/g, 'bg-[#E1E0CC]/90');
  content = content.replace(/bg-gray-900/g, 'bg-[#E1E0CC]');
  
  // Borders
  content = content.replace(/border-gray-100/g, 'border-[#E1E0CC]/10');
  content = content.replace(/border-gray-200/g, 'border-[#E1E0CC]/15');
  content = content.replace(/border-gray-300/g, 'border-[#E1E0CC]/20');
  content = content.replace(/border-gray-700/g, 'border-[#E1E0CC]/40');
  content = content.replace(/border-gray-800/g, 'border-[#E1E0CC]/50');
  
  // Hover states text
  content = content.replace(/hover:text-gray-900/g, 'hover:text-[#E1E0CC]');
  content = content.replace(/hover:text-gray-700/g, 'hover:text-[#E1E0CC]/80');
  
  // Hover states bg
  content = content.replace(/hover:bg-gray-50/g, 'hover:bg-[#E1E0CC]/5');
  content = content.replace(/hover:bg-gray-100/g, 'hover:bg-[#E1E0CC]/10');
  content = content.replace(/hover:bg-gray-800/g, 'hover:bg-[#E1E0CC]/80');
  
  // Focus rings
  content = content.replace(/focus:ring-gray-200/g, 'focus:ring-[#E1E0CC]/20');
  content = content.replace(/focus:border-black/g, 'focus:border-[#E1E0CC]/50');
  
  // Other stuff
  content = content.replace(/shadow-sm/g, 'shadow-none');
  content = content.replace(/shadow-md/g, 'shadow-none');
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated theme for ${filePath}`);
}

convertTheme('src/app/dashboard/page.tsx');
