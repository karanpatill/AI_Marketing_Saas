"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    window.location.href = "/";
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/onboarding")) {
    return null;
  }

  const navLinks = [
    { name: "How it works", href: "/how-it-works" },
    { name: "About us", href: "/about-us" },
    { name: "Privacy policy", href: "/privacy-policy" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-0 px-0">
        <div className="w-full max-w-5xl bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2.5 md:px-8 border-b border-[#E1E0CC]/10 flex items-center justify-between shadow-2xl">
          {/* Left: Logo */}
          <a href="/" className="text-[#E1E0CC] font-bold tracking-tight text-sm sm:text-base">
            AUTOMARC
          </a>

          {/* Center: Desktop Links */}
          <nav className="hidden md:flex items-center gap-3 sm:gap-6 md:gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[rgba(225,224,204,0.8)] hover:text-[#E1E0CC] transition-colors text-xs md:text-sm font-medium"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {session ? (
              <div className="hidden sm:flex items-center gap-3">
                <a
                  href="/dashboard"
                  className="bg-[#DEDBC8] text-black rounded-full px-4 py-1.5 text-xs md:text-sm font-medium hover:bg-[#E1E0CC] transition-colors inline-flex items-center gap-1.5"
                >
                  Dashboard
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={handleSignOut}
                  className="text-[#E1E0CC]/70 hover:text-[#E1E0CC]/70 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#E1E0CC]/70" />
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href="/auth"
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#DEDBC8] text-black rounded-full px-4 py-1.5 text-xs md:text-sm font-medium hover:bg-[#E1E0CC] transition-colors"
              >
                Sign In
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#E1E0CC] hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#E1306C]" /> : <Menu className="w-5 h-5 text-[#E1E0CC]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-16 z-40 bg-black border border-[#E1E0CC]/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-6">
          <nav className="flex flex-col items-center gap-4 text-center">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[rgba(225,224,204,0.8)] hover:text-[#E1E0CC] text-sm font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}

            <div className="h-px w-full bg-[#E1E0CC]/10 my-2" />

            {session ? (
              <div className="flex flex-col items-center gap-3">
                <a
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-[#DEDBC8] text-black rounded-full px-6 py-2 text-sm font-medium hover:bg-[#E1E0CC] transition-colors inline-flex items-center gap-1.5"
                >
                  Dashboard
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="text-[#E1E0CC]/70 text-xs font-medium flex items-center gap-1 mt-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#DEDBC8] text-black rounded-full px-6 py-2 text-sm font-medium hover:bg-[#E1E0CC] transition-colors inline-flex items-center gap-1.5"
              >
                Sign In
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
