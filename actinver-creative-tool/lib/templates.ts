// Tipos y constantes del sistema de plantillas
// Fuente de verdad para formatos, proporciones y configuración de canvas

export type FormatKey = "story" | "square" | "horizontal" | "poster";

export interface Format {
  key: FormatKey;
  label: string;
  description: string;
  width: number;
  height: number;
  aspectRatio: string;
  tailwindClass: string;
}

export const FORMATS: Record<FormatKey, Format> = {
  story: {
    key: "story",
    label: "Story",
    description: "9:16",
    width: 1080,
    height: 1920,
    aspectRatio: "9 / 16",
    tailwindClass: "aspect-[9/16]",
  },
  square: {
    key: "square",
    label: "Cuadrado",
    description: "1:1",
    width: 1080,
    height: 1080,
    aspectRatio: "1 / 1",
    tailwindClass: "aspect-square",
  },
  horizontal: {
    key: "horizontal",
    label: "Horizontal",
    description: "16:9",
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    tailwindClass: "aspect-video",
  },
  poster: {
    key: "poster",
    label: "Póster",
    description: "3:4",
    width: 1080,
    height: 1440,
    aspectRatio: "3 / 4",
    tailwindClass: "aspect-[3/4]",
  },
};

export const DEFAULT_FORMAT: FormatKey = "story";
export const FORMAT_KEYS: FormatKey[] = ["story", "square", "horizontal", "poster"];

// Dimensiones nativas CSS del canvas (se exportan escaladas a resolución final)
// Dimensiones nativas: deben ser proporcionales al formato de salida.
// story 9:16   → 380 × (380 × 16/9) = 380 × 676  → export 1080 × 1921 ≈ 1080×1920 ✓
// square 1:1   → 540 × 540                         → export 1080 × 1080 ✓
// horizontal   → 960 × 540 (16:9)                  → export 1920 × 1080 ✓
// poster 3:4   → 540 × 720                          → export 1080 × 1440 ✓
export const NATIVE: Record<FormatKey, { w: number; h: number }> = {
  story:      { w: 380, h: 676 },
  square:     { w: 540, h: 540 },
  horizontal: { w: 960, h: 540 },
  poster:     { w: 540, h: 720 },
};

// ── Canales sociales ─────────────────────────────────────────────────────────
export type SocialChannel = "instagram" | "linkedin" | "x" | "facebook";

export const SOCIAL_CHANNELS: { key: SocialChannel; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "linkedin",  label: "LinkedIn" },
  { key: "x",         label: "X" },
  { key: "facebook",  label: "Facebook" },
];

export interface ChannelCaption {
  channel: SocialChannel;
  caption: string;
  hashtags: string;
}

export const CAPTION_LIMITS: Record<SocialChannel, number> = {
  instagram: 2200,
  linkedin:  3000,
  x:         280,
  facebook:  2000,
};

// ── Filtros del brief ─────────────────────────────────────────────────────────
export type Genero    = "hombre" | "mujer" | "ambos";
export type EdadRango = "25-35" | "36-50" | "51-65";
export type TipoPieza = "educativa" | "promo" | "institucional";
export type LogoAlign = "left" | "right" | "center";
export type CardStyle = "solid" | "glass";

// ── Brief del usuario (inputs del editor) ────────────────────────────────────
export interface CreatorInput {
  product: string;           // Producto o tema del que quieres hablar
  message: string;           // Qué quieres comunicar
  channels: SocialChannel[]; // Canales para generar captions
  genero: Genero;            // Audiencia: género objetivo
  edadRango: EdadRango;      // Audiencia: rango de edad
  tipoPieza: TipoPieza;      // Tipo de pieza (educativa / promo / institucional)
  conCTA: boolean;           // Incluir llamada a la acción
  conBadge: boolean;         // Mostrar badge "El privilegio de ser Fundador"
  logoAlign: LogoAlign;      // Alineación del logo (izquierda / derecha)
  cardStyle: CardStyle;      // Estilo del card de texto (sólido / glass)
}

export const CREATOR_LIMITS = {
  product: 120,
  message: 300,
} as const;

export const DEFAULT_CREATOR_INPUT: CreatorInput = {
  product: "",
  message: "",
  channels: [],
  genero: "ambos",
  edadRango: "36-50",
  tipoPieza: "educativa",
  conCTA: true,
  conBadge: true,
  logoAlign: "left",
  cardStyle: "solid",
};

// ── Contenido generado (lo que va en la pieza) ────────────────────────────────
export interface PieceContent {
  title: string;        // max 48 chars
  description: string;  // max 180 chars
  cta: string;          // max 30 chars
  highlight?: string;   // max 60 chars — frase de impacto, resaltada en la pieza (especialmente en Promo)
}

export const CHAR_LIMITS = {
  title:       48,
  description: 180,
  cta:         30,
  highlight:   60,
} as const;

export const DEFAULT_CONTENT: PieceContent = {
  title: "",
  description: "",
  cta: "",
  highlight: "",
};
