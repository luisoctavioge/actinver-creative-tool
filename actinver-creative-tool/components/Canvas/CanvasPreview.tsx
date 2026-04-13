"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { FormatKey, FORMATS, NATIVE, PieceContent, LogoAlign, LayoutId } from "@/lib/templates";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import LayoutRenderer from "./LayoutRenderer";
import EditorialRenderer from "./EditorialRenderer";

interface CanvasPreviewProps {
  format: FormatKey;
  content: PieceContent;
  imageUrl: string | null;
  isLoading: boolean;
  imageHistory?: string[];
  onSelectHistoryImage?: (url: string) => void;
  showBadge?: boolean;
  logoAlign?: LogoAlign;
  layoutId?: LayoutId;
  categoryLabel?: string;
  eventDate?: string;
  eventLocation?: string;
  eventTime?: string;
}

// ── Hook: calcula el scale para que el canvas nativo quepa en su contenedor ───
function useCanvasScale(nativeW: number, nativeH: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const update = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth: cw, clientHeight: ch } = containerRef.current;
    if (cw === 0 || ch === 0) return;
    setScale(Math.min(cw / nativeW, ch / nativeH));
  }, [nativeW, nativeH]);

  useEffect(() => {
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [update]);

  return { containerRef, scale };
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function CanvasPreview({ format, content, imageUrl, isLoading, imageHistory, onSelectHistoryImage, showBadge = true, logoAlign = "left", layoutId = "fundador-classic", categoryLabel, eventDate, eventLocation, eventTime }: CanvasPreviewProps) {
  const fmt = FORMATS[format];
  const { w: nativeW, h: nativeH } = NATIVE[format];
  const { containerRef, scale } = useCanvasScale(nativeW, nativeH);

  return (
    <div className="flex flex-col items-center w-full h-full gap-3 min-h-0">
        {/* Label */}
        <div className="flex items-center gap-2 text-legal text-white/40 font-open-sans uppercase tracking-widest shrink-0">
          <span>{fmt.label}</span>
          <span className="text-white/20">·</span>
          <span>{fmt.width}×{fmt.height}px</span>
          {imageUrl && <><span className="text-white/20">·</span><span className="text-green-400/60">Imagen lista</span></>}
        </div>

        {/* Contenedor de escala */}
        <div ref={containerRef} className="flex-1 w-full flex items-center justify-center min-h-0">
          <div style={{ width: nativeW * scale, height: nativeH * scale, flexShrink: 0 }}>
            <div
              style={{
                width: nativeW,
                height: nativeH,
                transformOrigin: "top left",
                transform: `scale(${scale})`,
              }}
            >
              <FormatCanvas format={format} content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} layoutId={layoutId} categoryLabel={categoryLabel} eventDate={eventDate} eventLocation={eventLocation} eventTime={eventTime} />
            </div>
          </div>
        </div>

        {/* Historial de imágenes */}
        {imageHistory && imageHistory.length > 0 && onSelectHistoryImage && (
          <div className="flex gap-2 shrink-0 items-center">
            <span className="text-legal font-open-sans text-white/25 uppercase tracking-widest" style={{ fontSize: 9 }}>
              Historial
            </span>
            {imageHistory.map((url, i) => (
              <button
                key={i}
                onClick={() => onSelectHistoryImage(url)}
                title="Usar esta imagen"
                className={`
                  w-9 h-9 rounded-md overflow-hidden ring-1 transition-all duration-150 shrink-0
                  ${url === imageUrl ? "ring-sunset" : "ring-white/10 hover:ring-white/30 opacity-60 hover:opacity-100"}
                `}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
    </div>
  );
}

// ── Props compartidas ──────────────────────────────────────────────────────────
export interface CanvasProps {
  content: PieceContent;
  imageUrl: string | null;
  isLoading: boolean;
  showBadge?: boolean;
  logoAlign?: LogoAlign;
  layoutId?: LayoutId;
  categoryLabel?: string;
  forExport?: boolean;
  // Datos de evento (solo para event-invitation)
  eventDate?: string;
  eventLocation?: string;
  eventTime?: string;
}

// ── Generic format canvas — works for any FormatKey ──────────────────────────
export function FormatCanvas({ format, content, imageUrl, isLoading, showBadge, logoAlign, layoutId = "fundador-classic", categoryLabel, forExport, eventDate, eventLocation, eventTime }: CanvasProps & { format: FormatKey }) {
  // Elegir renderer según el layout seleccionado
  if (layoutId === "editorial") {
    return (
      <EditorialRenderer
        format={format}
        content={content}
        imageUrl={imageUrl}
        isLoading={isLoading}
        categoryLabel={categoryLabel}
        logoAlign={logoAlign}
        forExport={forExport}
      />
    );
  }

  // Default: Fundador Classic (glass card layout)
  const tokens = DEFAULT_LAYOUT.tokens[format];
  return (
    <LayoutRenderer
      format={format}
      tokens={tokens}
      content={content}
      imageUrl={imageUrl}
      isLoading={isLoading}
      showBadge={showBadge}
      logoAlign={logoAlign}
      forExport={forExport}
      eventDate={eventDate}
      eventLocation={eventLocation}
      eventTime={eventTime}
    />
  );
}

// ── Legacy named exports for backward compatibility ─────────────────────────
export function StoryCanvas(props: CanvasProps) { return <FormatCanvas format="story" {...props} />; }
export function SquareCanvas(props: CanvasProps) { return <FormatCanvas format="square" {...props} />; }
export function HorizontalCanvas(props: CanvasProps) { return <FormatCanvas format="horizontal" {...props} />; }
export function PosterCanvas(props: CanvasProps) { return <FormatCanvas format="poster" {...props} />; }
