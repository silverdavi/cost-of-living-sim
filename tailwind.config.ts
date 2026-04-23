import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FBF7F0",
        surface: "#F4EEE2",
        surface2: "#EDE4D1",
        ink: "#3A342E",
        muted: "#7A6F62",
        accent: {
          DEFAULT: "#E6A57E",
          soft: "#F1C4A5",
          deep: "#C67D55",
        },
        accent2: {
          DEFAULT: "#F4D58D",
          soft: "#F9E6B8",
        },
        ok: "#A9C5A0",
        warn: "#E8B96F",
        bad: "#D99A9A",
        line: "#E4D9C4",
      },
      fontFamily: {
        sans: ['"Heebo"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(58,52,46,0.04), 0 8px 24px rgba(58,52,46,0.06)",
        card: "0 1px 0 rgba(58,52,46,0.03), 0 20px 40px -20px rgba(198,125,85,0.15)",
      },
      keyframes: {
        drawIn: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        drawIn: "drawIn 1.4s ease-out forwards",
        fadeUp: "fadeUp 0.3s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};

export default config;
