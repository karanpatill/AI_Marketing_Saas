"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import ThreeCanvas from "./ThreeCanvas";

export default function Hero() {
  const transition = { duration: 1.2, ease: [0.16, 1, 0.3, 1] as any };

  return (
    <div className="relative w-full min-h-screen bg-white select-none flex flex-col justify-between py-24 px-8 sm:px-12 md:px-16">
      
      {/* ── 3D Mathematical Ribbon Canvas ── */}
      <ThreeCanvas />

      {/* ── Dom Content Overlay ── */}
      <div className="relative z-10 w-full flex-grow flex flex-col justify-between pt-16">
        
        {/* Left Aligned Content area */}
        <div className="max-w-xl flex flex-col items-start gap-6 mt-8 sm:mt-12 mb-16">
          {/* Overline */}
          <motion.span
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...transition, delay: 0.1 }}
            className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400"
          >
            DESIGNING THE FUTURE
          </motion.span>

          {/* Headline */}
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...transition, delay: 0.2 }}
            className="text-gray-900 font-medium tracking-tight text-[52px] sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] whitespace-pre-line"
          >
            {"Where Vision\nMeets Design."}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...transition, delay: 0.3 }}
            className="text-gray-500 font-light text-sm sm:text-base leading-relaxed max-w-sm"
          >
            We craft digital experiences that inspire, engage, and elevate your brand on autopilot.
          </motion.p>

          {/* Action Buttons Array */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...transition, delay: 0.4 }}
            className="flex flex-wrap items-center gap-4 mt-4"
          >
            {/* Get Started Button */}
            <a
              href="/auth"
              className="group inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-gray-800 text-white rounded-full px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-black/5"
            >
              GET STARTED
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* Bottom Statistics Bar */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...transition, delay: 0.6 }}
          className="flex items-center gap-8 border-t border-gray-150 pt-8 pb-4 mt-auto"
        >
          {/* Stat 1 */}
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl font-medium text-gray-900">200+</span>
            <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase">
              Projects
            </span>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          {/* Stat 2 */}
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl font-medium text-gray-900">98%</span>
            <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase">
              Clients Satisfied
            </span>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          {/* Stat 3 */}
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl font-medium text-gray-900">15+</span>
            <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase">
              Awards Won
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
