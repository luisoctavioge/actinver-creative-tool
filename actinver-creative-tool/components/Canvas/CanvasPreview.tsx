"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { FormatKey, FORMATS, NATIVE, PieceContent, LogoAlign, CardStyle } from "@/lib/templates";
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
  cardStyle?: CardStyle;
  imagePosition?: { x: number; y: number };
  onImagePositionChange?: (pos: { x: number; y: number }) => void;
  imageZoom?: number;
  onImageZoomChange?: (zoom: number) => void;
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
export default function CanvasPreview({ format, content, imageUrl, isLoading, imageHistory, onSelectHistoryImage, showBadge = true, logoAlign = "left", cardStyle = "solid", imagePosition, onImagePositionChange, imageZoom = 1, onImageZoomChange }: CanvasPreviewProps) {
  const fmt = FORMATS[format];
  const { w: nativeW, h: nativeH } = NATIVE[format];
  const { containerRef, scale } = useCanvasScale(nativeW, nativeH);

  // Drag para reposicionar la imagen de fondo (objectPosition 0-100%).
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{
    startX: number; startY: number;
    origX:  number; origY:  number;
  } | null>(null);

  const canDrag = !!imageUrl && !!onImagePositionChange && !isLoading;

  const onMouseDown = (e: React.MouseEvent) => {
    if (!canDrag) return;
    e.preventDefault();
    const current = imagePosition ?? { x: 50, y: 50 };
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX:  current.x,
      origY:  current.y,
    };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      if (!dragState.current || !onImagePositionChange) return;
      const { startX, startY, origX, origY } = dragState.current;
      // Sensibilidad: el rango completo de drag se cubre en ~1 ancho/alto del canvas escalado.
      const dx = ((e.clientX - startX) / (nativeW * scale)) * -100;
      const dy = ((e.clientY - startY) / (nativeH * scale)) * -100;
      const nx = Math.max(0, Math.min(100, origX + dx));
      const ny = Math.max(0, Math.min(100, origY + dy));
      onImagePositionChange({ x: nx, y: ny });
    };
    const handleUp = () => {
      setDragging(false);
      dragState.current = null;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, nativeW, nativeH, scale, onImagePositionChange]);

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
          <div
            onMouseDown={onMouseDown}
            style={{
              width:    nativeW * scale,
              height:   nativeH * scale,
              flexShrink: 0,
              cursor:   canDrag ? (dragging ? "grabbing" : "grab") : "default",
              userSelect: dragging ? "none" : undefined,
              // Redondeo visual solo en preview — el canvas nativo (para export) no tiene borderRadius.
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {/* Canvas nativo — se escala con transform */}
            <div
              style={{
                width: nativeW,
                height: nativeH,
                transformOrigin: "top left",
                transform: `scale(${scale})`,
                pointerEvents: "none", // deja pasar los eventos al wrapper padre para el drag
              }}
            >
              {format === "story"      && <StoryCanvas      content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} cardStyle={cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} />}
              {format === "square"     && <SquareCanvas     content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} cardStyle={cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} />}
              {format === "horizontal" && <HorizontalCanvas content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} cardStyle={cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} />}
              {format === "poster"     && <PosterCanvas     content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} cardStyle={cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} />}
            </div>
          </div>
        </div>

        {/* Controles de imagen: drag hint + zoom */}
        {canDrag && (
          <div className="flex items-center gap-3 shrink-0">
            {/* Hint drag */}
            <div className="text-legal font-open-sans text-white/30 flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Arrastra para reencuadrar
            </div>

            {/* Separador */}
            <div className="w-px h-3 bg-white/10" />

            {/* Zoom controls */}
            {onImageZoomChange && (
              <div className="flex items-center gap-1">
                {/* Zoom out */}
                <button
                  onClick={() => onImageZoomChange(Math.max(0.5, (imageZoom ?? 1) - 0.1))}
                  title="Alejar"
                  className="w-6 h-6 flex items-center justify-center rounded text-white/35 hover:text-white/70 hover:bg-white/8 transition-colors cursor-pointer"
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M5 7h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>

                {/* Zoom level indicator */}
                <span className="text-white/25 font-open-sans w-8 text-center" style={{ fontSize: 9 }}>
                  {Math.round((imageZoom ?? 1) * 100)}%
                </span>

                {/* Zoom in */}
                <button
                  onClick={() => onImageZoomChange(Math.min(2.5, (imageZoom ?? 1) + 0.1))}
                  title="Acercar"
                  className="w-6 h-6 flex items-center justify-center rounded text-white/35 hover:text-white/70 hover:bg-white/8 transition-colors cursor-pointer"
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>

                {/* Reset / center */}
                <button
                  onClick={() => {
                    onImageZoomChange(1);
                    if (onImagePositionChange) onImagePositionChange({ x: 50, y: 50 });
                  }}
                  title="Centrar y restablecer zoom"
                  className="w-6 h-6 flex items-center justify-center rounded text-white/35 hover:text-white/70 hover:bg-white/8 transition-colors cursor-pointer ml-0.5"
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

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
  cardStyle?: CardStyle;
  imagePosition?: { x: number; y: number };
  imageZoom?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Wrappers que delegan al LayoutRenderer genérico con DEFAULT_LAYOUT.
// Se mantienen como exports nombrados para compatibilidad con page.tsx y
// FormatToolbar. Agregar un nuevo layout = definir otro LayoutConfig.
// ─────────────────────────────────────────────────────────────────────────────
export function StoryCanvas({ content, imageUrl, isLoading, showBadge, logoAlign, cardStyle, imagePosition, imageZoom }: CanvasProps) {
  return <LayoutRenderer format="story" tokens={DEFAULT_LAYOUT.tokens.story} content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} cardStyle={cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} />;
}

export function SquareCanvas({ content, imageUrl, isLoading, showBadge, logoAlign, cardStyle, imagePosition, imageZoom }: CanvasProps) {
  return <LayoutRenderer format="square" tokens={DEFAULT_LAYOUT.tokens.square} content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} cardStyle={cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} />;
}

export function HorizontalCanvas({ content, imageUrl, isLoading, showBadge, logoAlign, cardStyle, imagePosition, imageZoom }: CanvasProps) {
  return <LayoutRenderer format="horizontal" tokens={DEFAULT_LAYOUT.tokens.horizontal} content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} cardStyle={cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} />;
}

export function PosterCanvas({ content, imageUrl, isLoading, showBadge, logoAlign, cardStyle, imagePosition, imageZoom }: CanvasProps) {
  return <LayoutRenderer format="poster" tokens={DEFAULT_LAYOUT.tokens.poster} content={content} imageUrl={imageUrl} isLoading={isLoading} showBadge={showBadge} logoAlign={logoAlign} cardStyle={cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} />;
}
