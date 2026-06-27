import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        lato: ["var(--font-lato)", "sans-serif"],
      },
      colors: {
        burgundy: {
          DEFAULT: "#8C3A63",
          secondary: "#A04A74",
          dark: "#6D2C4E",
          light: "#F8F6F7",
        },
        accent: {
          beige: "#F3E9E5",
        },
      },
      transitionDuration: {
        "200": "200ms",
        "300": "300ms",
        "500": "500ms",
      },
      boxShadow: {
        "card": "0 2px 12px rgba(140, 58, 99, 0.08)",
        "card-hover": "0 8px 28px rgba(140, 58, 99, 0.16)",
        "nav": "0 1px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
