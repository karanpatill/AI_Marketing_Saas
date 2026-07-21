const fs = require('fs');
const content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf-8');

const targetStr = '<label className="text-gray-400 font-bold uppercase tracking-[0.2em] font-bold text-[#E1E0CC] text-xs block">Interactive Carousel Post Preview</label>';
const replacementStr = `<div className="flex justify-between items-center mb-2">
                          <label className="text-gray-400 font-bold uppercase tracking-[0.2em] font-bold text-[#E1E0CC] text-xs block mb-0">Interactive Carousel Post Preview</label>
                          <button 
                            onClick={async () => {
                              try {
                                const zip = new JSZip();
                                if (!carouselSlides) return;
                                for (let i = 0; i < carouselSlides.length; i++) {
                                  const node = document.getElementById(\`carousel-slide-export-node-\${i}\`);
                                  if (!node) continue;
                                  const dataUrl = await toJpeg(node, { quality: 1.0, pixelRatio: 2 });
                                  const base64Data = dataUrl.replace(/^data:image\\/(png|jpeg);base64,/, '');
                                  zip.file(\`slide-\${i + 1}.jpeg\`, base64Data, {base64: true});
                                }
                                const zipContent = await zip.generateAsync({type:'blob'});
                                saveAs(zipContent, 'carousel-export.zip');
                              } catch(e) { console.error(e); }
                            }}
                            className="text-[10px] bg-[#E1E0CC] text-black px-3 py-1.5 rounded-lg font-black tracking-widest uppercase hover:bg-white transition-all"
                          >Export All as ZIP</button>
                        </div>`;

const newContent = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/app/dashboard/page.tsx', newContent);
console.log('patched zip');
