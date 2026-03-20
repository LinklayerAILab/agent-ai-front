import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx,scss,css}",
    "./components/**/*.{js,ts,jsx,tsx,mdx,css,scss}",
    "./app/**/*.{js,ts,jsx,tsx,mdx,scss,css}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
