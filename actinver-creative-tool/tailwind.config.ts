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
        // Paleta oficial Actinver (brandbook p.46)
        "azul-grandeza":       "#0A0E12", // Rich black — fondos primarios oscuros
        "azul-acompanamiento": "#1A2433", // Gunmetal — fondos secundarios, gradiente
        "azul-actinver":       "#314566", // Azul medio — formas, complementario
        "arena":               "#F5F2EB", // Sand — fondos claros
        "sunset":              "#E6C78A", // Gold — acento, CTA, punto logo
        "blanco":              "#FFFFFF",
      },
      fontFamily: {
        // Tipografía primaria (brandbook p.41)
        poppins: ["var(--font-poppins)", "sans-serif"],
        // Tipografía secundaria web (brandbook p.43)
        "open-sans": ["var(--font-open-sans)", "sans-serif"],
        // Script cursiva — exclusiva para "Fundador" en la insignia
        "bad-script": ["var(--font-bad-script)", "cursive"],
      },
      fontSize: {
        // Escala tipográfica — regla de 4 (brandbook p.44)
        "hero":  ["64px", { lineHeight: "1.1", letterSpacing: "-0.02em" }], // H1 n*4
        "h2":    ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em" }], // H2 n*2
        "body":  ["16px", { lineHeight: "1.5" }],                           // H3 base
        "legal": ["12px", { lineHeight: "1.4" }],                           // H4 n-4
      },
      backgroundImage: {
        // Gradiente oficial 40% Azul Grandeza → 60% Azul Acompañamiento (brandbook p.49)
        "brand-gradient-90":  "linear-gradient(90deg, #0A0E12 40%, #1A2433 100%)",
        "brand-gradient-180": "linear-gradient(180deg, #0A0E12 40%, #1A2433 100%)",
        "brand-gradient-45":  "linear-gradient(45deg, #0A0E12 40%, #1A2433 100%)",
      },
      aspectRatio: {
        "story":      "9 / 16",
        "square":     "1 / 1",
        "horizontal": "16 / 9",
      },
    },
  },
  plugins: [],
};
export default config;
