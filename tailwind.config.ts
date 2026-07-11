import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3F4F1",
        ink: "#1E2A44",
        rule: "#6E8FC7",
        margin: "#C0473F",
        card: "#FFFFFF",
        muted: "#5B6472",
      },
      fontFamily: {
        display: ["var(--font-space-mono)", "monospace"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
