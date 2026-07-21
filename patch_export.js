const fs = require('fs');
const content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf-8');

let newContent = content.replace('import WordsPullUp from "@/components/ui/WordsPullUp";', 'import WordsPullUp from "@/components/ui/WordsPullUp";\nimport { toJpeg } from "html-to-image";\nimport { saveAs } from "file-saver";\nimport JSZip from "jszip";');

newContent = newContent.replace(`const blob = new Blob([generatedPostImage], { type: 'text/html' });
                              const url = URL.createObjectURL(blob);
                              window.open(url, '_blank');`, 
`const node = document.getElementById('single-post-export-node');
                              if (!node) return;
                              toJpeg(node, { quality: 1.0, pixelRatio: 2 }).then(dataUrl => {
                                saveAs(dataUrl, 'post-export.jpeg');
                              });`);

newContent = newContent.replace(`const blob = new Blob([slideHtml], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');`, 
`const node = document.getElementById(\`carousel-slide-export-node-\${index}\`);
                            if (!node) return;
                            toJpeg(node, { quality: 1.0, pixelRatio: 2 }).then(dataUrl => {
                              saveAs(dataUrl, \`carousel-slide-\${index + 1}.jpeg\`);
                            });`);

// Update single post div id
newContent = newContent.replace(
`dangerouslySetInnerHTML={{ __html: generatedPostImage }}
                            className="w-full h-full [&>div]:w-full [&>div]:h-full"`,
`id="single-post-export-node"
                            dangerouslySetInnerHTML={{ __html: generatedPostImage }}
                            className="w-full h-full [&>div]:w-full [&>div]:h-full"`);

// Update single post button text
newContent = newContent.replace(`Open HTML Render`, `Export JPEG`);

// Update carousel slide div id
newContent = newContent.replace(
`className="w-full h-full [&>div]:h-full [&>div]:w-full select-none"
                                dangerouslySetInnerHTML={{`,
`id={\`carousel-slide-export-node-\${index}\`}
                                className="w-full h-full [&>div]:h-full [&>div]:w-full select-none"
                                dangerouslySetInnerHTML={{`
);

// Update carousel slide button text
newContent = newContent.replace(`Open Slide Render`, `Export JPEG`);

fs.writeFileSync('src/app/dashboard/page.tsx', newContent);
console.log('patched');
