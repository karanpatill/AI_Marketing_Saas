/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary) / <alpha-value>)",
          dark: "rgb(var(--brand-dark) / <alpha-value>)",
          darkHover: "rgb(var(--brand-dark-hover) / <alpha-value>)",
        },
        bg: {
          light: "#F8F7FF",
          dark: "#0D0B1E",
        },
        surface: {
          dark: "#13112A",
        },
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)", filter: "blur(6px)" },
          to: { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "hero-rise": {
          from: { opacity: "0", transform: "translateY(64px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-down": "fade-down 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "hero-rise": "hero-rise 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "marquee": "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
