"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "./Navbar";
import DashboardMockup from "./DashboardMockup";

const PLATFORMS = ["Instagram", "LinkedIn"];

const FEATURES = [
  "Brand Memory",
  "Moodboard Studio",
  "AI Content Factory",
  "Competitor Intel",
  "Auto-scheduler",
];

export default function Hero() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Top gradient band (subtle, like Linear.app) ── */}
      <div
        className="h-1 w-full"
        style={{
          background: "linear-gradient(90deg, var(--color-brand-primary, #2563EB) 0%, var(--color-brand-secondary, #10B981) 100%)",
        }}
      />

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pt-16 sm:pt-20 lg:pt-24 pb-0 flex flex-col lg:flex-row items-center gap-14 lg:gap-12">

        {/* ─── Background tint (very subtle) ─── */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-[0.04] blur-3xl"
          style={{
            background: "radial-gradient(ellipse, var(--color-brand-primary, #2563EB) 0%, transparent 70%)",
          }}
        />

        {/* ─── Left: Copy ─── */}
        <div className="relative z-10 flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-[540px] mx-auto lg:mx-0">

          {/* Eyebrow badge */}
          <div className="animate-fade-up [animation-delay:40ms] inline-flex items-center gap-2 mb-6 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[12px] font-semibold text-brand-primary">
              AI Marketing OS · Now in beta
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up [animation-delay:80ms] text-[#111018] font-bold tracking-tight leading-[1.07] text-[40px] min-[400px]:text-[46px] sm:text-[54px] lg:text-[58px] xl:text-[64px]">
            Your Brand,{" "}
            <span
              className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent"
            >
              Automated.
            </span>
          </h1>

          {/* Sub */}
          <p className="animate-fade-up [animation-delay:160ms] mt-5 text-gray-500 text-[16px] sm:text-[17px] leading-relaxed max-w-[460px]">
            Tell Automarc about your business once. It builds the strategy, creates the content, and publishes across every platform — on autopilot.
          </p>

          {/* Feature pills */}
          <div className="animate-fade-up [animation-delay:220ms] mt-5 flex flex-wrap gap-2 justify-center lg:justify-start">
            {FEATURES.map(f => (
              <span key={f} className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                <CheckCircle2 className="w-3 h-3 text-brand-primary" />
                {f}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="animate-fade-up [animation-delay:300ms] mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <a id="cta-primary" href="/onboarding"
               className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white bg-brand-dark hover:bg-brand-darkHover transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_2px_12px_rgba(0,0,0,0.18)]">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a id="cta-secondary" href="#" className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
              Book a demo
            </a>
          </div>

          {/* Trust line */}
          <p className="animate-fade-up [animation-delay:380ms] mt-5 text-[12px] text-gray-400">
            Free 14-day trial · No credit card required · Cancel anytime
          </p>
        </div>

        {/* ─── Right: Dashboard ─── */}
        <div className="animate-fade-up [animation-delay:180ms] relative z-10 flex-1 w-full max-w-[640px] mx-auto lg:mx-0">
          <DashboardMockup />
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 mt-20">
        <div className="border-t border-gray-100" />
      </div>

      {/* ── Platform strip ── */}
      <div className="py-8 overflow-hidden">
        <p className="text-center text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-5">
          Publish to every platform, automatically
        </p>
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex items-center gap-12 whitespace-nowrap pr-12">
            {[...PLATFORMS, ...PLATFORMS].map((name, i) => (
              <span key={i} className="text-[13px] font-semibold text-gray-300">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
