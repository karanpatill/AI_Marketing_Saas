"use client";

import { useEffect, useState } from "react";
import { Loader2, Image as ImageIcon, Layers, Download, ExternalLink, Calendar as CalendarIcon, Clock, Share2 } from "lucide-react";
import { format } from "date-fns";
import { LinkedInPublishModal } from "./LinkedInPublishModal";

export function AssetsView({ workspaceId, refreshKey = 0 }: { workspaceId: string; refreshKey?: number }) {
  const getDimensionsForRatio = (ratio?: string) => {
    if (ratio === '9/16' || ratio === '9:16') return { width: 1080, height: 1920, tw: 'aspect-[9/16]' };
    if (ratio === '16/9' || ratio === '16:9') return { width: 1080, height: 607.5, tw: 'aspect-video' };
    if (ratio === '4/5' || ratio === '4:5') return { width: 1080, height: 1350, tw: 'aspect-[4/5]' };
    return { width: 1080, height: 1080, tw: 'aspect-square' };
  };
  const [activeSubTab, setActiveSubTab] = useState<"image" | "carousel">("image");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishModal, setPublishModal] = useState<{ open: boolean; asset: any | null }>({ open: false, asset: null });

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

  // Shared helper: render HTML to base64 JPEG via server-side Puppeteer
  const renderHtmlToImage = async (html: string, width: number, height: number): Promise<string> => {
    const res = await fetch("/api/render-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, width, height }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Render failed");
    return data.imageBase64;
  };

  const handlePublishToLinkedIn = async (asset: any, caption: string) => {
    const dim = getDimensionsForRatio(asset.metadata?.aspectRatio);
    let imageBase64 = "";

    const html = asset.metadata?.html || asset.metadata?.html_content;
    if (html) {
      imageBase64 = await renderHtmlToImage(html, dim.width, dim.height);
    } else if (asset.metadata?.imageUrl) {
      imageBase64 = asset.metadata.imageUrl;
    }

    const res = await fetch("/api/social/linkedin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "publish",
        workspaceId,
        caption,
        imageBase64
      })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to publish to LinkedIn");
    }
  };

  return (
    <>
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#ffffff]">Generated Assets</h2>
          <p className="text-sm text-[#828282] mt-1">Access your historical generated images and carousels.</p>
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
              {activeSubTab === "image" ? <ImageIcon className="w-8 h-8 text-[#828282]" /> : <Layers className="w-8 h-8 text-[#828282]" />}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No {activeSubTab}s found</h3>
            <p className="text-sm text-[#828282] max-w-sm">
              You haven't generated any {activeSubTab}s yet. Head over to the {activeSubTab === "image" ? "Campaign Generate" : "Carousel Studio"} to create your first asset.
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
    </>
  );
}
