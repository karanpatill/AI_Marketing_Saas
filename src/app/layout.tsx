import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import TailwindCache from "@/components/TailwindCache";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
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
    description: "Tell us about your business. We handle the rest.",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
        <Navbar />
        <SmoothScroll>{children}</SmoothScroll>
        <TailwindCache />
      </body>
    </html>
  );
}
