"use client";

import { useState, useEffect, useCallback } from "react";
import { saveCustomFicha, fichaIdFromName } from "@/lib/references";
import type { ProductFicha } from "@/lib/fichas";

interface CustomFichaModalProps {
  initialName?: string;
  onSave: (ficha: ProductFicha) => void;
  onCancel: () => void;
}

export default function CustomFichaModal({ initialName = "", onSave, onCancel }: CustomFichaModalProps) {
  const [nombre, setNombre] = useState(initialName);
  const [descripcion, setDescripcion] = useState("");
  const [beneficiosText, setBeneficiosText] = useState("");
  const [tono, setTono] = useState("aspiracional, claro y directo");
  const [error, setError] = useState("");

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  const handleSave = useCallback(() => {
    const trimNombre = nombre.trim();
    if (!trimNombre) { setError("El nombre es obligatorio."); return; }
    if (!descripcion.trim()) { setError("La descripción es obligatoria."); return; }

    const beneficios = beneficiosText
      .split(/\n|,/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const ficha: ProductFicha = {
      id: fichaIdFromName(trimNombre),
      nombre: trimNombre,
      categoria: "Personalizado",
      descripcion: descripcion.trim(),
      beneficios,
      publicoObjetivo: "",
      tono: tono.trim() || "aspiracional, claro y directo",
    };

    saveCustomFicha(ficha);
    onSave(ficha);
  }, [nombre, descripcion, beneficiosText, tono, onSave]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(10, 14, 18, 0.85)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="w-[440px] max-w-[calc(100vw-32px)] rounded-2xl border border-white/10 shadow-2xl"
        style={{ backgroundColor: "#1A2433", padding: "28px 28px 24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <p className="text-xs font-semibold tracking-widest uppercase text-sunset mb-1">
          Nuevo producto personalizado
        </p>
        <h2 className="text-white font-bold text-lg mb-5 leading-snug">
          Crear ficha de producto
        </h2>

        <div className="h-px bg-white/10 mb-5" />

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Nombre */}
          <div>
            <label className="text-legal uppercase tracking-widest text-white/50 font-semibold block mb-1.5">
              Nombre del producto <span className="text-sunset">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setError(""); }}
              placeholder="ej. ActiAI, Fondo Tech, Cuenta Premier..."
              className="w-full rounded-lg bg-azul-acompanamiento/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-sunset/40 focus:outline-none transition-colors"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-legal uppercase tracking-widest text-white/50 font-semibold block mb-1.5">
              Descripción breve <span className="text-sunset">*</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => { setDescripcion(e.target.value); setError(""); }}
              placeholder="¿Qué es y para qué sirve este producto?"
              rows={3}
              className="w-full rounded-lg bg-azul-acompanamiento/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-sunset/40 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Beneficios */}
          <div>
            <label className="text-legal uppercase tracking-widest text-white/50 font-semibold block mb-1.5">
              Beneficios clave
              <span className="ml-1 normal-case text-white/30 lowercase">(uno por línea o separados por coma)</span>
            </label>
            <textarea
              value={beneficiosText}
              onChange={(e) => setBeneficiosText(e.target.value)}
              placeholder="Rendimientos competitivos&#10;Acceso desde la app&#10;Sin comisiones ocultas"
              rows={3}
              className="w-full rounded-lg bg-azul-acompanamiento/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-sunset/40 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Tono */}
          <div>
            <label className="text-legal uppercase tracking-widest text-white/50 font-semibold block mb-1.5">
              Tono sugerido
            </label>
            <input
              type="text"
              value={tono}
              onChange={(e) => setTono(e.target.value)}
              placeholder="aspiracional, claro y directo"
              className="w-full rounded-lg bg-azul-acompanamiento/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-sunset/40 focus:outline-none transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
        </div>

        <div className="h-px bg-white/10 my-5" />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold bg-sunset text-azul-grandeza hover:brightness-110 transition-all"
          >
            Guardar ficha →
          </button>
        </div>
      </div>
    </div>
  );
}
