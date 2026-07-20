import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Automarc",
  description: "Privacy policy and data handling for Automarc.",
};

export default function PrivacyPolicy() {
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
              LEGAL & SECURITY
            </span>
            <h1 className="text-4xl md:text-5xl font-normal leading-[0.95] text-[#E1E0CC]">
              Privacy <span className="font-serif italic">Policy.</span>
            </h1>
            <p className="text-xs font-mono text-[#E1E0CC]/40 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E1E0CC]/10">
            <h2 className="text-xl font-medium text-[#E1E0CC]">1. Information We Collect</h2>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] font-light">
              When you use Automarc, we collect information you provide directly to us, such as your brand assets, logo files, business details, and account credentials.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E1E0CC]/10">
            <h2 className="text-xl font-medium text-[#E1E0CC]">2. How We Use Information</h2>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] font-light">
              We use the information we collect to provide, maintain, and improve our services. Specifically, your brand data is used by our AI models (including Google Gemini) solely for the purpose of generating content for your account.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E1E0CC]/10">
            <h2 className="text-xl font-medium text-[#E1E0CC]">3. Data Security</h2>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] font-light">
              We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
