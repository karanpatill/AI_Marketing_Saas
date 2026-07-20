const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  // Just remove the markdown code block line entirely to avoid any escaping issues
  content = content.replace(/Do not include markdown code block formatting.*?json\)\./g, "Do not include markdown code block formatting.");
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

fixFile('src/backend/ai/generators/CarouselGenerator.ts');
fixFile('src/backend/ai/generators/ImageGenerator.ts');
