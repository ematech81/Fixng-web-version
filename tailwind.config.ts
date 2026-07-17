import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Material Design 3 token palette (from design spec) ──────────────────
        "primary":                    "#004ac6",
        "primary-container":          "#2563eb",
        "primary-fixed":              "#dbe1ff",
        "primary-fixed-dim":          "#b4c5ff",
        "on-primary":                 "#ffffff",
        "on-primary-container":       "#eeefff",
        "on-primary-fixed":           "#00174b",
        "on-primary-fixed-variant":   "#003ea8",
        "inverse-primary":            "#b4c5ff",

        "secondary":                  "#735c00",
        "secondary-container":        "#fcd34d",
        "secondary-fixed":            "#ffe086",
        "secondary-fixed-dim":        "#eac33e",
        "on-secondary":               "#ffffff",
        "on-secondary-container":     "#725b00",
        "on-secondary-fixed":         "#231b00",
        "on-secondary-fixed-variant": "#574500",

        "tertiary":                   "#006229",
        "tertiary-container":         "#007e37",
        "tertiary-fixed":             "#6bff8f",
        "tertiary-fixed-dim":         "#4ae176",
        "on-tertiary":                "#ffffff",
        "on-tertiary-container":      "#c1ffc5",
        "on-tertiary-fixed":          "#002109",
        "on-tertiary-fixed-variant":  "#005321",

        "error":                      "#ba1a1a",
        "error-container":            "#ffdad6",
        "on-error":                   "#ffffff",
        "on-error-container":         "#93000a",

        "surface":                    "#f8f9ff",
        "surface-dim":                "#cbdbf5",
        "surface-bright":             "#f8f9ff",
        "surface-variant":            "#d3e4fe",
        "surface-tint":               "#0053db",
        "surface-container-lowest":   "#ffffff",
        "surface-container-low":      "#eff4ff",
        "surface-container":          "#e5eeff",
        "surface-container-high":     "#dce9ff",
        "surface-container-highest":  "#d3e4fe",
        "on-surface":                 "#0b1c30",
        "on-surface-variant":         "#434655",
        "inverse-surface":            "#213145",
        "inverse-on-surface":         "#eaf1ff",

        "background":                 "#f8f9ff",
        "on-background":              "#0b1c30",

        "outline":                    "#737686",
        "outline-variant":            "#c3c6d7",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg:      "0.5rem",
        xl:      "0.75rem",
        "2xl":   "1rem",
        "3xl":   "1.5rem",
        full:    "9999px",
      },
      spacing: {
        xs:               "4px",
        sm:               "8px",
        md:               "16px",
        lg:               "24px",
        xl:               "32px",
        "margin-mobile":  "16px",
        "margin-desktop": "48px",
        gutter:           "16px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        "label-sm":          ["12px", { lineHeight: "16px", fontWeight: "600" }],
        "label-md":          ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "500" }],
        "body-md":           ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg":           ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-md":       ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg":       ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile":["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "display-lg":        ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "800" }],
      },
      animation: {
        "bounce-slow": "bounce 3s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
