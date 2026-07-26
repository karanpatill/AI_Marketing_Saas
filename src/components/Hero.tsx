"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import WordsPullUpMultiStyle from "./ui/WordsPullUpMultiStyle";

export default function Hero() {
  return (
    <section className="h-[90vh] md:h-screen p-2 md:p-2 bg-black select-none">
      <div className="w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden relative bg-black border-none">
        
        {/* ── Background Video ── */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: "auto" }}
        >
          <source src="https://assets.mixkit.co/videos/31497/31497-720.mp4" type="video/mp4" />
        </video>

        {/* ── Gradient Overlay ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90 pointer-events-none" />

        {/* ── Hero Content Grid ── */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-10 z-10 pb-6 md:pb-10">
          <div className="grid grid-cols-12 gap-6 md:gap-12 items-end w-full max-w-[1800px] mx-auto">
            
            {/* Main Heading Column (12 cols on mobile, 8 on desktop) */}
            <div className="col-span-12 md:col-span-8 flex items-end justify-start">
              <WordsPullUpMultiStyle 
                segments={[
                  { text: "THE FUTURE OF", className: "font-normal text-[#E1E0CC]" },
                  { text: "YOUR BUSINESS,", className: "font-serif-italic text-primary" },
                  { text: "SIMPLIFIED.", className: "font-normal text-[#E1E0CC]" }
                ]}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[60px] leading-[1.05] font-bold tracking-tight uppercase justify-start text-left drop-shadow-2xl"
              />
            </div>

          {/* Description + CTA Column (4 cols) */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-4 pb-2">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#E1E0CC] text-xs sm:text-sm md:text-base leading-[1.3] font-normal drop-shadow-md"
            >
              Govern your brand&apos;s digital presence, automate cross-platform campaigns, and generate premium content with specialized AI agents working around the clock.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3"
            >
              {/* Primary CTA Button */}
              <Link
                href="/auth"
                className="flex items-center gap-2 bg-primary text-black font-medium rounded-full pl-4 pr-1 py-1 text-sm sm:text-base group hover:gap-3 transition-all shadow-[0_0_20px_rgba(222,219,200,0.3)] hover:shadow-[0_0_30px_rgba(222,219,200,0.5)]"
              >
                <span>GET STARTED</span>
                <div className="bg-black text-primary rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              {/* Secondary Ghost Button */}
              <Link
                href="/dashboard/billing"
                className="bg-black/40 hover:bg-black/60 text-[#E1E0CC] border border-[#E1E0CC]/30 rounded-full px-6 py-2 text-sm sm:text-base hover:border-[#E1E0CC]/60 transition-all font-medium backdrop-blur-md shadow-lg"
              >
                View Pricing
              </Link>
            </motion.div>
          </div>
        </div>
        </div>

      </div>
    </section>
  );
}
