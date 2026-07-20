import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "About Us | Automarc",
  description: "Learn more about the team behind Automarc.",
};

export default function AboutUs() {
  return (
    <main className="relative bg-black min-h-screen text-[#E1E0CC] flex flex-col justify-between">
      <div className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-16 pt-32 pb-20">
        <a 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-medium text-[#E1E0CC]/60 hover:text-[#E1E0CC] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </a>

        <div className="bg-[#101010] rounded-2xl border border-[#E1E0CC]/10 p-8 md:p-12 space-y-8 shadow-2xl">
          <div>
            <span className="text-[#DEDBC8] text-[10px] uppercase tracking-widest mb-3 block font-mono">
              01 // ABOUT OUR SYSTEM
            </span>
            <h1 className="text-4xl md:text-5xl font-normal leading-[0.95] text-[#E1E0CC]">
              About <span className="font-serif italic">Automarc.</span>
            </h1>
          </div>

          <p className="text-[#E1E0CC]/80 text-lg md:text-xl leading-[1.6] font-light">
            We built Automarc because we were tired of jumping between ten different tools just to maintain a brand presence online.
          </p>

          <div className="space-y-4 pt-4 border-t border-[#E1E0CC]/10">
            <h2 className="text-xl font-medium text-[#E1E0CC]">Our Mission</h2>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] font-light">
              To empower founders, marketers, and creators with an AI-driven operating system that understands their brand DNA as well as they do.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E1E0CC]/10">
            <h2 className="text-xl font-medium text-[#E1E0CC]">Contact</h2>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] font-light">
              Have questions? Reach out to us at{" "}
              <a href="mailto:hello@automarc.ai" className="text-[#DEDBC8] hover:text-[#E1E0CC] underline-offset-2 hover:underline font-medium">
                hello@automarc.ai
              </a>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
