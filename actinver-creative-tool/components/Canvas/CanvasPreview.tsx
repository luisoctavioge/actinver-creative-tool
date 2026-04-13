"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { FormatKey, FORMATS, NATIVE, PieceContent, LogoAlign } from "@/lib/templates";
import { DEFAULT_LAYOUT } from "@/lib/layouts";
import LayoutRenderer from "./LayoutRenderer";

interface CanvasPreviewProps {
  format: FormatKey;
  content: PieceContent;
  imageUrl: string | null;
  isLoading: boolean;
  imageHistory?: string[];
  onSelectHistoryImage?: (url: string) => void;
  showBadge?: boolean;
  logoAlign?: LogoAlign;
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
export default function CanvasPreview({ format, content, imageUrl, isLoading, imageHistory, onSelectHistoryImage, showBadge = true, logoAlign = "left" }: CanvasPreviewProps) {
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

        {/* Contenedor de escala — mide el espacio disponible */}
        <div ref={containerRef} className="flex-1 w-full flex items-center justify-center min-h-0">
          {/* Wrapper al tamaño escalado (evita overflow) */}
          <div style={{ width: nativeW * scale, height: nativeH * scale, flexShrink: 0 }}>
            {/* Canvas nativo — se escala con transform */}
            <div
              style={{
                width: nativeW,
                height: nativeH,
                transformOrigin: "top left",
                transform: `scale(${scale})`,
              }}
            >
              {format === "story"      && <StoryCanvas      content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} />}
              {format === "square"     && <SquareCanvas     content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} />}
              {format === "horizontal" && <HorizontalCanvas content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} />}
              {format === "poster"     && <PosterCanvas     content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} />}
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
  forExport?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Wrappers que delegan al LayoutRenderer genérico con DEFAULT_LAYOUT.
// ─────────────────────────────────────────────────────────────────────────────
export function StoryCanvas({ content, imageUrl, isLoading, showBadge, logoAlign, forExport }: CanvasProps) {
  return <LayoutRenderer format="story" tokens={DEFAULT_LAYOUT.tokens.story} content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} forExport={forExport} />;
}

export function SquareCanvas({ content, imageUrl, isLoading, showBadge, logoAlign, forExport }: CanvasProps) {
  return <LayoutRenderer format="square" tokens={DEFAULT_LAYOUT.tokens.square} content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} forExport={forExport} />;
}

export function HorizontalCanvas({ content, imageUrl, isLoading, showBadge, logoAlign, forExport }: CanvasProps) {
  return <LayoutRenderer format="horizontal" tokens={DEFAULT_LAYOUT.tokens.horizontal} content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} forExport={forExport} />;
}

export function PosterCanvas({ content, imageUrl, isLoading, showBadge, logoAlign, forExport }: CanvasProps) {
  return <LayoutRenderer format="poster" tokens={DEFAULT_LAYOUT.tokens.poster} content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} forExport={forExport} />;
}
