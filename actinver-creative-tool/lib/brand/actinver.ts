// Configuración de marca Actinver — centraliza todos los valores
// que antes estaban dispersos en múltiples archivos.

import { BrandConfig } from "./brand-config";

export const ACTINVER_BRAND: BrandConfig = {
  id: "actinver",
  name: "Actinver",

  colors: {
    primary: "#0A0E12",       // Azul Grandeza / Rich Black
    secondary: "#1A2433",     // Azul Acompañamiento / Gunmetal
    accent: "#E6C78A",        // Sunset / Gold
    surface: "#F5F2EB",       // Arena / Sand
    onPrimary: "#FFFFFF",     // Blanco
    complementary: "#314566", // Azul Actinver
  },

  fonts: {
    primary: "var(--font-poppins)",
    secondary: "var(--font-open-sans)",
    accent: "var(--font-bad-script)",
  },

  logo: {
    light: "/actinver-logo.svg",
    dark: "/actinver-logo.svg", // Solo hay versión clara por ahora
  },

  badge: {
    prefix: "El privilegio de ser",
    highlight: "Fundador",
  },

  // Markdown cargado en runtime por content-generator.ts vía fs.readFileSync
  narrativa: "lib/brand/narrativa.md",
  visual: "lib/brand/visual.md",

  sceneMap: [
    {
      keywords: ["auto", "coche", "carro", "vehículo", "vehiculo", "automóvil", "automovil"],
      scene: "Luxury dark sedan parked on a wet Mexico City street at night, cinematic lighting, rain reflections on pavement, deep navy and black tones, dramatic rim lighting on car body, bokeh city lights in background, photorealistic, editorial automotive photography",
    },
    {
      keywords: ["fondo", "inversión", "inversion", "rendimiento", "liquidez", "cetes", "mesa de dinero"],
      scene: "Mexican executive in modern high-rise office at night, city lights through floor-to-ceiling windows, financial screens with subtle charts, dramatic blue cinematic lighting, deep navy tones, photorealistic",
    },
    {
      keywords: ["bolsa", "acciones", "mercado", "bursátil", "bursatil", "trading"],
      scene: "Financial operator at multiple screens showing stock market data, nighttime office, city skyline reflection, deep blue cinematic atmosphere, photorealistic",
    },
    {
      keywords: ["seguro de vida", "vida", "familia", "protección familiar", "proteccion familiar"],
      scene: "Mexican family in warm modern home, father with children, golden soft light, intimate moment, dark background with warm highlights, cinematic portrait, photorealistic",
    },
    {
      keywords: ["retiro", "pensión", "pension", "independencia", "jubilación", "jubilacion"],
      scene: "Mature professional on luxury terrace overlooking city at sunset, sense of freedom and achievement, cinematic warm-to-dark tones, photorealistic",
    },
    {
      keywords: ["crédito", "credito", "financiamiento", "préstamo", "prestamo", "empresa"],
      scene: "Mexican entrepreneur reviewing plans in modern office, dramatic directional lighting, deep blue tones, photorealistic",
    },
    {
      keywords: ["dólar", "dolar", "divisa", "forex", "usd", "cobertura"],
      scene: "Businessman at international airport terminal, global perspective, cinematic blue tones, dramatic lighting, photorealistic",
    },
    {
      keywords: ["fiduciario", "fideicomiso", "legado", "herencia", "sucesión", "sucesion"],
      scene: "Two executives signing documents in luxury notary office, classical library background, dramatic warm lighting, photorealistic",
    },
    {
      keywords: ["inmueble", "bienes raíces", "bienes raices", "propiedad", "casa", "edificio"],
      scene: "Modern luxury residential architecture in Mexico City at night, warm interior lights, cinematic exterior photography, photorealistic",
    },
    {
      keywords: ["nómina", "nomina", "cuenta", "payroll"],
      scene: "Executive team in high-end boardroom, collaborative meeting, dramatic lighting, deep blue tones, photorealistic",
    },
    {
      keywords: ["patrimonio", "gestión", "gestion", "portafolio", "asesor"],
      scene: "Two executives in premium boardroom, elegant documents, architectural luxury interior, deep blue cinematic lighting, photorealistic",
    },
  ],

  productPresets: [
    {
      label: "Fondos",
      product: "Fondos de inversión de corto plazo",
      message: "",
    },
    {
      label: "Acciones",
      product: "Inversión en acciones y mercado bursátil",
      message: "",
    },
    {
      label: "Retiro",
      product: "Plan de retiro Actinver",
      message: "",
    },
    {
      label: "Divisas",
      product: "Inversión en divisas y mercado de cambios",
      message: "",
    },
    {
      label: "Seguro",
      product: "Seguros patrimoniales Actinver",
      message: "",
    },
  ],
};
