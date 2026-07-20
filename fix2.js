const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  // First, find the prompt block and fix the backticks for json
  content = content.replace(/Do not include markdown code block formatting \(like (\`|\\`)+json\)\./g, "Do not include markdown code block formatting (like \\`\\`\\`json).");
  
  // Now fix the html template literal backticks which were accidentally unescaped or escaped incorrectly
  // We want: const html = `
  //          </div>\`;
  content = content.replace(/const html = (\\)?`/g, 'const html = `');
  content = content.replace(/<\/div>(\\)?`;/g, '</div>`;');
  content = content.replace(/<\/div>(\\)?\\`;/g, '</div>`;');
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

fixFile('src/backend/ai/generators/CarouselGenerator.ts');
fixFile('src/backend/ai/generators/ImageGenerator.ts');
