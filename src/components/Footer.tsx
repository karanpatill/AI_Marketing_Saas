"use client";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full bg-white border-t border-gray-100 py-12 px-8 sm:px-12 md:px-16 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Side: Brand Name */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold tracking-[0.25em] text-[10px] text-gray-900 uppercase">
            AUTOMARC
          </span>
          <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
            Your Brand, Automated
          </span>
        </div>

        {/* Center Links */}
        <div className="flex flex-wrap justify-center gap-8 text-[9px] font-bold uppercase tracking-widest text-gray-400">
          <a href="#" className="hover:text-black transition-colors">About</a>
          <a href="#" className="hover:text-black transition-colors">Services</a>
          <a href="#" className="hover:text-black transition-colors">Portfolio</a>
          <a href="#" className="hover:text-black transition-colors">Blog</a>
          <a href="#" className="hover:text-black transition-colors">Contact</a>
        </div>

        {/* Right Side: Legal Info */}
        <div className="flex gap-6 text-[9px] font-bold uppercase tracking-widest text-gray-400">
          <span>© 2026 AUTOMARC INC.</span>
          <a href="#" className="hover:text-black transition-colors">Privacy</a>
          <a href="#" className="hover:text-black transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
