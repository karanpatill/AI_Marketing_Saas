/** @type {import('tailwindcss').Config} */

// Every semantic colour reads a CSS variable from globals.css, so the theme can be
// re-skinned (or given a dark mode) without touching component code.
const v = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/backend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: v("canvas"),
        surface: { DEFAULT: v("surface"), 2: v("surface-2"), 3: v("surface-3") },
        ink: { DEFAULT: v("ink"), 2: v("ink-2"), 3: v("ink-3"), 4: v("ink-4") },
        line: { DEFAULT: v("line"), 2: v("line-2") },
        accent: {
          DEFAULT: v("accent"),
          hover: v("accent-hover"),
          soft: v("accent-soft"),
          ink: v("accent-ink"),
          on: v("on-accent"),
        },
        success: { DEFAULT: v("success"), soft: v("success-soft") },
        warning: { DEFAULT: v("warning"), soft: v("warning-soft") },
        danger: { DEFAULT: v("danger"), soft: v("danger-soft") },
        info: { DEFAULT: v("info"), soft: v("info-soft") },

        // Legacy aliases still referenced by un-migrated screens. Do not use in new code.
        primary: "#DEDBC8",
        brand: {
          primary: "#DEDBC8",
          secondary: "rgba(225, 224, 204, 0.7)",
          dark: "#000000",
          darkHover: "#101010",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // Type scale: display / title / body / label
        "display-lg": ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.02em", fontWeight: "500" }],
        "display": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em", fontWeight: "500" }],
        "title-lg": ["1.375rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em", fontWeight: "500" }],
        "title": ["1.125rem", { lineHeight: "1.5rem", letterSpacing: "-0.01em", fontWeight: "500" }],
        "title-sm": ["1rem", { lineHeight: "1.5rem", fontWeight: "500" }],
        "body-lg": ["1rem", { lineHeight: "1.5rem" }],
        "body": ["0.875rem", { lineHeight: "1.25rem" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.125rem" }],
        "label": ["0.75rem", { lineHeight: "1rem", fontWeight: "500", letterSpacing: "0.01em" }],
      },
      spacing: {
        sidebar: "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-width-collapsed)",
        topbar: "var(--topbar-height)",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};
