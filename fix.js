const fs = require('fs');
['src/backend/ai/generators/CarouselGenerator.ts', 'src/backend/ai/generators/ImageGenerator.ts'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`').replace(/\\\$\{/g, '${');
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});
