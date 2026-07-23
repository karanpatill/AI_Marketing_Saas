import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Automarc",
  description: "Terms of service and usage policy for Automarc AI Marketing SaaS.",
};

export default function TermsOfService() {
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
              LEGAL & GOVERNANCE
            </span>
            <h1 className="text-4xl md:text-5xl font-normal leading-[0.95] text-[#E1E0CC]">
              Terms of <span className="font-serif italic">Service.</span>
            </h1>
            <p className="text-xs font-mono text-[#E1E0CC]/40 mt-2">
              Effective Date: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E1E0CC]/10">
            <h2 className="text-xl font-medium text-[#E1E0CC]">1. Acceptance of Terms</h2>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] font-light">
              By creating an account or accessing the Automarc platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E1E0CC]/10">
            <h2 className="text-xl font-medium text-[#E1E0CC]">2. AI Content & Generative Output</h2>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] font-light">
              Automarc utilizes artificial intelligence models to generate marketing copy, carousels, and visual assets based on your input. You retain ownership of the final assets generated for your brand. Automarc makes no warranties regarding trademark availability of generated slogans or logos.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E1E0CC]/10">
            <h2 className="text-xl font-medium text-[#E1E0CC]">3. User Responsibilities & Acceptable Use</h2>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] font-light">
              You are responsible for maintaining the confidentiality of your account credentials. You agree not to use Automarc to generate deceptive, harmful, illegal, or spammy marketing material.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E1E0CC]/10">
            <h2 className="text-xl font-medium text-[#E1E0CC]">4. Subscription Tiers & Billing</h2>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] font-light">
              Paid subscriptions are billed on a recurring monthly or annual basis. You may cancel your subscription at any time through the billing dashboard. Refunds are granted in accordance with our 14-day satisfaction policy.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E1E0CC]/10">
            <h2 className="text-xl font-medium text-[#E1E0CC]">5. Limitation of Liability</h2>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] font-light">
              Automarc shall not be liable for any indirect, incidental, or consequential damages resulting from your use of generated marketing content or third-party social platform API outages.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
