"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import WordsPullUp from "./ui/WordsPullUp";

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
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 grid grid-cols-12 gap-4 items-end z-10">
          
          {/* Main Heading Column (8 cols) */}
          <div className="col-span-12 md:col-span-8">
            <WordsPullUp 
              text="Automarc" 
              showAsterisk={true}
              className="text-[14vw] sm:text-[12vw] md:text-[10vw] lg:text-[9vw] xl:text-[8vw] 2xl:text-[7.5vw] font-medium leading-[0.85] tracking-[-0.07em] text-[#E1E0CC] uppercase"
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
              <a
                href="/auth"
                className="flex items-center gap-2 bg-primary text-black font-medium rounded-full pl-4 pr-1 py-1 text-sm sm:text-base group hover:gap-3 transition-all"
              >
                <span>GET STARTED</span>
                <div className="bg-black text-primary rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </a>

              {/* Secondary Ghost Button */}
              <a
                href="/how-it-works"
                className="border border-[#E1E0CC]/30 text-[#E1E0CC] rounded-full px-5 py-2 text-sm sm:text-base hover:border-[#E1E0CC]/60 transition-colors"
              >
                How It Works
              </a>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
