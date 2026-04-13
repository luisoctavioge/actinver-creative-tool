"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CreatorInput, PieceContent, CHAR_LIMITS, CREATOR_LIMITS, SOCIAL_CHANNELS, SocialChannel, Genero, EdadRango, TipoPieza, LogoAlign, LayoutId, ImageMode } from "@/lib/templates";
import { GenerationStatus } from "@/hooks/useCreativeState";
import { CommunicationType, ChannelKey, CHANNEL_OPTIONS, channelNeedsCaptions, channelNeedsEventFields } from "@/lib/types/channels";
import { Spinner, SparkleIcon, ImageIcon, VariantsIcon, RefreshIcon, ChannelIcon, MonitorIcon, MailIcon, ShareIcon, MessageIcon, CalendarIcon, BankIcon } from "@/components/Icons";
import { getCustomFichas } from "@/lib/references";
import CustomFichaModal from "@/components/Brief/CustomFichaModal";

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
  const [officialFichas, setOfficialFichas] = useState<ProductFicha[]>([]);
  const [customFichas, setCustomFichas] = useState<ProductFicha[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cargar fichas oficiales de la API
  useEffect(() => {
    fetch("/api/fichas")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOfficialFichas(data); })
      .catch(() => {});
  }, []);

  // Cargar fichas custom de localStorage
  useEffect(() => {
    setCustomFichas(getCustomFichas());
  }, []);

  // Click fuera cierra el dropdown
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const allFichas = [...officialFichas, ...customFichas];
  const isLoading = officialFichas.length === 0;

  const filtered = allFichas.filter((f) => {
    const q = query.toLowerCase();
    return f.nombre.toLowerCase().includes(q) || f.categoria.toLowerCase().includes(q);
  });

  const handleSelect = useCallback((ficha: ProductFicha) => {
    onSelect(ficha);
    setQuery("");
    setIsOpen(false);
  }, [onSelect]);

  const handleSaveCustomFicha = useCallback((ficha: ProductFicha) => {
    setCustomFichas(getCustomFichas());
    setShowCustomModal(false);
    onSelect(ficha);
    setIsOpen(false);
  }, [onSelect]);

  const selectedFicha = allFichas.find((f) => f.nombre === value);
  const isCustom = selectedFicha ? customFichas.some((f) => f.id === selectedFicha.id) : false;
  // "Sin resultados" y hay texto en query → ofrecemos crear ficha custom
  const canCreateCustom = isOpen && query.trim().length > 0 && filtered.length === 0;

  return (
    <>
    <div ref={wrapperRef} className="relative">
      <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium block mb-1.5">
        Producto
      </label>

      <div
        className={`flex items-center gap-2 w-full rounded-lg bg-azul-acompanamiento/60 border px-3 py-2.5 transition-colors ${isOpen ? "border-sunset/60" : "border-white/10"} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white/30">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={isOpen ? query : (selectedFicha?.nombre ?? value)}
          placeholder="Buscar producto o dejar vacío..."
          disabled={disabled}
          onFocus={() => { setIsOpen(true); setQuery(""); }}
          onChange={(e) => { setQuery(e.target.value); if (!isOpen) setIsOpen(true); }}
          className="flex-1 bg-transparent text-body text-white placeholder:text-white/25 font-open-sans focus:outline-none"
        />
        {selectedFicha && !isOpen && (
          <div className="flex items-center gap-1.5 shrink-0">
            {isCustom && (
              <span className="text-legal font-open-sans px-1.5 py-0.5 rounded-full bg-sunset/15 text-sunset/80 border border-sunset/20">
                Custom
              </span>
            )}
            <span className="text-legal font-open-sans text-sunset/60">{selectedFicha.categoria}</span>
          </div>
        )}
      </div>

      {selectedFicha && !isOpen && (
        <div className="mt-2 flex flex-col gap-3 px-1 py-2">
          <p className="text-legal font-open-sans text-white/40 leading-relaxed">
            {selectedFicha.descripcion}
          </p>
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
          {isCustom && (
            <button
              onClick={() => setShowCustomModal(true)}
              className="text-left text-legal font-open-sans text-sunset/50 hover:text-sunset/80 transition-colors mt-1"
            >
              ✎ Editar ficha personalizada
            </button>
          )}
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto custom-scrollbar rounded-lg border border-white/10 bg-azul-grandeza/95 backdrop-blur-md shadow-lg">
          {canCreateCustom ? (
            <div className="px-3 py-3">
              <p className="text-legal text-white/30 font-open-sans mb-2 text-center">
                &ldquo;{query}&rdquo; no está en el catálogo
              </p>
              <button
                onClick={() => { setIsOpen(false); setShowCustomModal(true); }}
                className="w-full rounded-lg py-2 text-sm font-semibold text-azul-grandeza bg-sunset hover:brightness-110 transition-all"
              >
                + Crear ficha para &ldquo;{query}&rdquo;
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-4 text-legal text-white/30 font-open-sans text-center">
              {isLoading ? "Cargando productos..." : "Sin resultados"}
            </p>
          ) : (
            <>
              {/* Fichas oficiales */}
              {filtered.filter((f) => !customFichas.some((c) => c.id === f.id)).map((ficha) => (
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
              ))}
              {/* Fichas custom */}
              {filtered.filter((f) => customFichas.some((c) => c.id === f.id)).map((ficha) => (
                <button
                  key={ficha.id}
                  onClick={() => handleSelect(ficha)}
                  className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 group"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-body font-open-sans text-white group-hover:text-sunset transition-colors line-clamp-1">
                      {ficha.nombre}
                    </span>
                    <span className="text-legal font-open-sans px-1.5 py-0.5 rounded-full bg-sunset/15 text-sunset/70 border border-sunset/20 shrink-0">
                      Custom
                    </span>
                  </div>
                  <p className="text-legal font-open-sans text-white/35 mt-0.5 line-clamp-1">
                    {ficha.descripcion}
                  </p>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>

    {/* Modal para crear/editar ficha custom */}
    {showCustomModal && (
      <CustomFichaModal
        initialName={query || (isCustom && selectedFicha ? selectedFicha.nombre : "")}
        onSave={handleSaveCustomFicha}
        onCancel={() => setShowCustomModal(false)}
      />
    )}
    </>
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

// ── Selector de canales sociales (chips multi-select) ───────────────────────

function SocialChannelSelector({
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
        Redes sociales
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
          Selecciona redes para generar captions
        </p>
      )}
    </div>
  );
}

// ── Selector de alineación del logo ──────────────────────────────────────────

function LogoAlignSelector({
  value,
  disabled,
  onChange,
}: {
  value: LogoAlign;
  disabled: boolean;
  onChange: (v: LogoAlign) => void;
}) {
  const options: { key: LogoAlign; label: string; icon: React.ReactNode }[] = [
    {
      key: "left",
      label: "Izquierda",
      icon: (
        <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
          <rect x="2" y="5" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <rect x="16" y="5" width="10" height="6" rx="3" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 1.5" />
        </svg>
      ),
    },
    {
      key: "right",
      label: "Derecha",
      icon: (
        <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
          <rect x="2" y="5" width="10" height="6" rx="3" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 1.5" />
          <rect x="16" y="5" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-1.5">
      {options.map(({ key, label, icon }) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => { if (!disabled) onChange(key); }}
            disabled={disabled}
            title={label}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-legal font-open-sans border transition-all duration-150
              ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-[0.96]"}
              ${isActive
                ? "bg-sunset/15 border-sunset/50 text-sunset"
                : "bg-transparent border-white/10 text-white/35 hover:border-white/20 hover:text-white/50"
              }
            `}
          >
            {icon}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Selector de Layout (Glass Card vs Editorial) ─────────────────────────────

function LayoutSelector({
  value,
  disabled,
  onChange,
}: {
  value: LayoutId;
  disabled: boolean;
  onChange: (v: LayoutId) => void;
}) {
  const options: { key: LayoutId; label: string; desc: string }[] = [
    { key: "fundador-classic", label: "Glass Card", desc: "Card semitransparente con badge" },
    { key: "editorial", label: "Editorial", desc: "Imagen arriba, texto limpio" },
  ];

  return (
    <div className="flex gap-1.5">
      {options.map(({ key, label, desc }) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => { if (!disabled) onChange(key); }}
            disabled={disabled}
            title={desc}
            className={`
              flex-1 flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-lg text-legal font-open-sans border transition-all duration-150
              ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-[0.96]"}
              ${isActive
                ? "bg-sunset/15 border-sunset/50 text-sunset"
                : "bg-transparent border-white/10 text-white/35 hover:border-white/20 hover:text-white/50"
              }
            `}
          >
            {/* Miniatura del layout */}
            {key === "fundador-classic" ? (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                <rect x="4" y="4" width="24" height="24" rx="1" fill="currentColor" opacity="0.08" />
                <rect x="6" y="18" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <rect x="6" y="6" width="8" height="3" rx="1" fill="currentColor" opacity="0.3" />
                <rect x="18" y="6" width="8" height="3" rx="1.5" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" opacity="0.3" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                <rect x="4" y="4" width="24" height="13" rx="1" fill="currentColor" opacity="0.15" />
                <rect x="6" y="19" width="14" height="2.5" rx="0.5" fill="currentColor" opacity="0.5" />
                <rect x="6" y="23" width="20" height="1.5" rx="0.5" fill="currentColor" opacity="0.15" />
                <rect x="6" y="25.5" width="18" height="1.5" rx="0.5" fill="currentColor" opacity="0.15" />
              </svg>
            )}
            <span style={{ fontSize: 10 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Selector de modo de imagen AI ────────────────────────────────────────────

function ImageModeSelector({
  value,
  disabled,
  onChange,
}: {
  value: ImageMode;
  disabled: boolean;
  onChange: (v: ImageMode) => void;
}) {
  const options: { key: ImageMode; label: string; desc: string }[] = [
    { key: "auto", label: "Auto", desc: "La IA elige según contexto" },
    { key: "product-hero", label: "Producto", desc: "El producto/tema como protagonista" },
    { key: "lifestyle", label: "Lifestyle", desc: "Personas en situación real" },
    { key: "abstract", label: "Abstracto", desc: "Formas geométricas y texturas" },
  ];

  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(({ key, label, desc }) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => { if (!disabled) onChange(key); }}
            disabled={disabled}
            title={desc}
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

// ── Icono por canal de comunicación ──────────────────────────────────────────

function ChannelOptionIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "monitor":  return <MonitorIcon size={14} />;
    case "mail":     return <MailIcon size={14} />;
    case "share":    return <ShareIcon size={14} />;
    case "message":  return <MessageIcon size={14} />;
    case "calendar": return <CalendarIcon size={14} />;
    default:         return null;
  }
}

// ── Selector de tipo de comunicación + canales (multi-select) ───────────────

function CommunicationSelector({
  communicationTypes,
  selectedChannels,
  disabled,
  onChange,
}: {
  communicationTypes: CommunicationType[];
  selectedChannels: ChannelKey[];
  disabled: boolean;
  onChange: (types: CommunicationType[], channels: ChannelKey[]) => void;
}) {
  const toggleType = (type: CommunicationType) => {
    if (disabled) return;
    let newTypes: CommunicationType[];
    if (communicationTypes.includes(type)) {
      // Deselect: remove type but keep at least one
      newTypes = communicationTypes.filter((t) => t !== type);
      if (newTypes.length === 0) newTypes = [type]; // can't deselect last
    } else {
      newTypes = [...communicationTypes, type];
    }
    // Filter selectedChannels to only those belonging to the remaining types
    const allowed = CHANNEL_OPTIONS.filter((o) => newTypes.includes(o.type)).map((o) => o.key);
    const newChannels = selectedChannels.filter((ch) => allowed.includes(ch));
    onChange(newTypes, newChannels.length > 0 ? newChannels : allowed.slice(0, 1));
  };

  const toggleChannel = (channelKey: ChannelKey) => {
    if (disabled) return;
    let newChannels: ChannelKey[];
    if (selectedChannels.includes(channelKey)) {
      newChannels = selectedChannels.filter((c) => c !== channelKey);
      if (newChannels.length === 0) newChannels = [channelKey]; // can't deselect last
    } else {
      newChannels = [...selectedChannels, channelKey];
    }
    onChange(communicationTypes, newChannels);
  };

  // Show channels belonging to any selected type
  const visibleChannels = CHANNEL_OPTIONS.filter((o) => communicationTypes.includes(o.type));

  return (
    <div className="flex flex-col gap-3">
      {/* Tipo: Interna / Externa (multi-select) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
          Tipo de comunicación
        </label>
        <div className="flex gap-1.5">
          {([
            { key: "internal" as const, label: "Interna", desc: "Empleados" },
            { key: "external" as const, label: "Externa", desc: "Clientes" },
          ]).map(({ key, label, desc }) => {
            const isActive = communicationTypes.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleType(key)}
                disabled={disabled}
                className={`
                  flex-1 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-lg text-legal font-open-sans
                  border transition-all duration-150
                  ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-[0.97]"}
                  ${isActive
                    ? "bg-sunset/15 border-sunset/50 text-sunset"
                    : "bg-transparent border-white/10 text-white/35 hover:border-white/20 hover:text-white/50"
                  }
                `}
              >
                <span className="font-semibold">{label}</span>
                <span className={`${isActive ? "text-sunset/60" : "text-white/20"}`} style={{ fontSize: 10 }}>{desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Canales (multi-select, solo del tipo seleccionado) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
          Canales
        </label>
        <div className="flex flex-wrap gap-1.5">
          {visibleChannels.map((opt) => {
            const isActive = selectedChannels.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => toggleChannel(opt.key)}
                disabled={disabled}
                title={opt.description}
                className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-legal font-open-sans
                  border transition-all duration-150
                  ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-[0.96]"}
                  ${isActive
                    ? "bg-sunset/15 border-sunset/50 text-sunset"
                    : "bg-transparent border-white/10 text-white/35 hover:border-white/20 hover:text-white/50"
                  }
                `}
              >
                <ChannelOptionIcon icon={opt.icon} />
                {opt.label}
              </button>
            );
          })}
        </div>
        {selectedChannels.length > 0 && (
          <p className="text-legal text-white/20 font-open-sans mt-0.5">
            {selectedChannels.length === 1
              ? CHANNEL_OPTIONS.find((o) => o.key === selectedChannels[0])?.description ?? ""
              : `${selectedChannels.length} canales seleccionados`}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Sección de Brief ───────────────────────────────────────────────────────────

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
  const canGenerate = (creatorInput.product.trim().length > 0 || creatorInput.message.trim().length > 0) && !isLoading;

  const showCaptions = channelNeedsCaptions(creatorInput.selectedChannels);
  const showEventFields = channelNeedsEventFields(creatorInput.selectedChannels);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {/* 1. Producto */}
        <ProductSearch
          value={creatorInput.product}
          disabled={isLoading}
          onSelect={(ficha) => onChange({ ...creatorInput, product: ficha.nombre, message: "" })}
        />

        {/* 2. Mensaje */}
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

        {/* 3. Tipo de comunicación + Canales */}
        <CommunicationSelector
          communicationTypes={creatorInput.communicationTypes}
          selectedChannels={creatorInput.selectedChannels}
          disabled={isLoading}
          onChange={(types, channels) => onChange({ ...creatorInput, communicationTypes: types, selectedChannels: channels })}
        />

        {/* Redes sociales (solo si canal = social-media) */}
        {showCaptions && (
          <SocialChannelSelector
            selected={creatorInput.channels}
            disabled={isLoading}
            onChange={(channels) => onChange({ ...creatorInput, channels })}
          />
        )}

        {/* Campos de evento (solo si canal = event-invitation) */}
        {showEventFields && (
          <div className="flex flex-col gap-2">
            <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
              Datos del evento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={creatorInput.eventDate ?? ""}
                disabled={isLoading}
                onChange={(e) => onChange({ ...creatorInput, eventDate: e.target.value })}
                className="rounded-lg bg-azul-acompanamiento/60 border border-white/10 px-3 py-2 text-legal text-white font-open-sans focus:outline-none focus:border-sunset/60 transition-colors"
              />
              <input
                type="text"
                value={creatorInput.eventTime ?? ""}
                placeholder="19:00 hrs"
                disabled={isLoading}
                onChange={(e) => onChange({ ...creatorInput, eventTime: e.target.value })}
                className="rounded-lg bg-azul-acompanamiento/60 border border-white/10 px-3 py-2 text-legal text-white placeholder:text-white/25 font-open-sans focus:outline-none focus:border-sunset/60 transition-colors"
              />
            </div>
            <input
              type="text"
              value={creatorInput.eventLocation ?? ""}
              placeholder="Lugar del evento"
              disabled={isLoading}
              onChange={(e) => onChange({ ...creatorInput, eventLocation: e.target.value })}
              className="w-full rounded-lg bg-azul-acompanamiento/60 border border-white/10 px-3 py-2.5 text-body text-white placeholder:text-white/25 font-open-sans focus:outline-none focus:border-sunset/60 transition-colors"
            />
          </div>
        )}

        {/* Audiencia */}
        <div className="flex flex-col gap-2 pt-1">
          <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
            Audiencia
          </label>
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

        {/* Pieza */}
        <div className="flex flex-col gap-2">
          <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
            Pieza
          </label>
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

          <div className="flex flex-col gap-1.5">
            <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
              Logo
            </label>
            <LogoAlignSelector
              value={creatorInput.logoAlign}
              disabled={isLoading}
              onChange={(v) => onChange({ ...creatorInput, logoAlign: v })}
            />
          </div>
        </div>
      </div>

      {/* ── Layout + Imagen ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
        {/* Selector de Layout */}
        <div className="flex flex-col gap-1.5">
          <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
            Layout
          </label>
          <LayoutSelector
            value={creatorInput.layoutId}
            disabled={isLoading}
            onChange={(v) => onChange({ ...creatorInput, layoutId: v })}
          />
        </div>

        {/* Campo de categoría — solo visible en layout Editorial */}
        {creatorInput.layoutId === "editorial" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
              Categoría <span className="normal-case tracking-normal text-white/25">(etiqueta gold)</span>
            </label>
            <input
              type="text"
              value={creatorInput.categoryLabel}
              placeholder="Ej: Favoritas Globales, Smart Picks..."
              disabled={isLoading}
              onChange={(e) => onChange({ ...creatorInput, categoryLabel: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-legal text-white/80 font-open-sans placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-sunset/40 transition-all"
            />
          </div>
        )}

        {/* Selector de modo de imagen */}
        <div className="flex flex-col gap-1.5">
          <label className="text-legal uppercase tracking-widest text-white/50 font-open-sans font-medium">
            Estilo de imagen
          </label>
          <ImageModeSelector
            value={creatorInput.imageMode}
            disabled={isLoading}
            onChange={(v) => onChange({ ...creatorInput, imageMode: v })}
          />
        </div>
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
        {status === "idle" && !creatorInput.product.trim() && !creatorInput.message.trim() && (
          <p className="text-legal text-white/25 text-center font-open-sans">
            Describe el producto o escribe un mensaje para activar la IA
          </p>
        )}
      </div>

      {/* 3 variantes de copy */}
      {(isVariantsLoading || variants.length > 0) && (
        <>
          <div className="border-t border-white/10" />
          <div className="flex flex-col gap-2">
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

export function PieceSection({
  content,
  onChange,
  onGenerateImage,
  onRegenerateField,
  regeneratingField,
  imageStatus,
  imageError,
  contentReady,
  onSaveReference,
}: {
  content: PieceContent;
  onChange: (content: PieceContent) => void;
  onGenerateImage: (provider: "pexels" | "ai") => void;
  onRegenerateField: (field: keyof PieceContent) => void;
  regeneratingField: keyof PieceContent | null;
  imageStatus: GenerationStatus;
  imageError: string | null;
  contentReady: boolean;
  onSaveReference?: () => void;
}) {
  const isLoading = imageStatus === "loading";
  const canGenerate = content.title.trim().length > 0 && !isLoading;
  const [referenceSaved, setReferenceSaved] = useState(false);

  const handleSaveRef = useCallback(() => {
    if (!onSaveReference) return;
    onSaveReference();
    setReferenceSaved(true);
    setTimeout(() => setReferenceSaved(false), 3000);
  }, [onSaveReference]);

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

      {/* Campos del copy con botón ↺ */}
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

        {/* Banco de imágenes Actinver (placeholder) */}
        <button
          disabled
          title="Próximamente"
          className="w-full py-2 rounded-lg font-poppins font-bold text-legal flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 border-dashed text-white/25 cursor-not-allowed"
        >
          <BankIcon size={14} />
          Banco Actinver
          <span className="text-white/15 font-open-sans font-normal ml-1" style={{ fontSize: 9 }}>próximamente</span>
        </button>

        {imageStatus === "error" && imageError && (
          <p className="text-legal text-red-400 font-open-sans leading-snug bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {imageError}
          </p>
        )}
        {imageStatus === "success" && (
          <p className="text-legal text-green-400/60 text-center font-open-sans">Fondo generado — aplica a todos los formatos</p>
        )}
        {imageStatus === "idle" && !content.title.trim() && (
          <p className="text-legal text-white/25 text-center font-open-sans">Primero genera el contenido con tu brief</p>
        )}
      </div>

      {/* Guardar como referencia */}
      {contentReady && onSaveReference && (
        <div className="border-t border-white/10 pt-3">
          <button
            onClick={handleSaveRef}
            disabled={referenceSaved}
            className={`w-full py-2 rounded-lg text-legal font-open-sans font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 border ${
              referenceSaved
                ? "bg-green-400/10 border-green-400/30 text-green-400/80 cursor-default"
                : "bg-white/5 border-white/10 text-white/40 hover:border-sunset/30 hover:text-sunset/70 hover:bg-sunset/5 cursor-pointer"
            }`}
          >
            {referenceSaved ? "✓ Guardado como referencia" : "★ Usar como referencia"}
          </button>
          {referenceSaved && (
            <p className="text-legal text-white/30 text-center font-open-sans mt-1">
              La próxima pieza similar usará este copy como guía
            </p>
          )}
        </div>
      )}
    </div>
  );
}
