// Sistema de layouts declarativos para piezas creativas.
// Cada layout define tokens visuales por formato (story, square, horizontal).
// Para agregar un nuevo layout, solo se necesita definir un nuevo LayoutConfig.

import { FormatKey } from "./templates";

export interface LayoutTokens {
  logo: { width: number; height: number };
  badge: { px: number; py: number; fontSize: number };
  header: { paddingTop: number; paddingX: number };
  title: { fontSize: number; letterSpacing: string; maxWidth?: number };
  card: {
    padding: number;
    borderRadius: number;
    gap: number;
    direction: "column" | "row";
    maxWidth?: number;
  };
  description: { fontSize: number };
  cta: { fontSize: number };
  content: { paddingBottom: number; paddingX: number; gap: number };
  gradient: string;
}

export interface LayoutConfig {
  id: string;
  name: string;
  description: string;
  tokens: Record<FormatKey, LayoutTokens>;
}

// ── Layout por defecto — extraído de los canvas originales ────────────────────
const BG = "#0a0e12";

export const DEFAULT_LAYOUT: LayoutConfig = {
  id: "fundador-classic",
  name: "Fundador Classic",
  description: "Layout original con gradiente cinematográfico, glass card y badge Fundador",
  tokens: {
    story: {
      logo: { width: 102, height: 24 },
      badge: { px: 14, py: 6, fontSize: 12 },
      header: { paddingTop: 40, paddingX: 32 },
      title: { fontSize: 44, letterSpacing: "-1.5px" },
      card: { padding: 24, borderRadius: 12, gap: 16, direction: "column" },
      description: { fontSize: 16 },
      cta: { fontSize: 14 },
      content: { paddingBottom: 32, paddingX: 32, gap: 24 },
      gradient: `linear-gradient(to top, ${BG} 0%, ${BG}ee 20%, ${BG}88 45%, transparent 70%)`,
    },
    square: {
      logo: { width: 119, height: 28 },
      badge: { px: 16, py: 8, fontSize: 14 },
      header: { paddingTop: 40, paddingX: 40 },
      title: { fontSize: 44, letterSpacing: "-1.5px" },
      card: { padding: 24, borderRadius: 12, gap: 24, direction: "row" },
      description: { fontSize: 15 },
      cta: { fontSize: 14 },
      content: { paddingBottom: 40, paddingX: 40, gap: 24 },
      gradient: `linear-gradient(to top, ${BG} 0%, ${BG}ee 20%, ${BG}88 45%, transparent 70%)`,
    },
    horizontal: {
      logo: { width: 136, height: 32 },
      badge: { px: 20, py: 10, fontSize: 16 },
      header: { paddingTop: 48, paddingX: 48 },
      title: { fontSize: 56, letterSpacing: "-1.5px", maxWidth: 800 },
      card: { padding: 28, borderRadius: 12, gap: 32, direction: "row", maxWidth: 800 },
      description: { fontSize: 18 },
      cta: { fontSize: 16 },
      content: { paddingBottom: 48, paddingX: 48, gap: 32 },
      gradient: `linear-gradient(to top, ${BG} 0%, ${BG}ee 20%, ${BG}88 45%, transparent 70%)`,
    },
    poster: {
      logo: { width: 110, height: 26 },
      badge: { px: 14, py: 6, fontSize: 12 },
      header: { paddingTop: 44, paddingX: 36 },
      title: { fontSize: 52, letterSpacing: "-1.5px" },
      card: { padding: 28, borderRadius: 14, gap: 20, direction: "column" },
      description: { fontSize: 17 },
      cta: { fontSize: 15 },
      content: { paddingBottom: 48, paddingX: 36, gap: 28 },
      gradient: `linear-gradient(to top, ${BG} 0%, ${BG}ee 25%, ${BG}88 50%, transparent 72%)`,
    },
  },
};

// ── Registro de layouts disponibles ───────────────────────────────────────────
export const LAYOUTS: LayoutConfig[] = [DEFAULT_LAYOUT];

export function getLayoutById(id: string): LayoutConfig {
  return LAYOUTS.find((l) => l.id === id) ?? DEFAULT_LAYOUT;
}
