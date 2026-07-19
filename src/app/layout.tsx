// Force layout style compilation rebuild trigger
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
