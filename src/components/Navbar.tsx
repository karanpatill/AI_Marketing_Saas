"use client";

import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Platform", hasDropdown: true  },
  { label: "Pricing",  hasDropdown: false },
  { label: "Agency",   hasDropdown: false },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="animate-fade-down relative z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-5 sm:px-8 lg:px-16 py-4 max-w-7xl mx-auto">

        {/* Logo */}
        <a href="/" aria-label="Automarc home" className="flex items-center gap-2.5 text-brand-dark">
          <Logo className="w-5 h-5" />
          <span className="font-bold text-[15px] tracking-tight text-brand-dark">
            Automarc
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <li key={l.label}>
              <a href="#" className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
                {l.label}
                {l.hasDropdown && <ChevronDown className="w-3 h-3" />}
              </a>
            </li>
          ))}
        </ul>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <a href="#" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </a>
          <a href="/onboarding" id="navbar-cta"
             className="text-[13px] font-semibold px-4 py-2 rounded-full text-white bg-brand-dark hover:bg-brand-darkHover transition-colors">
            Get started
          </a>
          <button
            id="mobile-menu-toggle"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div id="mobile-menu"
             className="absolute left-4 right-4 top-full mt-2 rounded-2xl bg-white border border-gray-100 shadow-xl px-5 py-3 animate-fade-up z-40">
          {NAV_LINKS.map(l => (
            <a key={l.label} href="#"
               className="flex items-center justify-between text-[15px] text-gray-700 hover:text-gray-900 py-3 border-b border-gray-100 last:border-none transition-colors">
              {l.label}
              {l.hasDropdown && <ChevronDown className="w-4 h-4 text-gray-400" />}
            </a>
          ))}
          <a href="#" className="flex text-[15px] text-gray-700 hover:text-gray-900 py-3 transition-colors">
            Sign in
          </a>
        </div>
      )}
    </nav>
  );
}
