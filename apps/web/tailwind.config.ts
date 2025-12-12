import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Deep Void Black
        surface: "#18181b",    // Zinc 900
        primary: {
          DEFAULT: "#00f2ea",  // Cyber Turquoise
          glow: "#00f2ea20",   // 20% opacity for glow effects
        },
        alert: "#ff3366",      // Distressed Asset Red
      },
      fontFamily: {
        mono: ["Geist Mono", "monospace"], // Vercel's engineered monospace font
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
