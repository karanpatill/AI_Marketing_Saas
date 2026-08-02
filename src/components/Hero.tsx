"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import WordsPullUpMultiStyle from "./ui/WordsPullUpMultiStyle";

interface HeroProps {
  videoSrc?: string;
  titleSegments?: Array<{ text: string; className?: string }>;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

const DEFAULT_TITLE_SEGMENTS = [
  { text: "THE FUTURE OF", className: "font-normal text-[#E1E0CC]" },
  { text: "YOUR BUSINESS,", className: "font-serif-italic text-primary" },
  { text: "SIMPLIFIED.", className: "font-normal text-[#E1E0CC]" },
];

const DEFAULT_DESCRIPTION =
  "Govern your brand's digital presence, automate cross-platform campaigns, and generate premium content with specialized AI agents working around the clock.";

export default function Hero({
  videoSrc = "https://assets.mixkit.co/videos/31497/31497-720.mp4",
  titleSegments = DEFAULT_TITLE_SEGMENTS,
  description = DEFAULT_DESCRIPTION,
  primaryCtaText = "GET STARTED",
  primaryCtaHref = "/auth",
  secondaryCtaText = "View Pricing",
  secondaryCtaHref = "/dashboard/billing",
}: HeroProps) {
  return (
    <section className="h-[90vh] md:h-screen p-2 md:p-2 bg-black select-none">
      <div className="relative h-full w-full overflow-hidden rounded-2xl border-none bg-black md:rounded-[2rem]">
        {/* ── Background Video ── */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ willChange: "transform" }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* ── Gradient Overlay ── */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90" />

        {/* ── Hero Content Grid ── */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-6 md:px-10 md:pb-10">
          <div className="mx-auto grid max-w-[1800px] grid-cols-12 items-end gap-6 md:gap-12">
            {/* Main Heading Column */}
            <div className="col-span-12 flex items-end justify-start md:col-span-8">
              <WordsPullUpMultiStyle
                segments={titleSegments}
                className="justify-start text-left text-3xl font-bold uppercase leading-[1.05] tracking-tight text-[#E1E0CC] drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[60px]"
              />
            </div>

            {/* Description + CTA Column */}
            <div className="col-span-12 flex flex-col gap-4 pb-2 md:col-span-4">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs font-normal leading-[1.3] text-[#E1E0CC] drop-shadow-md sm:text-sm md:text-base"
              >
                {description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-3"
              >
                {/* Primary CTA Button */}
                {primaryCtaText && (
                  <Link
                    href={primaryCtaHref}
                    className="group flex items-center gap-2 rounded-full bg-primary py-1 pl-4 pr-1 text-sm font-medium text-black shadow-[0_0_20px_rgba(222,219,200,0.3)] transition-all hover:gap-3 hover:shadow-[0_0_30px_rgba(222,219,200,0.5)] sm:text-base"
                  >
                    <span>{primaryCtaText}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-primary transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                )}

                {/* Secondary Ghost Button */}
                {secondaryCtaText && (
                  <Link
                    href={secondaryCtaHref}
                    className="rounded-full border border-[#E1E0CC]/30 bg-black/40 px-6 py-2 text-sm font-medium text-[#E1E0CC] shadow-lg backdrop-blur-md transition-all hover:border-[#E1E0CC]/60 hover:bg-black/60 sm:text-base"
                  >
                    {secondaryCtaText}
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
