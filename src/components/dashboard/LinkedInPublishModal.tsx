"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Share2, Sparkles, X, RefreshCw, CheckCircle2 } from "lucide-react";

interface LinkedInPublishModalProps {
  isOpen: boolean;
  asset: any;
  workspaceId: string;
  onClose: () => void;
  onPublish: (caption: string) => Promise<void>;
}

export function LinkedInPublishModal({
  isOpen,
  asset,
  workspaceId,
  onClose,
  onPublish,
}: LinkedInPublishModalProps) {
  const [caption, setCaption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && asset) {
      setCaption("");
      setError("");
      setPublished(false);
      generateCaption();
    }
  }, [isOpen, asset]);

  const generateCaption = async () => {
    if (!asset) return;
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/social/linkedin/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: asset.metadata?.title || asset.metadata?.topic || asset.name,
          contentType: asset.type || "image",
          brandName: asset.metadata?.brandName || "",
          industry: asset.metadata?.industry || "",
          tone: asset.metadata?.tone || "professional",
        }),
      });
      const data = await res.json();
      if (data.caption) {
        setCaption(data.caption);
      } else {
        setCaption("");
      }
    } catch (err) {
      setCaption("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!caption.trim()) return;
    setIsPublishing(true);
    setError("");
    try {
      await onPublish(caption.trim());
      setPublished(true);
      setTimeout(() => {
        onClose();
        setPublished(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to publish. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const charCount = caption.length;
  const maxChars = 3000;
  const isOverLimit = charCount > maxChars;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 bg-[#111111] border border-[#ffffff]/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffffff]/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0077B5] flex items-center justify-center shadow-lg">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Publish to LinkedIn</h3>
              <p className="text-[11px] text-[#828282]">Review and publish your post</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#ffffff]/5 hover:bg-[#ffffff]/10 flex items-center justify-center transition-colors text-[#828282] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Asset preview pill */}
        {asset && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 bg-[#ffffff]/5 rounded-lg px-3 py-2 border border-[#ffffff]/8">
              <div className="w-2 h-2 rounded-full bg-[#0077B5]" />
              <span className="text-xs text-[#828282] truncate">
                {asset.metadata?.title || asset.metadata?.topic || asset.name || "Generated Asset"}
              </span>
            </div>
          </div>
        )}

        {/* Caption Area */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#ffffff]/60 uppercase tracking-widest">
              Post Caption
            </label>
            <button
              onClick={generateCaption}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#DEDBC8] hover:text-white transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Regenerate
            </button>
          </div>

          <div className="relative">
            {isGenerating ? (
              <div className="w-full h-44 rounded-xl bg-[#0A0A0A] border border-[#ffffff]/10 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#DEDBC8] animate-pulse" />
                  <span className="text-sm text-[#828282]">Generating professional caption...</span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#DEDBC8]/40 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={7}
                maxLength={3000}
                placeholder="Your AI-generated caption will appear here..."
                className="w-full bg-[#0A0A0A] border border-[#ffffff]/10 focus:border-[#DEDBC8]/40 rounded-xl px-4 py-3 text-sm text-white placeholder-[#828282]/50 resize-none outline-none transition-colors leading-relaxed"
              />
            )}
          </div>

          {/* Char counter */}
          {!isGenerating && (
            <div className="flex justify-end mt-1.5">
              <span className={`text-[11px] font-mono ${isOverLimit ? "text-red-400" : charCount > 2500 ? "text-amber-400" : "text-[#828282]"}`}>
                {charCount} / {maxChars}
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#ffffff]/8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#DEDBC8]/60" />
            <span className="text-[11px] text-[#828282]">AI-generated, professional tone</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isPublishing}
              className="px-4 py-2 text-xs font-bold text-[#828282] hover:text-white bg-[#ffffff]/5 hover:bg-[#ffffff]/10 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || isGenerating || !caption.trim() || isOverLimit}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-[#0077B5] hover:bg-[#005E93] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg"
            >
              {published ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Published!
                </>
              ) : isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Publish Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
