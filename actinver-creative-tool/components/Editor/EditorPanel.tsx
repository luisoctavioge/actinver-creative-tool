"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CreatorInput, PieceContent, CHAR_LIMITS, CREATOR_LIMITS, SOCIAL_CHANNELS, SocialChannel, Genero, EdadRango, TipoPieza } from "@/lib/templates";
import { GenerationStatus } from "@/app/page";

// ── Tipo de ficha de producto (mirror de lib/fichas/index.ts) ─────────────────
interface ProductFicha {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  beneficios: string[];
  publicoObjetivo: string;
  tono: string;
}

// ── Dropdown buscable de productos ────────────────────────────────────────────
function ProductSearch({
  value,
  disabled,
  onSelect,
}: {
  value: string;
  disabled: boolean;
  onSelect: (ficha: ProductFicha) => void;
}) {
  const [fichas, setFichas] = useState<ProductFicha[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cargar fichas una sola vez
  useEffect(() => {
    fetch("/api/fichas")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setFichas(data); })
      .catch(() => {});
  }, []);

  // Cerrar al clickear fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = fichas.filter((f) => {
    const q = query.toLowerCase();
    return f.nombre.toLowerCase().includes(q) || f.categoria.toLowerCase().includes(q);
  });

  const handleSelect = useCallback((ficha: ProductFicha) => {
    onSelect(ficha);
    setQuery("");
    setIsOpen(false);
  }, [onSelect]);

  // Marcar como seleccionado si el value coincide con alguna ficha
  const selectedFicha = fichas.find((f) => f.nombre === value);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium block mb-1.5">
        Producto
      </label>

      {/* Input de búsqueda */}
      <div
        className={`flex items-center gap-2 w-full rounded-lg bg-azul-acompanamiento/60 border px-3 py-2.5 transition-colors ${isOpen ? "border-sunset/60" : "border-white/10"} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        {/* Search icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white/30">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={isOpen ? query : (selectedFicha?.nombre ?? value)}
          placeholder="Buscar producto..."
          disabled={disabled}
          onFocus={() => { setIsOpen(true); setQuery(""); }}
          onChange={(e) => { setQuery(e.target.value); if (!isOpen) setIsOpen(true); }}
          className="flex-1 bg-transparent text-body text-white placeholder:text-white/25 font-open-sans focus:outline-none"
        />
        {selectedFicha && !isOpen && (
          <span className="text-legal font-open-sans text-sunset/60 shrink-0">{selectedFicha.categoria}</span>
        )}
      </div>

      {/* Info card del producto seleccionado */}
      {selectedFicha && !isOpen && (
        <div className="mt-2 flex flex-col gap-3 px-1 py-2">
          {/* Descripción */}
          <p className="text-legal font-open-sans text-white/40 leading-relaxed">
            {selectedFicha.descripcion}
          </p>

          {/* Público */}
          {selectedFicha.publicoObjetivo && (
            <div className="flex flex-col gap-0.5">
              <span className="font-open-sans text-white/20 uppercase tracking-widest" style={{ fontSize: 9 }}>
                Público objetivo
              </span>
              <span className="text-legal font-open-sans text-white/35 leading-snug">
                {selectedFicha.publicoObjetivo}
              </span>
            </div>
          )}

          {/* Beneficios */}
          {selectedFicha.beneficios.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="font-open-sans text-white/20 uppercase tracking-widest" style={{ fontSize: 9 }}>
                Beneficios clave
              </span>
              <div className="flex flex-col gap-1 mt-0.5">
                {selectedFicha.beneficios.slice(0, 3).map((b: string, i: number) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="mt-[4px] shrink-0 w-1 h-1 rounded-full bg-sunset/40" />
                    <span className="text-legal font-open-sans text-white/35 leading-snug">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto custom-scrollbar rounded-lg border border-white/10 bg-azul-grandeza/95 backdrop-blur-md shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-legal text-white/30 font-open-sans text-center">
              {fichas.length === 0 ? "Cargando productos..." : "Sin resultados"}
            </p>
          ) : (
            filtered.map((ficha) => (
              <button
                key={ficha.id}
                onClick={() => handleSelect(ficha)}
                className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 group"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-body font-open-sans text-white group-hover:text-sunset transition-colors line-clamp-1">
                    {ficha.nombre}
                  </span>
                  <span className="text-legal font-open-sans text-white/25 shrink-0">
                    {ficha.categoria}
                  </span>
                </div>
                <p className="text-legal font-open-sans text-white/35 mt-0.5 line-clamp-1">
                  {ficha.descripcion}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Field genérico ─────────────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function Field({ id, label, value, maxLength, placeholder, rows = 3, disabled, onChange }: FieldProps) {
  const count = value.length;
  const isNearLimit = count >= maxLength * 0.85;
  const isAtLimit = count >= maxLength;
  const multiline = rows > 1;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
          {label}
        </label>
        <span className={`text-legal font-open-sans tabular-nums transition-colors ${isAtLimit ? "text-red-400" : isNearLimit ? "text-sunset" : "text-white/30"}`}>
          {count}/{maxLength}
        </span>
      </div>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          maxLength={maxLength}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight: `${rows * 1.5 + 1.25}rem`, resize: "vertical" }}
          className={`w-full rounded-lg bg-azul-acompanamiento/60 border border-white/10 px-3 py-2.5 text-body text-white placeholder:text-white/25 font-open-sans focus:outline-none focus:border-sunset/60 transition-colors ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg bg-azul-acompanamiento/60 border border-white/10 px-3 py-2.5 text-body text-white placeholder:text-white/25 font-open-sans focus:outline-none focus:border-sunset/60 transition-colors ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        />
      )}
    </div>
  );
}

// ── Chip de selección única genérico ─────────────────────────────────────────

function ChipGroup<T extends string>({
  options,
  value,
  disabled,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  disabled: boolean;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(({ key, label }) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => { if (!disabled) onChange(key); }}
            disabled={disabled}
            className={`
              px-2.5 py-1.5 rounded-lg text-legal font-open-sans border transition-all duration-150
              ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-[0.96]"}
              ${isActive
                ? "bg-sunset/15 border-sunset/50 text-sunset"
                : "bg-transparent border-white/10 text-white/35 hover:border-white/20 hover:text-white/50"
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Toggle booleano (chip on/off) ─────────────────────────────────────────────

function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => { if (!disabled) onChange(!checked); }}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-legal font-open-sans border transition-all duration-150
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-[0.96]"}
        ${checked
          ? "bg-sunset/15 border-sunset/50 text-sunset"
          : "bg-transparent border-white/10 text-white/35 hover:border-white/20 hover:text-white/50"
        }
      `}
    >
      {checked && (
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label}
    </button>
  );
}

// ── Iconos de canales sociales ────────────────────────────────────────────────

function ChannelIcon({ channel }: { channel: SocialChannel }) {
  switch (channel) {
    case "instagram":
      return (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="4" r="0.8" fill="currentColor" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 7v4M5 5v0.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 11V8.5a1.5 1.5 0 1 1 3 0V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "x":
      return (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l4.5 5L3 13M13 3l-4.5 5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "facebook":
      return (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M10 1.5V5H8.5A1 1 0 0 0 7.5 6v1.5H10L9.5 10H7.5v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

// ── Selector de canales (chips multi-select) ─────────────────────────────────

function ChannelSelector({
  selected,
  disabled,
  onChange,
}: {
  selected: SocialChannel[];
  disabled: boolean;
  onChange: (channels: SocialChannel[]) => void;
}) {
  const toggle = (ch: SocialChannel) => {
    if (disabled) return;
    onChange(
      selected.includes(ch)
        ? selected.filter((c) => c !== ch)
        : [...selected, ch]
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
        Canal
      </label>
      <div className="flex flex-wrap gap-1.5">
        {SOCIAL_CHANNELS.map(({ key, label }) => {
          const isSelected = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              disabled={disabled}
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-legal font-open-sans
                border transition-all duration-150
                ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-[0.96]"}
                ${isSelected
                  ? "bg-sunset/15 border-sunset/50 text-sunset"
                  : "bg-transparent border-white/10 text-white/35 hover:border-white/20 hover:text-white/50"
                }
              `}
            >
              <ChannelIcon channel={key} />
              {label}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-legal text-white/20 font-open-sans mt-0.5">
          Selecciona canales para generar captions
        </p>
      )}
    </div>
  );
}

// ── Sección de Brief ───────────────────────────────────────────────────────────
// Exportada para usarse directamente en el panel izquierdo de page.tsx

export function BriefSection({
  creatorInput,
  onChange,
  onCreateFull,
  status,
  error,
  variants,
  variantsStatus,
  onSelectVariant,
}: {
  creatorInput: CreatorInput;
  onChange: (input: CreatorInput) => void;
  onCreateFull: () => void;
  status: GenerationStatus;
  error: string | null;
  variants: PieceContent[];
  variantsStatus: GenerationStatus;
  onSelectVariant: (variant: PieceContent) => void;
}) {
  const isLoading = status === "loading";
  const isVariantsLoading = variantsStatus === "loading";
  const canGenerate = creatorInput.product.trim().length > 0 && !isLoading;

  return (
    <div className="flex flex-col gap-5">
      {/* Campos del brief — dropdown de producto + mensaje libre */}
      <div className="flex flex-col gap-3">
        <ProductSearch
          value={creatorInput.product}
          disabled={isLoading}
          onSelect={(ficha) => onChange({ ...creatorInput, product: ficha.nombre, message: "" })}
        />
        <Field
          id="message"
          label="¿Qué quieres comunicar?"
          value={creatorInput.message}
          maxLength={CREATOR_LIMITS.message}
          placeholder="Describe el objetivo, mensaje clave o ángulo que quieres para esta pieza"
          rows={3}
          disabled={isLoading}
          onChange={(v) => onChange({ ...creatorInput, message: v })}
        />

        {/* ── Audiencia ── */}
        <div className="flex flex-col gap-2 pt-1">
          <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
            Audiencia
          </label>
          {/* Género */}
          <ChipGroup<Genero>
            options={[
              { key: "hombre",  label: "Hombre" },
              { key: "mujer",   label: "Mujer" },
              { key: "ambos",   label: "Ambos" },
            ]}
            value={creatorInput.genero}
            disabled={isLoading}
            onChange={(v) => onChange({ ...creatorInput, genero: v })}
          />
          {/* Edad */}
          <ChipGroup<EdadRango>
            options={[
              { key: "25-35", label: "25–35" },
              { key: "36-50", label: "36–50" },
              { key: "51-65", label: "51–65" },
            ]}
            value={creatorInput.edadRango}
            disabled={isLoading}
            onChange={(v) => onChange({ ...creatorInput, edadRango: v })}
          />
        </div>

        {/* ── Pieza ── */}
        <div className="flex flex-col gap-2">
          <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
            Pieza
          </label>
          {/* Tipo */}
          <ChipGroup<TipoPieza>
            options={[
              { key: "educativa",     label: "Educativa" },
              { key: "promo",         label: "Promo" },
              { key: "institucional", label: "Institucional" },
            ]}
            value={creatorInput.tipoPieza}
            disabled={isLoading}
            onChange={(v) => onChange({ ...creatorInput, tipoPieza: v })}
          />
          {/* Toggles */}
          <div className="flex gap-1.5">
            <Toggle
              label="Con CTA"
              checked={creatorInput.conCTA}
              disabled={isLoading}
              onChange={(v) => onChange({ ...creatorInput, conCTA: v })}
            />
            <Toggle
              label="Badge Fundador"
              checked={creatorInput.conBadge}
              disabled={isLoading}
              onChange={(v) => onChange({ ...creatorInput, conBadge: v })}
            />
          </div>
        </div>

        {/* ── Canal ── */}
        <ChannelSelector
          selected={creatorInput.channels}
          disabled={isLoading}
          onChange={(channels) => onChange({ ...creatorInput, channels })}
        />
      </div>

      {/* Botón principal */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onCreateFull}
          disabled={!canGenerate}
          className={`w-full py-2.5 rounded-lg font-poppins font-bold text-body flex items-center justify-center gap-2 transition-all duration-200 ${canGenerate ? "bg-sunset text-azul-grandeza hover:brightness-110 active:scale-[0.98] cursor-pointer" : "bg-sunset/20 border border-sunset/30 text-sunset opacity-40 cursor-not-allowed"}`}
        >
          {isLoading ? <Spinner /> : <SparkleIcon />}
          {isLoading ? "Generando pieza..." : "Crear pieza"}
        </button>

        {status === "error" && error && (
          <p className="text-legal text-red-400 font-open-sans leading-snug bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {status === "idle" && !creatorInput.product.trim() && (
          <p className="text-legal text-white/25 text-center font-open-sans">
            Describe el producto para activar la IA
          </p>
        )}
      </div>

      {/* 3 variantes de copy — se muestran automáticamente al crear pieza */}
      {(isVariantsLoading || variants.length > 0) && (
        <>
          <div className="border-t border-white/10" />
          <div className="flex flex-col gap-2">
            {/* Encabezado de sección */}
            <div className="flex items-center gap-2">
              {isVariantsLoading ? <Spinner /> : <VariantsIcon />}
              <span className="text-legal font-poppins font-semibold text-white/50 uppercase tracking-widest">
                {isVariantsLoading ? "Generando variantes..." : "3 variantes de copy"}
              </span>
            </div>

            {variants.length > 0 && (
              <div className="flex flex-col gap-2">
                {variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectVariant(v)}
                    className="text-left p-3 rounded-lg border border-white/10 bg-azul-acompanamiento/40 hover:border-sunset/40 hover:bg-azul-acompanamiento/70 transition-all duration-150 group"
                  >
                    <p className="text-legal font-poppins font-bold text-white group-hover:text-sunset transition-colors line-clamp-1">{v.title}</p>
                    <p className="text-legal font-open-sans text-white/40 mt-0.5 line-clamp-2 leading-snug">{v.description}</p>
                    <p className="text-legal font-open-sans text-sunset/60 mt-1">{v.cta}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Sección de Pieza generada ──────────────────────────────────────────────────
// Exportada para usarse directamente en el panel derecho de page.tsx

export function PieceSection({
  content,
  onChange,
  onGenerateImage,
  onRegenerateField,
  regeneratingField,
  imageStatus,
  imageError,
  contentReady,
}: {
  content: PieceContent;
  onChange: (content: PieceContent) => void;
  onGenerateImage: (provider: "pexels" | "ai") => void;
  onRegenerateField: (field: keyof PieceContent) => void;
  regeneratingField: keyof PieceContent | null;
  imageStatus: GenerationStatus;
  imageError: string | null;
  contentReady: boolean;
}) {
  const isLoading = imageStatus === "loading";
  const canGenerate = content.title.trim().length > 0 && !isLoading;

  return (
    <div className="flex flex-col gap-4">
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${contentReady ? "bg-green-400" : "bg-white/20"}`} />
          <h3 className="font-poppins font-bold text-white text-body">Contenido de la pieza</h3>
        </div>
        <p className="text-legal text-white/40 font-open-sans mt-0.5 ml-3.5">
          {contentReady ? "Editable — regenera campo a campo con ↺" : "Genera el contenido desde el brief"}
        </p>
      </div>

      {/* Campos del copy con botón ↺ por campo */}
      <div className="flex flex-col gap-3">
        {(["title", "description", "cta"] as const).map((field) => {
          const cfg = {
            title:       { label: "Título",      maxLength: CHAR_LIMITS.title,       placeholder: "Aparecerá aquí tras generar el contenido...", rows: 1 },
            description: { label: "Descripción", maxLength: CHAR_LIMITS.description, placeholder: "Descripción breve de la pieza...",             rows: 4 },
            cta:         { label: "CTA",         maxLength: CHAR_LIMITS.cta,         placeholder: "Llamada a la acción...",                       rows: 1 },
          }[field];
          const spinning = regeneratingField === field;
          return (
            <div key={field} className="relative group">
              <Field
                id={field}
                label={cfg.label}
                value={content[field]}
                maxLength={cfg.maxLength}
                placeholder={cfg.placeholder}
                rows={cfg.rows}
                disabled={isLoading || spinning}
                onChange={(v) => onChange({ ...content, [field]: v })}
              />
              {contentReady && (
                <button
                  onClick={() => onRegenerateField(field)}
                  disabled={!!regeneratingField}
                  title={`Regenerar ${cfg.label}`}
                  className={`absolute right-2 top-7 p-1 rounded transition-all duration-150 ${spinning ? "opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"} ${regeneratingField ? "cursor-not-allowed" : "cursor-pointer hover:text-sunset"} text-white/40`}
                >
                  <RefreshIcon spinning={spinning} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Botones generar imagen */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => onGenerateImage("pexels")}
            disabled={!canGenerate}
            className={`flex-1 py-2.5 rounded-lg font-poppins font-bold text-legal flex items-center justify-center gap-1.5 transition-all duration-200 ${canGenerate ? "bg-azul-actinver text-white hover:bg-azul-actinver/80 active:scale-[0.98] cursor-pointer border border-white/10" : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"}`}
          >
            {isLoading ? <Spinner /> : <ImageIcon />}
            Pexels
          </button>
          <button
            onClick={() => onGenerateImage("ai")}
            disabled={!canGenerate}
            className={`flex-1 py-2.5 rounded-lg font-poppins font-bold text-legal flex items-center justify-center gap-1.5 transition-all duration-200 ${canGenerate ? "bg-sunset text-azul-grandeza hover:brightness-110 active:scale-[0.98] cursor-pointer" : "bg-sunset/20 border border-sunset/30 text-sunset/40 cursor-not-allowed"}`}
          >
            {isLoading ? <Spinner /> : <SparkleIcon />}
            Generar IA
          </button>
        </div>

        {imageStatus === "error" && imageError && (
          <p className="text-legal text-red-400 font-open-sans leading-snug bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {imageError}
          </p>
        )}
        {imageStatus === "success" && (
          <p className="text-legal text-green-400/60 text-center font-open-sans">Fondo generado — aplica a los 3 formatos</p>
        )}
        {imageStatus === "idle" && !content.title.trim() && (
          <p className="text-legal text-white/25 text-center font-open-sans">Primero genera el contenido con tu brief</p>
        )}
      </div>
    </div>
  );
}

// ── Iconos ─────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L9.5 6.5H15L10.5 9.5L12 15L8 12L4 15L5.5 9.5L1 6.5H6.5L8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="5.5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 11L5 7.5L7.5 10L10.5 7L14.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VariantsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="7" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="12" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className={spinning ? "animate-spin" : ""}>
      <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.5 1.5V5h-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
