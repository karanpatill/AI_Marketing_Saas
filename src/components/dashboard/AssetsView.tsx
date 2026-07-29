"use client";

import { useEffect, useState } from "react";
import { Loader2, Image as ImageIcon, Layers, Download, ExternalLink, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

export function AssetsView({ workspaceId, refreshKey = 0 }: { workspaceId: string; refreshKey?: number }) {
  const [activeSubTab, setActiveSubTab] = useState<"image" | "carousel">("image");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
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
              You haven't generated any {activeSubTab}s yet. Head over to the {activeSubTab === "image" ? "Post Generator" : "Carousel Studio"} to create your first asset.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative bg-[#0A0A0A] border border-[#828282]/20 rounded-xl overflow-hidden hover:border-[#DEDBC8]/50 transition-colors">
                
                {/* Preview Area */}
                <div className="aspect-square bg-[#ffffff]/5 relative overflow-hidden flex flex-col items-center justify-center p-4">
                  {activeSubTab === "image" && asset.metadata?.imageUrl ? (
                    <img 
                      src={asset.metadata.imageUrl} 
                      alt="Generated" 
                      className="object-cover w-full h-full absolute inset-0"
                    />
                  ) : activeSubTab === "image" && (asset.metadata?.html || asset.metadata?.html_content) ? (
                    <div className="absolute inset-0 overflow-hidden bg-black">
                      <div
                        className="origin-top-left scale-[0.24] sm:scale-[0.28]"
                        style={{ width: '1080px', height: '1080px' }}
                        dangerouslySetInnerHTML={{ __html: asset.metadata.html || asset.metadata.html_content }}
                      />
                    </div>
                  ) : activeSubTab === "carousel" && asset.metadata?.slides ? (
                    <div className="w-full aspect-[4/5] bg-[#1c1e21] rounded-lg shadow-lg relative overflow-hidden border border-[#ffffff]/10">
                       <div 
                         className="absolute inset-0 origin-top-left scale-[0.24] sm:scale-[0.28] lg:scale-[0.3]"
                         style={{ width: '1080px', height: '1350px' }}
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
                    {activeSubTab === "image" && asset.metadata?.imageUrl && (
                       <a 
                         href={asset.metadata.imageUrl}
                         target="_blank"
                         className="w-10 h-10 rounded-full bg-[#DEDBC8] text-black flex items-center justify-center hover:scale-110 transition-transform"
                         title="Open Full Image"
                       >
                         <ExternalLink className="w-4 h-4" />
                       </a>
                    )}
                    {activeSubTab === "carousel" && (
                       <div className="text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-full border border-white/20">
                         {asset.metadata.slides?.length || 0} Slides
                       </div>
                    )}
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-4 border-t border-[#828282]/20">
                  <div className="flex items-center gap-4 text-xs text-[#828282]">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(new Date(asset.created_at), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(asset.created_at), 'h:mm a')}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
