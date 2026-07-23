"use client";

import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Download, Check, Loader2 } from "lucide-react";

interface ExportZipButtonProps {
  brandName?: string;
  posts?: Array<{
    id?: string | number;
    title?: string;
    caption?: string;
    image_url?: string;
    date?: string;
  }>;
  carouselSlides?: string[];
  className?: string;
}

export default function ExportZipButton({
  brandName = "Automarc_Brand",
  posts = [],
  carouselSlides = [],
  className = "",
}: ExportZipButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleExportZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();
      const folderName = `${brandName.replace(/\s+/g, "_")}_Content_Package`;
      const rootFolder = zip.folder(folderName);

      // Add a Master Strategy & Captions summary text file
      let captionsContent = `=========================================\n`;
      captionsContent += `  ${brandName.toUpperCase()} - AI CONTENT PACKAGE\n`;
      captionsContent += `  Generated via Automarc SaaS\n`;
      captionsContent += `=========================================\n\n`;

      if (posts.length > 0) {
        captionsContent += `--- SOCIAL POSTS & CAPTIONS (${posts.length}) ---\n\n`;
        posts.forEach((post, idx) => {
          captionsContent += `POST #${idx + 1}: ${post.title || "Untitled"}\n`;
          captionsContent += `DATE: ${post.date || "Scheduled"}\n`;
          captionsContent += `CAPTION:\n${post.caption || "No caption"}\n`;
          captionsContent += `-----------------------------------------\n\n`;
        });
      }

      if (carouselSlides.length > 0) {
        captionsContent += `--- CAROUSEL SLIDES (${carouselSlides.length}) ---\n`;
        carouselSlides.forEach((_, idx) => {
          captionsContent += `Slide ${idx + 1}: Rendered image attached in /carousel_slides/\n`;
        });
      }

      rootFolder?.file("Captions_And_Strategy.txt", captionsContent);

      // Fetch and bundle images if available
      const imagesFolder = rootFolder?.folder("media_assets");
      
      let imgCount = 1;
      for (const post of posts) {
        if (post.image_url && post.image_url.startsWith("http")) {
          try {
            const res = await fetch(post.image_url);
            if (res.ok) {
              const blob = await res.blob();
              const ext = post.image_url.endsWith(".png") ? "png" : "jpg";
              imagesFolder?.file(`Post_${imgCount}_Image.${ext}`, blob);
              imgCount++;
            }
          } catch (e) {
            console.warn(`Could not fetch image for post ${imgCount}`, e);
          }
        }
      }

      // Generate the ZIP file
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);

      setDownloading(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (error) {
      console.error("Failed to export ZIP:", error);
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleExportZip}
      disabled={downloading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-[#DEDBC8] text-black hover:bg-[#E1E0CC] font-semibold text-xs rounded-full transition-all cursor-pointer shadow-lg disabled:opacity-50 ${className}`}
    >
      {downloading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Bundling ZIP Package...
        </>
      ) : done ? (
        <>
          <Check className="w-3.5 h-3.5 text-black" />
          ZIP Exported!
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          1-Click Export ZIP Package
        </>
      )}
    </button>
  );
}
