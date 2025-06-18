import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#7C3AED",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1F1F1F",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#2A2A2A",
          foreground: "#A1A1AA",
        },
        accent: {
          DEFAULT: "#18181B",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#18181B",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#18181B",
          foreground: "#FFFFFF",
        },
        border: "#27272A",
        input: "#27272A",
        ring: "#7C3AED",
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config 