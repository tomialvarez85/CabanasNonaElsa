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
        // Fondo oscuro: no es negro puro, tiene una base verdosa muy oscura
        // (mismo matiz que "pine" llevado casi a negro) para que combine con
        // el resto de la paleta en vez de leer como un gris neutro.
        ink: {
          DEFAULT: "#10120F",
          light: "#1A1E19",
          dark: "#080907",
        },
        // "Disponible" ya no es un color propio: una celda/día libre usa el
        // mismo tono neutro que el resto de las superficies (ink-light), así
        // los 3 estados con reserva son los que realmente resaltan.
        estado: {
          sena: "#D6A238",
          pagado: "#8FA878",
          // Mismo matiz terracota que antes (~16° de tono), pero más
          // luminoso: la versión original (#B5502D) daba buen contraste como
          // fondo con texto claro encima, pero muy poco como texto plano
          // sobre el fondo oscuro nuevo. Este tono sirve para las dos cosas.
          pendiente: "#E06B3F",
        },
      },
    },
  },
  plugins: [],
};
export default config;
