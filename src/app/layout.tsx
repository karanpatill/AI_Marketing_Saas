import type { Metadata } from "next";
import { Almarai, Instrument_Serif } from "next/font/google";
import "./globals.css";

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Automarc — Your Brand, Automated",
  description:
    "Tell us about your business. Automarc handles the rest. Brand Memory, Moodboard Studio, AI Content Factory, and Competitor Intelligence — all in one platform.",
  keywords: [
    "AI marketing automation",
    "social media automation",
    "brand identity AI",
    "moodboard generator",
    "AI content factory",
    "marketing OS",
    "Automarc",
  ],
  openGraph: {
    title: "Automarc — Your Brand, Automated",
    description:
      "Tell us about your business. We handle the rest.",
    type: "website",
  },
};

import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${almarai.variable} ${instrumentSerif.variable}`}
    >
      <body className="bg-black text-[#E1E0CC] min-h-screen font-sans antialiased selection:bg-[#DEDBC8]/20 selection:text-[#E1E0CC]">
        <Navbar />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
