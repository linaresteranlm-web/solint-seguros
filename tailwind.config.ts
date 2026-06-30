import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solint: {
          50: "#f8fafc",
          100: "#eef2ff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          900: "#0f172a",
        },
      },
      boxShadow: {
        enterprise: "0 24px 80px rgba(15, 23, 42, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
