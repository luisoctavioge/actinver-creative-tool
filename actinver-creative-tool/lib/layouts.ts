// Sistema de layouts declarativos para piezas creativas.
// Cada layout define tokens visuales por formato.
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

// ── Tokens para el layout Editorial ─────────────────────────────────────────
// Estructura completamente distinta: imagen arriba, texto abajo, sin glass card.

export interface EditorialTokens {
  imageHeightPercent: number;        // % de la altura total para la imagen (0.50–0.65)
  categoryLabel: { fontSize: number; paddingTop: number; paddingRight: number };
  title: { fontSize: number; letterSpacing: string; lineHeight: number };
  accentTitle: { fontSize: number }; // subtítulo o ticker en gold
  body: { fontSize: number; lineHeight: number };
  logo: { width: number; height: number };
  padding: { x: number; bottom: number };
  gap: number;                       // gap entre título, body, logo
}

export const EDITORIAL_TOKENS: Record<FormatKey, EditorialTokens> = {
  story: {
    imageHeightPercent: 0.55,
    categoryLabel: { fontSize: 12, paddingTop: 36, paddingRight: 28 },
    title: { fontSize: 38, letterSpacing: "-0.5px", lineHeight: 1.05 },
    accentTitle: { fontSize: 28 },
    body: { fontSize: 15, lineHeight: 1.55 },
    logo: { width: 88, height: 21 },
    padding: { x: 28, bottom: 32 },
    gap: 16,
  },
  square: {
    imageHeightPercent: 0.52,
    categoryLabel: { fontSize: 13, paddingTop: 32, paddingRight: 32 },
    title: { fontSize: 36, letterSpacing: "-0.5px", lineHeight: 1.05 },
    accentTitle: { fontSize: 26 },
    body: { fontSize: 14, lineHeight: 1.55 },
    logo: { width: 96, height: 23 },
    padding: { x: 32, bottom: 28 },
    gap: 14,
  },
  horizontal: {
    imageHeightPercent: 0.50,
    categoryLabel: { fontSize: 14, paddingTop: 36, paddingRight: 40 },
    title: { fontSize: 44, letterSpacing: "-0.5px", lineHeight: 1.05 },
    accentTitle: { fontSize: 32 },
    body: { fontSize: 16, lineHeight: 1.55 },
    logo: { width: 110, height: 26 },
    padding: { x: 40, bottom: 36 },
    gap: 18,
  },
  poster: {
    imageHeightPercent: 0.52,
    categoryLabel: { fontSize: 12, paddingTop: 36, paddingRight: 32 },
    title: { fontSize: 42, letterSpacing: "-0.5px", lineHeight: 1.05 },
    accentTitle: { fontSize: 30 },
    body: { fontSize: 15, lineHeight: 1.55 },
    logo: { width: 96, height: 23 },
    padding: { x: 32, bottom: 36 },
    gap: 16,
  },
  "fullhd-v": {
    imageHeightPercent: 0.55,
    categoryLabel: { fontSize: 12, paddingTop: 36, paddingRight: 28 },
    title: { fontSize: 38, letterSpacing: "-0.5px", lineHeight: 1.05 },
    accentTitle: { fontSize: 28 },
    body: { fontSize: 15, lineHeight: 1.55 },
    logo: { width: 88, height: 21 },
    padding: { x: 28, bottom: 32 },
    gap: 16,
  },
  "fullhd-h": {
    imageHeightPercent: 0.50,
    categoryLabel: { fontSize: 14, paddingTop: 36, paddingRight: 40 },
    title: { fontSize: 44, letterSpacing: "-0.5px", lineHeight: 1.05 },
    accentTitle: { fontSize: 32 },
    body: { fontSize: 16, lineHeight: 1.55 },
    logo: { width: 110, height: 26 },
    padding: { x: 40, bottom: 36 },
    gap: 18,
  },
  "email-internal": {
    imageHeightPercent: 0.48,
    categoryLabel: { fontSize: 11, paddingTop: 24, paddingRight: 24 },
    title: { fontSize: 30, letterSpacing: "-0.3px", lineHeight: 1.05 },
    accentTitle: { fontSize: 22 },
    body: { fontSize: 13, lineHeight: 1.55 },
    logo: { width: 80, height: 19 },
    padding: { x: 24, bottom: 24 },
    gap: 12,
  },
  "email-client": {
    imageHeightPercent: 0.48,
    categoryLabel: { fontSize: 11, paddingTop: 24, paddingRight: 24 },
    title: { fontSize: 30, letterSpacing: "-0.3px", lineHeight: 1.05 },
    accentTitle: { fontSize: 22 },
    body: { fontSize: 13, lineHeight: 1.55 },
    logo: { width: 80, height: 19 },
    padding: { x: 24, bottom: 24 },
    gap: 12,
  },
  "event-invitation": {
    imageHeightPercent: 0.50,
    categoryLabel: { fontSize: 12, paddingTop: 32, paddingRight: 28 },
    title: { fontSize: 34, letterSpacing: "-0.4px", lineHeight: 1.05 },
    accentTitle: { fontSize: 24 },
    body: { fontSize: 14, lineHeight: 1.55 },
    logo: { width: 88, height: 21 },
    padding: { x: 28, bottom: 28 },
    gap: 14,
  },
};

// ── Layout por defecto — extraído de los canvas originales ────────────────────
const BG = "#0a0e12";

export const DEFAULT_LAYOUT: LayoutConfig = {
  id: "fundador-classic",
  name: "Fundador Classic",
  description: "Layout original con gradiente cinematográfico, glass card y badge Fundador",
  tokens: {
    // ── Formatos originales (v1) ──────────────────────────────────────────────
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

    // ── Pantallas internas (v2) — mismas dims que story/horizontal, tokens propios ─
    "fullhd-v": {
      logo: { width: 110, height: 26 },
      badge: { px: 14, py: 6, fontSize: 12 },
      header: { paddingTop: 44, paddingX: 36 },
      title: { fontSize: 48, letterSpacing: "-1.5px" },
      card: { padding: 24, borderRadius: 12, gap: 16, direction: "column" },
      description: { fontSize: 17 },
      cta: { fontSize: 15 },
      content: { paddingBottom: 36, paddingX: 36, gap: 24 },
      gradient: `linear-gradient(to top, ${BG} 0%, ${BG}ee 20%, ${BG}88 45%, transparent 70%)`,
    },
    "fullhd-h": {
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

    // ── Email templates (v2) — formato más compacto para 600px de ancho ──────
    "email-internal": {
      logo: { width: 96, height: 22 },
      badge: { px: 12, py: 5, fontSize: 11 },
      header: { paddingTop: 28, paddingX: 28 },
      title: { fontSize: 36, letterSpacing: "-1px" },
      card: { padding: 20, borderRadius: 10, gap: 14, direction: "column" },
      description: { fontSize: 14 },
      cta: { fontSize: 13 },
      content: { paddingBottom: 28, paddingX: 28, gap: 20 },
      gradient: `linear-gradient(to top, ${BG} 0%, ${BG}ee 22%, ${BG}88 48%, transparent 72%)`,
    },
    "email-client": {
      logo: { width: 96, height: 22 },
      badge: { px: 12, py: 5, fontSize: 11 },
      header: { paddingTop: 28, paddingX: 28 },
      title: { fontSize: 36, letterSpacing: "-1px" },
      card: { padding: 20, borderRadius: 10, gap: 14, direction: "column" },
      description: { fontSize: 14 },
      cta: { fontSize: 13 },
      content: { paddingBottom: 28, paddingX: 28, gap: 20 },
      gradient: `linear-gradient(to top, ${BG} 0%, ${BG}ee 22%, ${BG}88 48%, transparent 72%)`,
    },

    // ── Invitaciones a eventos (v2) — 4:5 portrait con espacio para datos ────
    "event-invitation": {
      logo: { width: 102, height: 24 },
      badge: { px: 14, py: 6, fontSize: 12 },
      header: { paddingTop: 36, paddingX: 32 },
      title: { fontSize: 40, letterSpacing: "-1.2px" },
      card: { padding: 24, borderRadius: 12, gap: 16, direction: "column" },
      description: { fontSize: 15 },
      cta: { fontSize: 14 },
      content: { paddingBottom: 32, paddingX: 32, gap: 20 },
      gradient: `linear-gradient(to top, ${BG} 0%, ${BG}ee 25%, ${BG}88 50%, transparent 72%)`,
    },
  },
};

// ── Registro de layouts disponibles ───────────────────────────────────────────
export const LAYOUTS: LayoutConfig[] = [DEFAULT_LAYOUT];

export function getLayoutById(id: string): LayoutConfig {
  return LAYOUTS.find((l) => l.id === id) ?? DEFAULT_LAYOUT;
}
