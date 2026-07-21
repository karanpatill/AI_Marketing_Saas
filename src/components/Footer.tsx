"use client";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full bg-black border-t border-[#E1E0CC]/10 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand & Tagline */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <img src="/logo.png" alt="Automarc" className="h-8 md:h-10 w-auto object-contain" />
          <span className="text-[#E1E0CC]/40 text-xs font-normal">
            Your Brand, Automated
          </span>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          <a href="/about-us" className="text-[#E1E0CC]/50 text-sm hover:text-[#E1E0CC] transition-colors">About</a>
          <a href="/how-it-works" className="text-[#E1E0CC]/50 text-sm hover:text-[#E1E0CC] transition-colors">How It Works</a>
          <a href="/privacy-policy" className="text-[#E1E0CC]/50 text-sm hover:text-[#E1E0CC] transition-colors">Privacy Policy</a>
          <a href="/dashboard" className="text-[#E1E0CC]/50 text-sm hover:text-[#E1E0CC] transition-colors">Dashboard</a>
        </div>

        {/* Copyright */}
        <div className="text-[#E1E0CC]/30 text-xs font-mono">
          © 2026 AUTOMARC INC. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
