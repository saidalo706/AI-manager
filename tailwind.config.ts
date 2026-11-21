import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        canvas: token("canvas"),
        ink: token("ink"),
        mute: token("mute"),
        line: token("line"),
        hover: token("hover"),
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(0 0 0 / 0.08)",
        lift: "0 2px 4px rgb(0 0 0 / 0.05), 0 12px 28px -8px rgb(0 0 0 / 0.18)",
      },
      keyframes: {
        pop: { from: { opacity: "0", transform: "translateY(6px) scale(.98)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: { pop: "pop .25s ease-out both" },
    },
  },
  plugins: [],
};
export default config;
