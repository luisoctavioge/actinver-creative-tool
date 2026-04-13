// Sistema de canales de comunicación v2
// Define la jerarquía: Tipo de comunicación → Canal → Formatos de salida

import { FormatKey } from "../templates";

// ── Tipos de comunicación ────────────────────────────────────────────────────
export type CommunicationType = "internal" | "external";

// ── Canales por tipo ─────────────────────────────────────────────────────────
export type InternalChannel = "screens" | "email-institutional";
export type ExternalChannel = "social-media" | "whatsapp" | "email-client" | "event-invitation";
export type ChannelKey = InternalChannel | ExternalChannel;

// ── Mapping: cada canal produce ciertos formatos de salida ───────────────────
export const CHANNEL_FORMATS: Record<ChannelKey, FormatKey[]> = {
  // Interna
  "screens":              ["fullhd-v", "fullhd-h"],
  "email-institutional":  ["email-internal"],
  // Externa
  "social-media":         ["story", "square", "horizontal"],
  "whatsapp":             ["poster"],
  "email-client":         ["email-client"],
  "event-invitation":     ["event-invitation"],
};

// ── Opciones para el selector de UI ──────────────────────────────────────────
export interface ChannelOption {
  key: ChannelKey;
  label: string;
  description: string;
  type: CommunicationType;
  icon: string; // emoji o identificador para el icono
}

export const CHANNEL_OPTIONS: ChannelOption[] = [
  // Interna
  {
    key: "screens",
    label: "Pantallas",
    description: "FullHD vertical y horizontal",
    type: "internal",
    icon: "monitor",
  },
  {
    key: "email-institutional",
    label: "Email institucional",
    description: "Comunicado interno por email",
    type: "internal",
    icon: "mail",
  },
  // Externa
  {
    key: "social-media",
    label: "Social Media",
    description: "Story, cuadrado y horizontal",
    type: "external",
    icon: "share",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    description: "Póster 3:4",
    type: "external",
    icon: "message",
  },
  {
    key: "email-client",
    label: "Email a clientes",
    description: "Plantilla HTML de email",
    type: "external",
    icon: "mail",
  },
  {
    key: "event-invitation",
    label: "Invitaciones a eventos",
    description: "Formato 4:5 con datos del evento",
    type: "external",
    icon: "calendar",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getChannelsByType(type: CommunicationType): ChannelOption[] {
  return CHANNEL_OPTIONS.filter((c) => c.type === type);
}

/** Formats for a single channel */
export function getFormatsForChannel(channel: ChannelKey): FormatKey[] {
  return CHANNEL_FORMATS[channel] ?? [];
}

/** Deduplicated union of formats across multiple selected channels */
export function getFormatsForChannels(channels: ChannelKey[]): FormatKey[] {
  const seen = new Set<FormatKey>();
  const result: FormatKey[] = [];
  for (const ch of channels) {
    for (const fmt of CHANNEL_FORMATS[ch] ?? []) {
      if (!seen.has(fmt)) {
        seen.add(fmt);
        result.push(fmt);
      }
    }
  }
  return result;
}

/** Canales que requieren generación de captions por red social */
export function channelNeedsCaptions(channels: ChannelKey[]): boolean {
  return channels.includes("social-media");
}

/** Canales que muestran campos de evento (fecha, lugar, hora) */
export function channelNeedsEventFields(channels: ChannelKey[]): boolean {
  return channels.includes("event-invitation");
}

/** Canales que generan plantilla HTML en lugar de imagen */
export function channelIsEmailTemplate(channel: ChannelKey): boolean {
  return channel === "email-institutional" || channel === "email-client";
}
