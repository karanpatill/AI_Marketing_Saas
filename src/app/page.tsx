"use client";

import Hero from "@/components/Hero";
import { Check, ArrowRight } from "lucide-react";
import WordsPullUpMultiStyle from "@/components/ui/WordsPullUpMultiStyle";
import AnimatedLetter from "@/components/ui/AnimatedLetter";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const BENTO_FEATURES = [
  {
    number: "01",
    title: "Brand Memory Engine.",
    desc: "Scrapes your website, extracts your logos, typography, visual direction, target audience, and customer personas into an immutable digital DNA.",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85"
  },
  {
    number: "02",
    title: "Auto-Posting Pipeline.",
    desc: "Connect your Instagram handle in 1-click. Our background workers format, render, and auto-publish 30 days of strategy directly to your feed.",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85"
  },
  {
    number: "03",
    title: "Carousel Studio.",
    desc: "Generates 5-slide, high-converting carousel decks styled with Google Fonts typography pairs matching your exact brand personality.",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85"
  }
];

export default function Home() {
  return (
    <main className="relative bg-black text-[#E1E0CC] min-h-screen flex flex-col justify-between">
      
      {/* ── Main Hero Section ── */}
      <Hero />

      {/* ── ABOUT SECTION ── */}
      <section className="bg-black py-24 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto bg-[#101010] rounded-2xl p-8 md:p-16 flex flex-col items-center text-center space-y-12">
          
          <span className="text-primary text-[10px] sm:text-xs tracking-widest uppercase">
            System Architecture
          </span>

          <WordsPullUpMultiStyle 
            segments={[
              { text: "We are Automarc,", className: "font-normal" },
              { text: "an autonomous AI platform.", className: "font-serif-italic" },
              { text: "We have skills in brand memory, content generation, and strategy.", className: "font-normal" }
            ]}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9]"
          />

          <div className="max-w-2xl mx-auto">
            <AnimatedLetter 
              text="Eliminate ad-hoc content creation. A single unified AI engine plans, generates, designs, and auto-posts 30 days of brand strategy. Together, we create work that positions your brand ahead of market rivals."
              className="text-[#DEDBC8] text-xs sm:text-sm md:text-base leading-relaxed"
            />
          </div>
        </div>
      </section>
      
      {/* ── FEATURES SECTION ── */}
      <section className="relative z-10 bg-black min-h-screen py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div className="bg-noise absolute inset-0 opacity-[0.15] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col items-start gap-2">
            <WordsPullUpMultiStyle 
              segments={[
                { text: "Studio-grade workflows for visionary brands.", className: "text-[#E1E0CC]" }
              ]}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal"
            />
            <WordsPullUpMultiStyle 
              segments={[
                { text: "Built for pure vision. Powered by AI.", className: "text-gray-500" }
              ]}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal"
            />
          </div>

          {/* Feature Cards Grid (4 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-1 lg:h-[480px]">
            
            {/* Card 1 - Video Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0 }}
              className="relative rounded-2xl overflow-hidden h-80 lg:h-full group border border-[#E1E0CC]/5"
            >
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-6 left-6">
                <span className="text-[#E1E0CC] font-medium text-lg">Your creative canvas.</span>
              </div>
            </motion.div>

            {/* Cards 2, 3, 4 */}
            {BENTO_FEATURES.map((item, i) => (
              <motion.div 
                key={item.number}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (i + 1) * 0.15 }}
                className="bg-[#212121] rounded-2xl p-6 border border-[#E1E0CC]/5 flex flex-col justify-between transition-all duration-300 hover:border-[#E1E0CC]/20 h-80 lg:h-full"
              >
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden">
                    <img src={item.icon} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-[#E1E0CC] text-lg font-medium leading-snug">
                    {item.title} <span className="text-gray-500 font-serif-italic ml-1">({item.number})</span>
                  </h3>
                  
                  {/* Checklist style descriptions */}
                  <div className="space-y-3 pt-2">
                    {item.desc.split('. ').filter(Boolean).map((sentence, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="text-primary w-4 h-4 mt-0.5 shrink-0" />
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {sentence.endsWith('.') ? sentence : sentence + '.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-auto">
                  <a href="/auth" className="flex items-center gap-1 text-[#E1E0CC]/60 hover:text-[#E1E0CC] text-sm font-medium transition-colors group">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
