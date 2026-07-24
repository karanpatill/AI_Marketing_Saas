"use client";

import { useRef, useEffect, useState } from "react";

export default function BentoVideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Only start playing when card enters viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          video.play().catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden h-80 lg:h-full group border border-[#E1E0CC]/5">
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.5s ease" }}
      >
        <source src="https://assets.mixkit.co/videos/44818/44818-1080.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      <div className="absolute bottom-6 left-6">
        <span className="text-[#E1E0CC] font-medium text-lg">Your creative canvas.</span>
      </div>
    </div>
  );
}
