import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "How It Works | Automarc",
  description: "Learn how Automarc automates your brand's marketing.",
};

const STEPS = [
  {
    num: "01",
    title: "Brand Memory & Setup",
    desc: "Start by connecting your existing assets and defining your brand DNA. Automarc learns your tone of voice, visual identity, and core messaging."
  },
  {
    num: "02",
    title: "The AI Content Factory",
    desc: "Once your brand is defined, our AI generation engines start producing on-brand social posts, carousel graphics, and copy within seconds."
  },
  {
    num: "03",
    title: "Auto-Scheduling Pipeline",
    desc: "Review the generated content and drop it into the calendar. Automarc handles the posting to your integrated Instagram channels."
  }
];

export default function HowItWorks() {
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

        <div className="space-y-8">
          <div>
            <span className="text-[#DEDBC8] text-[10px] uppercase tracking-widest mb-3 block font-mono">
              SYSTEM WORKFLOW
            </span>
            <h1 className="text-4xl md:text-5xl font-normal leading-[0.95] text-[#E1E0CC]">
              How It <span className="font-serif italic">Works.</span>
            </h1>
            <p className="text-[#E1E0CC]/70 text-sm md:text-base leading-[1.6] mt-4 max-w-2xl font-light">
              Automarc is designed to be your all-in-one AI marketing OS. Here&apos;s a quick overview of how you can put it to work for your brand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-[#101010] rounded-2xl border border-[#E1E0CC]/10 p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[#E1E0CC]/20 text-5xl font-bold font-mono block mb-2">
                    {step.num}
                  </span>
                  <h2 className="text-lg font-medium text-[#E1E0CC] mb-2">
                    {step.title}
                  </h2>
                  <p className="text-[#E1E0CC]/70 text-sm leading-[1.6] font-light">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
