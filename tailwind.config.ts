import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        pine: {
          DEFAULT: "#26372E",
          light: "#33493D",
          dark: "#1A271F",
        },
        wood: {
          DEFAULT: "#6B4226",
          light: "#8A5A36",
          dark: "#4E301B",
        },
        cream: {
          DEFAULT: "#F5F0E6",
          dark: "#EAE1CE",
        },
        estado: {
          disponible: "#F5F0E6",
          sena: "#D6A238",
          pagado: "#8FA878",
          pendiente: "#B5502D",
        },
      },
    },
  },
  plugins: [],
};
export default config;
