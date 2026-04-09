// Tipo centralizado para la configuración de marca.
// Cada marca define colores, tipografía, logo, copy rules, scene map y product presets.
// Para soportar una nueva marca: crear un archivo como actinver.ts e implementar BrandConfig.

export interface BrandColors {
  primary: string;        // Fondo principal (ej: #0A0E12)
  secondary: string;      // Fondo secundario (ej: #1A2433)
  accent: string;         // Acento/CTA (ej: #E6C78A)
  surface: string;        // Fondo claro alterno (ej: #F5F2EB)
  onPrimary: string;      // Texto sobre fondos oscuros (ej: #FFFFFF)
  complementary: string;  // Formas complementarias (ej: #314566)
}

export interface SceneMapping {
  keywords: string[];
  scene: string;
}

export interface ProductPreset {
  label: string;
  product: string;
  message: string;
}

export interface BrandConfig {
  id: string;
  name: string;
  colors: BrandColors;
  fonts: {
    primary: string;    // CSS var (ej: "var(--font-poppins)")
    secondary: string;  // CSS var (ej: "var(--font-open-sans)")
    accent?: string;    // CSS var para elementos decorativos
  };
  logo: {
    light: string;    // Path al logo claro (sobre fondos oscuros)
    dark: string;     // Path al logo oscuro (sobre fondos claros)
  };
  badge?: {
    prefix: string;   // "El privilegio de ser"
    highlight: string; // "Fundador"
  };
  narrativa: string;    // Markdown con reglas de copy
  visual: string;       // Markdown con reglas visuales
  sceneMap: SceneMapping[];
  productPresets: ProductPreset[];
}
