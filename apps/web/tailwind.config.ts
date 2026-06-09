import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#07070d",
        "void-2": "#0c0c18",
        "void-3": "#141424",
        border: "#1e1e32",
        "border-2": "#2a2a44",
        violet: "#9333ea",
        fuchsia: "#ec4899",
        cyan: "#22d3ee",
        ink: "#f4f3ff",
        muted: "#64637a",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fadeIn 0.3s ease both",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) both",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "gradient-flow": "gradientFlow 3s ease infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        spin: "spin 0.8s linear infinite",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "none" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.94)" }, to: { opacity: "1", transform: "none" } },
        glowPulse: { "0%,100%": { boxShadow: "0 0 24px #9333ea55" }, "50%": { boxShadow: "0 0 48px #9333ea99, 0 0 80px #ec489933" } },
        gradientFlow: { "0%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" }, "100%": { backgroundPosition: "0% 50%" } },
        shimmer: { "0%": { opacity: "0.5" }, "50%": { opacity: "1" }, "100%": { opacity: "0.5" } },
        spin: { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #9333ea, #ec4899)",
        "accent-gradient-h": "linear-gradient(90deg, #9333ea, #ec4899)",
        "dark-gradient": "linear-gradient(180deg, transparent, #07070d)",
        "card-gradient": "linear-gradient(135deg, #0c0c18, #141424)",
      },
      boxShadow: {
        glow: "0 0 32px #9333ea44",
        "glow-sm": "0 0 16px #9333ea33",
        "glow-pink": "0 0 32px #ec489944",
        card: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px #1e1e32",
      },
    },
  },
  plugins: [],
};

export default config;
