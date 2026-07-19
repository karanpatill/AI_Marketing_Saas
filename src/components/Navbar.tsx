"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "#" },
    { name: "Services", href: "#" },
    { name: "Portfolio", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contact", href: "#" },
  ];

  return (
    <>
      <header
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${scrolled
            ? "w-[95%] md:w-[80%] max-w-5xl mt-4 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] py-3 px-6"
            : "w-full mt-0 transparent pt-8 px-8 sm:px-12 md:px-16 py-4"
          }`}
      >
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <a href="/" className="font-bold tracking-[0.25em] text-xs text-gray-900 uppercase">
            AUTOMARC
          </a>

          {/* Center: Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right: Hamburger / CTA */}
          <div className="flex items-center gap-4">
            {/* Direct Login Link for SaaS access */}
            <a
              href="/auth"
              className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-900 hover:opacity-75 transition-opacity"
            >
              Sign In
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Circular Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-12 h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/60 flex items-center justify-center text-gray-900 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full Screen Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md flex flex-col justify-center items-center gap-8 animate-fade-in">
          <nav className="flex flex-col items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium tracking-wide text-gray-900 hover:text-gray-500 transition-colors"
              >
                {link.name}
              </a>
            ))}
            
            <div className="h-px w-16 bg-gray-200 my-4" />
            
            <a
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-gray-900"
            >
              Sign In
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
