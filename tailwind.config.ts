import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "commit-ink": "#1E293B",
        "commit-amber": "#F59E0B",
        "commit-blue": "#1E40AF",
        "commit-slate": "#0F172A"
      }
    }
  },
  plugins: []
};

export default config;
