const fs = require('fs');
const content = fs.readFileSync('src/backend/ai/utils/htmlTemplates.ts', 'utf8');
const classRegex = /class="([^"]+)"/g;
let match;
const classes = new Set();
while ((match = classRegex.exec(content)) !== null) {
  match[1].split(' ').forEach(c => {
    if (c && !c.includes('${')) classes.add(c);
  });
}
const classList = Array.from(classes).join(' ');
fs.writeFileSync('src/components/TailwindCache.tsx', `export default function TailwindCache() { return <div className="hidden ${classList}"></div>; }`);
console.log('Created TailwindCache.tsx with classes:', classList);
