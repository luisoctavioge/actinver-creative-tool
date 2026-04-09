"use client";

import { useState, useCallback } from "react";
import { ChannelCaption, SocialChannel, SOCIAL_CHANNELS, CAPTION_LIMITS } from "@/lib/templates";
import { GenerationStatus } from "@/app/page";

// ── Iconos de canal (duplicados ligeros de EditorPanel para independencia) ────

function ChannelTabIcon({ channel }: { channel: SocialChannel }) {
  switch (channel) {
    case "instagram":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="4" r="0.8" fill="currentColor" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 7v4M5 5v0.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 11V8.5a1.5 1.5 0 1 1 3 0V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "x":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l4.5 5L3 13M13 3l-4.5 5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "facebook":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M10 1.5V5H8.5A1 1 0 0 0 7.5 6v1.5H10L9.5 10H7.5v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Panel inferior de captions ────────────────────────────────────────────────

interface CaptionPanelProps {
  open: boolean;
  onToggle: () => void;
  captions: ChannelCaption[];
  captionsStatus: GenerationStatus;
  selectedChannels: SocialChannel[];
}

export default function CaptionPanel({
  open,
  onToggle,
  captions,
  captionsStatus,
  selectedChannels,
}: CaptionPanelProps) {
  const [activeTab, setActiveTab] = useState<SocialChannel | null>(null);
  const [copied, setCopied] = useState(false);

  // Garantizar que activeTab sea válido
  const channels = selectedChannels.length > 0 ? selectedChannels : [];
  const currentTab = activeTab && channels.includes(activeTab) ? activeTab : channels[0] ?? null;
  const currentCaption = captions.find((c) => c.channel === currentTab) ?? null;

  const hasContent = captions.length > 0;
  const isLoading = captionsStatus === "loading";

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  }, []);

  const getLabel = (ch: SocialChannel) =>
    SOCIAL_CHANNELS.find((s) => s.key === ch)?.label ?? ch;

  // No mostrar nada si no hay canales seleccionados ni captions
  if (channels.length === 0 && !hasContent && !isLoading) return null;

  return (
    <div className="shrink-0">
      {/* ── Strip horizontal (siempre visible) ─────────────────────── */}
      <button
        onClick={onToggle}
        className={`
          w-full h-8 flex items-center justify-center gap-2 border-t transition-colors duration-150 cursor-pointer select-none
          ${open ? "bg-white/5 border-white/10 text-sunset" : "border-white/5 text-white/25 hover:text-white/50 hover:bg-white/[0.03]"}
        `}
      >
        {/* Chevron */}
        <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
          {open
            ? <path d="M1 1L6 5.5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            : <path d="M1 5.5L6 1L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          }
        </svg>

        <span
          className="font-open-sans uppercase tracking-[0.18em] font-medium"
          style={{ fontSize: 9 }}
        >
          Captions
        </span>

        {/* Dot indicator */}
        {!open && hasContent && (
          <div className="w-1.5 h-1.5 rounded-full bg-sunset" />
        )}
        {!open && isLoading && (
          <div className="w-1.5 h-1.5 rounded-full bg-sunset animate-pulse" />
        )}
      </button>

      {/* ── Panel expandible ───────────────────────────────────────── */}
      <div
        style={{
          height: open ? 280 : 0,
          transition: "height 260ms ease-in-out",
          overflow: "hidden",
        }}
      >
        <div style={{ height: 280 }} className="flex border-t border-white/10 bg-azul-grandeza">

          {/* Tabs de canales (izquierda) */}
          <div className="w-28 shrink-0 border-r border-white/10 flex flex-col overflow-y-auto custom-scrollbar">
            {channels.map((ch) => {
              const isActive = ch === currentTab;
              const hasCaption = captions.some((c) => c.channel === ch);
              return (
                <button
                  key={ch}
                  onClick={() => setActiveTab(ch)}
                  className={`
                    flex items-center gap-2 px-3 py-2.5 text-left text-legal font-open-sans
                    border-b border-white/5 transition-colors duration-150
                    ${isActive
                      ? "bg-white/5 text-sunset border-l-2 border-l-sunset"
                      : "text-white/35 hover:text-white/55 hover:bg-white/[0.03] border-l-2 border-l-transparent"
                    }
                  `}
                >
                  <ChannelTabIcon channel={ch} />
                  <span className="truncate">{getLabel(ch)}</span>
                  {hasCaption && !isActive && (
                    <div className="ml-auto w-1 h-1 rounded-full bg-green-400/60 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Contenido del caption (derecha) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 min-w-0">
            {isLoading && (
              <div className="flex items-center gap-2 text-white/30 py-8 justify-center">
                <Spinner />
                <span className="text-legal font-open-sans">Generando captions...</span>
              </div>
            )}

            {!isLoading && !currentCaption && currentTab && (
              <div className="flex items-center justify-center py-8">
                <span className="text-legal text-white/20 font-open-sans">
                  Sin caption para {getLabel(currentTab)}
                </span>
              </div>
            )}

            {!isLoading && !currentTab && (
              <div className="flex items-center justify-center py-8">
                <span className="text-legal text-white/20 font-open-sans">
                  Selecciona canales en el Brief para generar captions
                </span>
              </div>
            )}

            {currentCaption && !isLoading && (
              <div className="flex flex-col gap-3">
                {/* Header con label + char count */}
                <div className="flex items-center justify-between">
                  <span className="text-legal uppercase tracking-widest text-white/40 font-open-sans font-medium">
                    Caption para {getLabel(currentCaption.channel)}
                  </span>
                  <span className="text-legal text-white/25 font-open-sans tabular-nums">
                    {currentCaption.caption.length}/{CAPTION_LIMITS[currentCaption.channel]}
                  </span>
                </div>

                {/* Caption text */}
                <p className="text-body font-open-sans text-white/80 whitespace-pre-wrap leading-relaxed">
                  {currentCaption.caption}
                </p>

                {/* Hashtags */}
                {currentCaption.hashtags && (
                  <p className="text-legal font-open-sans text-sunset/50 leading-relaxed">
                    {currentCaption.hashtags}
                  </p>
                )}

                {/* Botón copiar */}
                <button
                  onClick={() => handleCopy(
                    currentCaption.hashtags
                      ? `${currentCaption.caption}\n\n${currentCaption.hashtags}`
                      : currentCaption.caption
                  )}
                  className="self-start px-3 py-1.5 rounded-lg border border-white/10 text-legal font-open-sans text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Copiado
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                      Copiar caption
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
