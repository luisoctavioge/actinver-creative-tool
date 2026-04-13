"use client";

import { useEffect, useRef } from "react";
import type { CreatorInput } from "@/lib/templates";

interface BriefConfirmProps {
  creatorInput: CreatorInput;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Deriva un resumen del tema a partir del mensaje + producto del usuario. */
function resolveTopic(input: CreatorInput): string {
  const msg = (input.message ?? "").trim();
  const prod = (input.product ?? "").trim();

  if (msg) {
    // Tomar las primeras 10 palabras del mensaje como resumen
    const words = msg.split(/\s+/).slice(0, 10);
    return words.join(" ") + (msg.split(/\s+/).length > 10 ? "…" : "");
  }
  return prod || "—";
}

function resolveAudience(input: CreatorInput): string {
  const generoMap: Record<string, string> = {
    hombre: "Hombres",
    mujer: "Mujeres",
    ambos: "Hombres y mujeres",
  };
  const genero = generoMap[input.genero ?? "ambos"] ?? "Hombres y mujeres";
  const edad = input.edadRango ?? "36-50";
  return `${genero}, ${edad} años`;
}

function resolveTone(input: CreatorInput): string {
  const toneMap: Record<string, string> = {
    educativa: "Educativo / informativo",
    promo: "Promocional / persuasivo",
    institucional: "Institucional / corporativo",
  };
  return toneMap[input.tipoPieza ?? "educativa"] ?? "Educativo / informativo";
}

function resolveChannels(input: CreatorInput): string {
  const labelMap: Record<string, string> = {
    "social-media":       "Social Media",
    "whatsapp":           "WhatsApp",
    "email-client":       "Email clientes",
    "email-internal":     "Email interno",
    "screens-internal":   "Pantallas internas",
    "event-invitation":   "Invitaciones evento",
  };
  return (input.selectedChannels ?? [])
    .map((ch) => labelMap[ch] ?? ch)
    .join(", ") || "—";
}

export default function BriefConfirm({ creatorInput, onConfirm, onCancel }: BriefConfirmProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Foco automático en "Generar" al abrir
  useEffect(() => {
    confirmBtnRef.current?.focus();
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  const topic    = resolveTopic(creatorInput);
  const audience = resolveAudience(creatorInput);
  const tone     = resolveTone(creatorInput);
  const channels = resolveChannels(creatorInput);

  return (
    /* Overlay semitransparente */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(10, 14, 18, 0.82)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      {/* Card */}
      <div
        className="relative w-[420px] max-w-[calc(100vw-32px)] rounded-2xl border border-white/10 shadow-2xl"
        style={{ backgroundColor: "#1A2433", padding: "28px 28px 24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-sunset mb-1">
            Antes de generar
          </p>
          <h2 className="text-white font-bold text-lg leading-snug">
            ¿Todo listo para crear la pieza?
          </h2>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-5" />

        {/* Brief summary */}
        <div className="space-y-3 mb-6">
          <Row icon="📌" label="Tema" value={topic} />
          <Row icon="👤" label="Audiencia" value={audience} />
          <Row icon="🎯" label="Tono" value={tone} />
          <Row icon="📢" label="Canal" value={channels} />
        </div>

        {/* Footer note */}
        <p className="text-white/40 text-xs mb-5 leading-relaxed">
          Si algo no coincide, cierra y ajusta el brief antes de continuar.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-colors"
          >
            Corregir brief
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold bg-sunset text-azul-grandeza hover:brightness-110 transition-all"
          >
            Generar pieza →
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base mt-0.5 flex-shrink-0" aria-hidden>{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-white/40 text-xs">{label}: </span>
        <span className="text-white/90 text-sm leading-snug">{value}</span>
      </div>
    </div>
  );
}
