"use client";

import { useEffect, useState } from "react";
import { toJpeg } from "html-to-image";
import { Loader2, Image as ImageIcon, Layers, Video, Download, ExternalLink, Calendar as CalendarIcon, Clock, Share2 } from "lucide-react";
import { format } from "date-fns";
import { LinkedInPublishModal } from "./LinkedInPublishModal";
import { FacebookPublishModal } from "./FacebookPublishModal";
import { InstagramPublishModal } from "./InstagramPublishModal";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

export function AssetsView({ workspaceId, refreshKey = 0 }: { workspaceId: string; refreshKey?: number }) {
  const getDimensionsForRatio = (ratio?: string) => {
    if (ratio === '9/16' || ratio === '9:16') return { width: 1080, height: 1920, tw: 'aspect-[9/16]' };
    if (ratio === '16/9' || ratio === '16:9') return { width: 1080, height: 607.5, tw: 'aspect-video' };
    if (ratio === '4/5' || ratio === '4:5') return { width: 1080, height: 1350, tw: 'aspect-[4/5]' };
    return { width: 1080, height: 1080, tw: 'aspect-square' };
  };
  const [activeSubTab, setActiveSubTab] = useState<"image" | "carousel" | "video">("image");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishModal, setPublishModal] = useState<{ open: boolean; asset: any | null }>({ open: false, asset: null });
  const [fbPublishModal, setFbPublishModal] = useState<{ open: boolean; asset: any | null }>({ open: false, asset: null });
  const [igPublishModal, setIgPublishModal] = useState<{ open: boolean; asset: any | null }>({ open: false, asset: null });

  useEffect(() => {
    fetchAssets(activeSubTab);
  }, [activeSubTab, workspaceId, refreshKey]);

  const fetchAssets = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assets?workspaceId=${workspaceId}&type=${type}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssets(data);
      } else {
        setAssets([]);
      }
    } catch (err) {
      console.error("Failed to fetch assets", err);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Shared helper: render HTML to base64 JPEG via client-side html-to-image
  const renderHtmlToImage = async (html: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.overflow = 'hidden';
      container.style.zIndex = '-9999';
      container.style.pointerEvents = 'none';

      const iframe = document.createElement('iframe');
      iframe.style.width = `${width}px`;
      iframe.style.height = `${height}px`;
      iframe.style.border = 'none';
      
      container.appendChild(iframe);
      document.body.appendChild(container);

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; padding: 0; width: ${width}px; height: ${height}px; overflow: hidden; background: white; }
  </style>
</head>
<body>
  <div style="width: ${width}px; height: ${height}px; overflow: hidden; position: relative; background: white;">
    ${html}
  </div>
</body>
</html>`;

      // Wait until iframe is ready
      iframe.onload = async () => {
        try {
          // Wait for Tailwind CDN and fonts to finish applying
          await new Promise(r => setTimeout(r, 1500));
          const body = iframe.contentWindow?.document.body;
          if (!body) throw new Error("Failed to get iframe body");

          const dataUrl = await toJpeg(body, { quality: 0.95, width, height, canvasWidth: width, canvasHeight: height });
          document.body.removeChild(container);
          resolve(dataUrl);
        } catch (err) {
          document.body.removeChild(container);
          reject(err);
        }
      };

      iframe.contentWindow?.document.open();
      iframe.contentWindow?.document.write(fullHtml);
      iframe.contentWindow?.document.close();
    });
  };

  const handlePublishToLinkedIn = async (asset: any, caption: string) => {
    const dim = getDimensionsForRatio(asset.metadata?.aspectRatio);
    let imageBase64: string | string[] = "";
    let videoUrl = "";

    if (activeSubTab === "video") {
      videoUrl = asset.metadata?.videoUrl || asset.file_url;
    } else if (activeSubTab === "carousel" && asset.metadata?.slides) {
      const b64Array = [];
      for (let i = 0; i < asset.metadata.slides.length; i++) {
        const slideHtml = typeof asset.metadata.slides[i] === "string" ? asset.metadata.slides[i] : asset.metadata.slides[i].html;
        if (slideHtml) {
          const b64 = await renderHtmlToImage(slideHtml, dim.width, dim.height);
          b64Array.push(b64);
        }
      }
      imageBase64 = b64Array;
    } else {
      const html = asset.metadata?.html || asset.metadata?.html_content;
      if (html && html !== "Generated Carousel") {
        imageBase64 = await renderHtmlToImage(html, dim.width, dim.height);
      } else if (asset.metadata?.imageUrl) {
        imageBase64 = asset.metadata.imageUrl;
      }
    }

    const res = await fetch("/api/social/linkedin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "publish",
        workspaceId,
        caption,
        ...(videoUrl ? { videoUrl } : { imageBase64 })
      })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to publish to LinkedIn");
    }
  };

  const handlePublishToFacebook = async (asset: any, caption: string) => {
    const dim = getDimensionsForRatio(asset.metadata?.aspectRatio);
    let imageBase64: string | string[] = "";
    let videoUrl = "";

    if (activeSubTab === "video") {
      videoUrl = asset.metadata?.videoUrl || asset.file_url;
    } else if (activeSubTab === "carousel" && asset.metadata?.slides) {
      const b64Array = [];
      for (let i = 0; i < asset.metadata.slides.length; i++) {
        const slideHtml = typeof asset.metadata.slides[i] === "string" ? asset.metadata.slides[i] : asset.metadata.slides[i].html;
        if (slideHtml) {
          const b64 = await renderHtmlToImage(slideHtml, dim.width, dim.height);
          b64Array.push(b64);
        }
      }
      imageBase64 = b64Array;
    } else {
      const html = asset.metadata?.html || asset.metadata?.html_content;
      if (html && html !== "Generated Carousel") {
        imageBase64 = await renderHtmlToImage(html, dim.width, dim.height);
      } else if (asset.metadata?.imageUrl) {
        imageBase64 = asset.metadata.imageUrl;
      }
    }

    const res = await fetch("/api/social/facebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "publish",
        workspaceId,
        caption,
        ...(videoUrl ? { videoUrl } : { imageBase64 })
      })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to publish to Facebook");
    }
  };

  const handlePublishToInstagram = async (asset: any, caption: string) => {
    const dim = getDimensionsForRatio(asset.metadata?.aspectRatio);
    let imageBase64: string | string[] = "";
    let videoUrl = "";

    if (activeSubTab === "video") {
      videoUrl = asset.metadata?.videoUrl || asset.file_url;
    } else if (activeSubTab === "carousel" && asset.metadata?.slides) {
      const b64Array = [];
      for (let i = 0; i < asset.metadata.slides.length; i++) {
        const slideHtml = typeof asset.metadata.slides[i] === "string" ? asset.metadata.slides[i] : asset.metadata.slides[i].html;
        if (slideHtml) {
          const b64 = await renderHtmlToImage(slideHtml, dim.width, dim.height);
          b64Array.push(b64);
        }
      }
      imageBase64 = b64Array;
    } else {
      const html = asset.metadata?.html || asset.metadata?.html_content;
      if (html && html !== "Generated Carousel") {
        imageBase64 = await renderHtmlToImage(html, dim.width, dim.height);
      } else if (asset.metadata?.imageUrl) {
        imageBase64 = asset.metadata.imageUrl;
      }
    }

    const res = await fetch("/api/social/instagram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "publish",
        workspaceId,
        caption,
        ...(videoUrl ? { videoUrl } : { imageUrl: imageBase64 })
      })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to publish to Instagram");
    }
  };

  return (
    <>
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#ffffff]">Generated Assets</h2>
          <p className="text-sm text-[#828282] mt-1">Access your historical generated images, carousels, and videos.</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#ffffff]/10 pb-4">
        <button
          onClick={() => setActiveSubTab("image")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "image"
              ? "bg-[#DEDBC8] text-black"
              : "text-[#828282] hover:text-white bg-[#ffffff]/5 hover:bg-[#ffffff]/10"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Images
        </button>
        <button
          onClick={() => setActiveSubTab("carousel")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "carousel"
              ? "bg-[#DEDBC8] text-black"
              : "text-[#828282] hover:text-white bg-[#ffffff]/5 hover:bg-[#ffffff]/10"
          }`}
        >
          <Layers className="w-4 h-4" /> Carousels
        </button>
        <button
          onClick={() => setActiveSubTab("video")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "video"
              ? "bg-[#DEDBC8] text-black"
              : "text-[#828282] hover:text-white bg-[#ffffff]/5 hover:bg-[#ffffff]/10"
          }`}
        >
          <Video className="w-4 h-4" /> Videos
        </button>
      </div>

      {/* Content */}
      <div className="bg-[#1c1e21] border border-[#828282]/20 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#DEDBC8]" />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#ffffff]/5 flex items-center justify-center mb-4">
              {activeSubTab === "image" ? <ImageIcon className="w-8 h-8 text-[#828282]" /> : (activeSubTab === "carousel" ? <Layers className="w-8 h-8 text-[#828282]" /> : <Video className="w-8 h-8 text-[#828282]" />)}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No {activeSubTab}s found</h3>
            <p className="text-sm text-[#828282] max-w-sm">
              You haven't generated any {activeSubTab}s yet. Head over to the {activeSubTab === "image" ? "Campaign Generate" : (activeSubTab === "carousel" ? "Carousel Studio" : "Studio Video")} to create your first asset.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {assets.map((asset) => {
              const dim = getDimensionsForRatio(asset.metadata?.aspectRatio);
              return (
              <div key={asset.id} className="group relative bg-[#0A0A0A] border border-[#828282]/20 rounded-xl overflow-hidden hover:border-[#DEDBC8]/50 transition-colors">
                
                {/* Preview Area */}
                <div className={`${dim.tw} bg-[#ffffff]/5 relative overflow-hidden flex items-center justify-center p-0`}>
                  {activeSubTab === "image" && (asset.metadata?.html || asset.metadata?.html_content) ? (
                    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden" id={`asset-preview-${asset.id}`}>
                      <div
                        className="origin-center scale-[0.24] sm:scale-[0.28] lg:scale-[0.3]"
                        style={{ width: `${dim.width}px`, height: `${dim.height}px`, flexShrink: 0 }}
                        dangerouslySetInnerHTML={{ __html: asset.metadata.html || asset.metadata.html_content }}
                      />
                    </div>
                  ) : activeSubTab === "image" && asset.metadata?.imageUrl ? (
                    <img 
                      id={`asset-preview-${asset.id}`}
                      src={asset.metadata.imageUrl} 
                      alt="Generated" 
                      className="object-cover w-full h-full absolute inset-0"
                    />
                  ) : activeSubTab === "carousel" && asset.metadata?.slides ? (
                    <div className="absolute inset-0 bg-[#1c1e21] shadow-lg flex items-center justify-center overflow-hidden" id={`asset-preview-${asset.id}`}>
                       <div 
                         className="origin-center scale-[0.24] sm:scale-[0.28] lg:scale-[0.3]"
                         style={{ width: `${dim.width}px`, height: `${dim.height}px`, flexShrink: 0 }}
                         dangerouslySetInnerHTML={{ __html: typeof asset.metadata.slides[0] === "string" ? asset.metadata.slides[0] : asset.metadata.slides[0]?.html || "" }}
                       />
                       <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-white z-10 border border-white/20">
                         {asset.metadata.slides.length} Slides
                       </div>
                    </div>
                  ) : activeSubTab === "video" && (asset.metadata?.videoUrl || asset.file_url) ? (
                    <video
                      src={asset.metadata.videoUrl || asset.file_url}
                      controls
                      playsInline
                      className="w-full h-full object-contain absolute inset-0 bg-black"
                    />
                  ) : (
                    <div className="text-sm text-[#828282]">Preview not available</div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm z-20">
                    {activeSubTab === "image" && (
                       <button
                         onClick={async (e) => {
                           e.preventDefault();
                           try {
                             if (asset.metadata?.html || asset.metadata?.html_content) {
                               const rawHtml = asset.metadata.html || asset.metadata.html_content;
                               const imageBase64 = await renderHtmlToImage(rawHtml, dim.width, dim.height);
                               const resData = await fetch(imageBase64);
                               const blob = await resData.blob();
                               const objectUrl = URL.createObjectURL(blob);
                               const link = document.createElement('a');
                               link.download = `brand-asset-${asset.id}.jpeg`;
                               link.href = objectUrl;
                               link.click();
                               URL.revokeObjectURL(objectUrl);
                             } else if (asset.metadata?.imageUrl) {
                               const resData = await fetch(asset.metadata.imageUrl);
                               const blob = await resData.blob();
                               const objectUrl = URL.createObjectURL(blob);
                               const link = document.createElement('a');
                               link.download = `brand-asset-${asset.id}.jpeg`;
                               link.href = objectUrl;
                               link.click();
                               URL.revokeObjectURL(objectUrl);
                             }
                           } catch (err) {
                             console.error('Failed to export image', err);
                             alert('Failed to export image. Please try again.');
                           }
                         }}
                         className="w-10 h-10 rounded-full bg-[#DEDBC8] text-black flex items-center justify-center hover:scale-110 transition-transform"
                         title="Download Final JPEG"
                       >
                         <Download className="w-4 h-4" />
                       </button>
                    )}

                    {activeSubTab === "carousel" && (
                       <button
                         onClick={async (e) => {
                           e.preventDefault();
                           try {
                             const JSZip = (await import('jszip')).default;
                             const zip = new JSZip();
                             
                             for (let i = 0; i < asset.metadata.slides.length; i++) {
                               const slideHtml = typeof asset.metadata.slides[i] === "string" ? asset.metadata.slides[i] : asset.metadata.slides[i].html;
                               if (slideHtml) {
                                 const imageBase64 = await renderHtmlToImage(slideHtml, dim.width, dim.height);
                                 const base64Data = imageBase64.replace(/^data:image\/(png|jpeg);base64,/, "");
                                 zip.file(`slide-${i + 1}.jpeg`, base64Data, { base64: true });
                               }
                             }
                             
                             const blob = await zip.generateAsync({ type: "blob" });
                             const link = document.createElement('a');
                             link.download = `carousel-${asset.id}.zip`;
                             link.href = URL.createObjectURL(blob);
                             link.click();
                           } catch (err) {
                             console.error('Failed to export carousel', err);
                             alert('Failed to export carousel. Please try again.');
                           }
                         }}
                         className="w-10 h-10 rounded-full bg-[#DEDBC8] text-black flex items-center justify-center hover:scale-110 transition-transform"
                         title="Download Zip"
                       >
                         <Download className="w-4 h-4" />
                       </button>
                    )}

                    {activeSubTab === "video" && (
                        <a
                          href={asset.metadata?.videoUrl || asset.file_url}
                          download={`video-${asset.id}.mp4`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-[#DEDBC8] text-black flex items-center justify-center hover:scale-110 transition-transform"
                          title="Download MP4 Video"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                     )}

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setPublishModal({ open: true, asset });
                        }}
                        className="w-10 h-10 rounded-full bg-[#0077B5] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        title="Publish to LinkedIn"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setFbPublishModal({ open: true, asset });
                        }}
                        className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        title="Publish to Facebook"
                      >
                        <FacebookIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIgPublishModal({ open: true, asset });
                        }}
                        className="w-10 h-10 rounded-full bg-[#E1306C] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        title="Publish to Instagram"
                      >
                        <InstagramIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (confirm("Are you sure you want to delete this asset?")) {
                            try {
                              const res = await fetch(`/api/assets/${asset.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                setAssets((prev) => prev.filter((a) => a.id !== asset.id));
                              } else {
                                alert('Failed to delete asset');
                              }
                            } catch (err) {
                              console.error(err);
                              alert('Failed to delete asset');
                            }
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center hover:scale-110 hover:bg-[#DEDBC8] hover:text-black transition-all border border-[#ffffff]/10"
                        title="Delete Asset"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>

                    {activeSubTab === "carousel" && (
                       <div className="text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-full border border-white/20">
                         {asset.metadata.slides?.length || 0} Slides
                       </div>
                    )}
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-4 border-t border-[#828282]/20">
                  <div className="flex items-center gap-4 text-xs text-[#828282] mb-3">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(new Date(asset.created_at), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(asset.created_at), 'h:mm a')}
                    </div>
                  </div>
                  {asset.metadata?.systemPrompt && (
                    <div className="mt-2 bg-[#111111] border border-[#ffffff]/10 rounded-md p-3 relative group/prompt">
                      <div className="text-xs font-bold text-[#DEDBC8] mb-1 flex justify-between items-center">
                        <span>Generation Prompt</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(asset.metadata.systemPrompt);
                            alert("Prompt copied to clipboard!");
                          }}
                          className="text-[#828282] hover:text-[#DEDBC8] transition-colors"
                          title="Copy Prompt"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>
                      <p className="text-[10px] text-[#828282] leading-relaxed line-clamp-3 overflow-hidden text-ellipsis font-mono">
                        {asset.metadata.systemPrompt}
                      </p>
                    </div>
                  )}
                </div>

              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

    {/* LinkedIn Publish Modal */}
    <LinkedInPublishModal
      isOpen={publishModal.open}
      asset={publishModal.asset}
      workspaceId={workspaceId}
      onClose={() => setPublishModal({ open: false, asset: null })}
      onPublish={async (caption) => {
        if (!publishModal.asset) return;
        await handlePublishToLinkedIn(publishModal.asset, caption);
      }}
    />

    {/* Facebook Publish Modal */}
    <FacebookPublishModal
      isOpen={fbPublishModal.open}
      asset={fbPublishModal.asset}
      workspaceId={workspaceId}
      onClose={() => setFbPublishModal({ open: false, asset: null })}
      onPublish={async (caption) => {
        if (!fbPublishModal.asset) return;
        await handlePublishToFacebook(fbPublishModal.asset, caption);
      }}
    />

    {/* Instagram Publish Modal */}
    <InstagramPublishModal
      isOpen={igPublishModal.open}
      asset={igPublishModal.asset}
      workspaceId={workspaceId}
      onClose={() => setIgPublishModal({ open: false, asset: null })}
      onPublish={async (caption) => {
        if (!igPublishModal.asset) return;
        await handlePublishToInstagram(igPublishModal.asset, caption);
      }}
    />
    </>
  );
}
