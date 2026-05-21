"use client";

import { useState, useCallback, useRef } from "react";
import {
  FormatKey,
  DEFAULT_FORMAT,
  DEFAULT_CONTENT,
  DEFAULT_CREATOR_INPUT,
  PieceContent,
  CreatorInput,
} from "@/lib/templates";
import FormatToolbar from "@/components/Toolbar/FormatToolbar";
import { BriefSection, PieceSection } from "@/components/Editor/EditorPanel";
import CanvasPreview, { StoryCanvas, SquareCanvas, HorizontalCanvas, PosterCanvas } from "@/components/Canvas/CanvasPreview";
import { downloadAllFormats } from "@/lib/export";
import CaptionPanel from "@/components/CaptionPanel/CaptionPanel";
import SplashScreen from "@/components/SplashScreen";
import { ChannelCaption } from "@/lib/templates";

export type GenerationStatus = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [format, setFormat] = useState<FormatKey>(DEFAULT_FORMAT);

  // Panel abierto: solo uno puede estar abierto al mismo tiempo
  const [openPanel, setOpenPanel] = useState<"brief" | "content" | null>("brief");
  const togglePanel = (panel: "brief" | "content") =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  // Refs para exportación (elementos DOM nativos de cada formato)
  const exportRefs = {
    story:      useRef<HTMLDivElement>(null),
    square:     useRef<HTMLDivElement>(null),
    horizontal: useRef<HTMLDivElement>(null),
    poster:     useRef<HTMLDivElement>(null),
  };

  // Brandbook fullscreen overlay
  const [brandbookOpen, setBrandbookOpen] = useState(false);

  // Brief del usuario
  const [creatorInput, setCreatorInput] = useState<CreatorInput>(DEFAULT_CREATOR_INPUT);

  // Contenido generado (va a la pieza)
  const [content, setContent] = useState<PieceContent>(DEFAULT_CONTENT);

  // Imagen de fondo generada
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  // Historial de las últimas 5 imágenes generadas
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  // IDs de Pexels ya usados — evita repetir fotos en la misma sesión
  const [seenPexelsIds, setSeenPexelsIds] = useState<string[]>([]);
  // Descripciones de imágenes AI ya generadas — el prompt las evita en la siguiente
  const [seenAIDescriptions, setSeenAIDescriptions] = useState<string[]>([]);
  // Último proveedor usado — alimenta el botón "otra imagen"
  const [lastImageProvider, setLastImageProvider] = useState<"pexels" | "ai" | null>(null);
  // Posición manual del fondo (objectPosition en %). Se reinicia a 50/50 cuando llega una imagen nueva.
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  // Zoom del fondo (1 = normal). Se reinicia a 1 cuando llega una imagen nueva.
  const [imageZoom, setImageZoom] = useState<number>(1);
  // Contador de imágenes AI generadas — se usa como compositionIndex para rotar ángulos.
  const [aiImageCount, setAiImageCount] = useState<number>(0);

  // Estados independientes para texto e imagen
  const [contentStatus, setContentStatus] = useState<GenerationStatus>("idle");
  const [contentError, setContentError] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<GenerationStatus>("idle");
  const [imageError, setImageError] = useState<string | null>(null);

  // 3 variantes de copy (se generan automáticamente al crear pieza)
  const [variants, setVariants] = useState<PieceContent[]>([]);
  const [variantsStatus, setVariantsStatus] = useState<GenerationStatus>("idle");

  // Captions por canal social
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [captions, setCaptions] = useState<ChannelCaption[]>([]);
  const [captionsStatus, setCaptionsStatus] = useState<GenerationStatus>("idle");

  // ── Generar imagen de fondo ────────────────────────────────────────────────
  const handleGenerateImage = useCallback(async (provider: "pexels" | "ai") => {
    if (!content.title.trim()) return;

    setImageStatus("loading");
    setImageError(null);
    setGeneratedImageUrl(null);
    setLastImageProvider(provider);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: creatorInput.product,
          message: creatorInput.message,
          content,
          provider,
          excludeIds: provider === "pexels" ? seenPexelsIds : undefined,
          excludeDescriptions: provider === "ai" ? seenAIDescriptions : undefined,
          compositionIndex: provider === "ai" ? aiImageCount : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar la imagen.");

      setGeneratedImageUrl(data.imageUrl);
      setImagePosition({ x: 50, y: 50 });
      setImageZoom(1);
      setImageHistory((prev) => [data.imageUrl, ...prev].slice(0, 5));
      if (data.pexelsId) {
        setSeenPexelsIds((prev) => [...prev, data.pexelsId]);
      }
      if (data.aiSceneDescription) {
        setSeenAIDescriptions((prev) => [...prev, data.aiSceneDescription].slice(-5));
      }
      if (provider === "ai") setAiImageCount((prev) => prev + 1);
      setImageStatus("success");
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : "Error desconocido.");
      setImageStatus("error");
    }
  }, [content, creatorInput.product, creatorInput.message, seenPexelsIds, seenAIDescriptions]);

  // ── Crear pieza completa (texto + imagen + variantes en paralelo) ──────────
  const handleCreateFull = useCallback(async () => {
    if (!creatorInput.product.trim()) return;

    // 1. Generar copy
    setContentStatus("loading");
    setContentError(null);
    setGeneratedImageUrl(null);
    setImageStatus("idle");
    setLastImageProvider(null);
    // Abrir el panel de Contenido para que el usuario vea los resultados (incluidas las variantes)
    setOpenPanel("content");
    // Limpiar variantes anteriores e iniciar carga
    setVariants([]);
    setVariantsStatus("loading");
    // Limpiar captions si hay canales seleccionados
    const hasChannels = creatorInput.channels.length > 0;
    if (hasChannels) {
      setCaptions([]);
      setCaptionsStatus("loading");
    }

    let generatedContent: PieceContent | null = null;
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creatorInput),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar el contenido.");
      generatedContent = data as PieceContent;
      setContent(generatedContent);
      setContentStatus("success");
      // Nuevo contenido = reset de IDs vistos para búsquedas frescas
      setSeenPexelsIds([]);
    } catch (err: unknown) {
      setContentError(err instanceof Error ? err.message : "Error desconocido.");
      setContentStatus("error");
      setVariantsStatus("idle");
      if (hasChannels) setCaptionsStatus("idle");
      return;
    }

    // 2. Imagen + variantes en paralelo
    if (!generatedContent) return;
    setImageStatus("loading");
    setImageError(null);
    setLastImageProvider("pexels");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parallelTasks: Promise<any>[] = [
      // [0] Imagen Pexels
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: creatorInput.product,
          message: creatorInput.message,
          content: generatedContent,
          provider: "pexels",
          excludeIds: seenPexelsIds,
        }),
      }).then((r) => r.json().then((d) => ({ ok: r.ok, ...d }))),

      // [1] 3 variantes de copy
      fetch("/api/generate-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creatorInput),
      }).then((r) => r.json().then((d) => ({ ok: r.ok, ...d }))),
    ];

    // [2] Captions (solo si hay canales seleccionados)
    if (hasChannels) {
      parallelTasks.push(
        fetch("/api/generate-captions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: creatorInput, pieceContent: generatedContent }),
        }).then((r) => r.json().then((d) => ({ ok: r.ok, ...d })))
      );
    }

    const results = await Promise.allSettled(parallelTasks);

    // Procesar imagen [0]
    const imageResult = results[0];
    if (imageResult.status === "fulfilled" && imageResult.value.ok) {
      const d = imageResult.value;
      setGeneratedImageUrl(d.imageUrl);
      setImagePosition({ x: 50, y: 50 });
      setImageZoom(1);
      setImageHistory((prev) => [d.imageUrl, ...prev].slice(0, 5));
      if (d.pexelsId) setSeenPexelsIds((prev) => [...prev, d.pexelsId]);
      setImageStatus("success");
    } else {
      const msg = imageResult.status === "fulfilled"
        ? (imageResult.value.error ?? "Error al generar la imagen.")
        : "Error al generar la imagen.";
      setImageError(msg);
      setImageStatus("error");
    }

    // Procesar variantes [1]
    const variantsResult = results[1];
    if (variantsResult.status === "fulfilled" && variantsResult.value.ok) {
      setVariants(variantsResult.value.variants ?? []);
      setVariantsStatus("success");
    } else {
      setVariantsStatus("error");
    }

    // Procesar captions [2]
    if (hasChannels && results[2]) {
      const captionsResult = results[2];
      if (captionsResult.status === "fulfilled" && captionsResult.value.ok) {
        setCaptions(captionsResult.value.captions ?? []);
        setCaptionsStatus("success");
        setBottomPanelOpen(true);
      } else {
        setCaptionsStatus("error");
      }
    }
  }, [creatorInput, seenPexelsIds]);

  // ── Handlers de cambio ──────────────────────────────────────────────────────
  const handleContentChange = (next: PieceContent) => {
    setContent(next);
    // Si editan el copy manualmente, la imagen sigue siendo válida
    if (contentStatus === "success") setContentStatus("idle");
  };

  const handleFormatChange = (next: FormatKey) => {
    setFormat(next);
    // La imagen generada aplica a todos los formatos — no se descarta
  };

  const handleSelectVariant = useCallback((variant: PieceContent) => {
    setContent(variant);
    // La imagen de fondo NO se descarta al cambiar variante — sólo cambia
    // explícitamente cuando el usuario pide "otra imagen" o regenera.
    // Los captions sí se limpian porque referencian el copy anterior.
    setCaptions([]);
    setCaptionsStatus("idle");
    setBottomPanelOpen(false);
  }, []);

  // ── Regenerar campo individual ──────────────────────────────────────────────
  const [regeneratingField, setRegeneratingField] = useState<keyof PieceContent | null>(null);

  const handleRegenerateField = useCallback(async (field: keyof PieceContent) => {
    if (regeneratingField) return;
    setRegeneratingField(field);
    try {
      const res = await fetch("/api/regenerate-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, input: creatorInput, current: content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al regenerar el campo.");
      setContent((prev) => ({ ...prev, [field]: data[field] }));
    } catch {
      // silencioso — el campo queda como estaba
    } finally {
      setRegeneratingField(null);
    }
  }, [regeneratingField, creatorInput, content]);

  // ── Descarga ────────────────────────────────────────────────────────────────
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "loading">("idle");

  const handleDownload = useCallback(async () => {
    if (downloadStatus === "loading") return;
    setDownloadStatus("loading");
    try {
      await downloadAllFormats({
        story:      exportRefs.story.current,
        square:     exportRefs.square.current,
        horizontal: exportRefs.horizontal.current,
        poster:     exportRefs.poster.current,
      });
    } finally {
      setDownloadStatus("idle");
    }
  }, [downloadStatus, exportRefs.story, exportRefs.square, exportRefs.horizontal, exportRefs.poster]);

  // ── Estado global para status bar ──────────────────────────────────────────
  const globalStatus = imageStatus !== "idle" ? imageStatus : contentStatus;

  return (
    <>
      {!splashDone && (
        <SplashScreen
          onDone={() => setSplashDone(true)}
          onOpenBrandbook={() => setBrandbookOpen(true)}
        />
      )}
    <div className="flex flex-col h-screen bg-azul-grandeza overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-azul-grandeza/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-1">
          <span className="font-poppins font-light text-white text-xl tracking-tight">
            Actinver
          </span>
          <span className="ml-2 text-white/20 font-open-sans text-legal">|</span>
          <span className="ml-2 text-white/40 font-open-sans text-legal uppercase tracking-widest">
            Creative Tool
          </span>
        </div>

        <FormatToolbar
          selected={format}
          onChange={handleFormatChange}
          content={content}
          imageUrl={generatedImageUrl}
          isLoading={imageStatus === "loading"}
        />

        <div className="flex items-center gap-2">
          {/* Revisar Brandbook */}
          <button
            onClick={() => setBrandbookOpen(true)}
            className="px-4 py-1.5 rounded-lg border border-white/10 text-legal font-open-sans font-bold text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="1" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M5 5h4M5 8h4M5 11h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M12 4l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Brandbook
          </button>

          {/* Descargar */}
          <button
            onClick={handleDownload}
            disabled={downloadStatus === "loading" || !content.title.trim()}
            className={`
              px-4 py-1.5 rounded-lg border text-legal font-open-sans font-bold
              transition-all duration-200
              ${content.title.trim() && downloadStatus !== "loading"
                ? "border-sunset/60 text-sunset hover:bg-sunset/10 active:scale-[0.98] cursor-pointer"
                : "border-sunset/20 text-sunset/30 cursor-not-allowed"
              }
            `}
          >
            {downloadStatus === "loading" ? "Exportando..." : "Descargar"}
          </button>
        </div>
      </header>

      {/* ── Layout principal ─────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Strip BRIEF ─── */}
        <PanelStrip
          label="Brief"
          side="left"
          open={openPanel === "brief"}
          onToggle={() => togglePanel("brief")}
        />

        {/* ── Panel BRIEF ─── */}
        <div
          style={{ width: openPanel === "brief" ? 360 : 0, transition: "width 260ms ease-in-out", flexShrink: 0, overflow: "hidden" }}
        >
          <div style={{ width: 360 }} className="h-full flex flex-col border-r border-white/10">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-6">
              <BriefSection
                creatorInput={creatorInput}
                onChange={setCreatorInput}
                onCreateFull={handleCreateFull}
                status={contentStatus}
                error={contentError}
              />
            </div>
          </div>
        </div>

        {/* ── Canvas ─── */}
        <section className="flex-1 flex flex-col overflow-hidden bg-azul-acompanamiento/20 p-6 min-w-0">
          <CanvasPreview
            format={format}
            content={content}
            imageUrl={generatedImageUrl}
            isLoading={imageStatus === "loading"}
            imageHistory={imageHistory}
            showBadge={creatorInput.conBadge}
            logoAlign={creatorInput.logoAlign}
            cardStyle={creatorInput.cardStyle}
            imagePosition={imagePosition}
            onImagePositionChange={setImagePosition}
            imageZoom={imageZoom}
            onImageZoomChange={setImageZoom}
            onSelectHistoryImage={(url) => {
              setGeneratedImageUrl(url);
              setImagePosition({ x: 50, y: 50 });
              setImageZoom(1);
              setImageStatus("success");
            }}
          />
        </section>

        {/* ── Panel CONTENIDO ─── */}
        <div
          style={{ width: openPanel === "content" ? 340 : 0, transition: "width 260ms ease-in-out", flexShrink: 0, overflow: "hidden" }}
        >
          <div style={{ width: 340 }} className="h-full flex flex-col border-l border-white/10">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-6">
              <PieceSection
                content={content}
                onChange={handleContentChange}
                onGenerateImage={(provider) => handleGenerateImage(provider)}
                onRegenerateField={handleRegenerateField}
                regeneratingField={regeneratingField}
                imageStatus={imageStatus}
                imageError={imageError}
                contentReady={contentStatus === "success"}
                variants={variants}
                variantsStatus={variantsStatus}
                onSelectVariant={handleSelectVariant}
                lastImageProvider={lastImageProvider}
                imageUrl={generatedImageUrl}
              />
            </div>
          </div>
        </div>

        {/* ── Strip CONTENIDO ─── */}
        <PanelStrip
          label="Contenido"
          side="right"
          open={openPanel === "content"}
          onToggle={() => togglePanel("content")}
        />

      </main>

      {/* ── Panel inferior de captions ──────────────────────────── */}
      <CaptionPanel
        open={bottomPanelOpen}
        onToggle={() => setBottomPanelOpen((prev) => !prev)}
        captions={captions}
        captionsStatus={captionsStatus}
        selectedChannels={creatorInput.channels}
      />

      {/* ── Capa de exportación — movida al viewport durante la captura por lib/export.ts ── */}
      {/* Los refs apuntan al contenedor directo del canvas nativo (sin transform:scale). */}
      <div aria-hidden style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none", zIndex: -1 }}>
        <div ref={exportRefs.story}      style={{ display: "inline-block" }}><StoryCanvas      content={content} imageUrl={generatedImageUrl} isLoading={false} showBadge={creatorInput.conBadge} logoAlign={creatorInput.logoAlign} cardStyle={creatorInput.cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} /></div>
        <div ref={exportRefs.square}     style={{ display: "inline-block" }}><SquareCanvas     content={content} imageUrl={generatedImageUrl} isLoading={false} showBadge={creatorInput.conBadge} logoAlign={creatorInput.logoAlign} cardStyle={creatorInput.cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} /></div>
        <div ref={exportRefs.horizontal} style={{ display: "inline-block" }}><HorizontalCanvas content={content} imageUrl={generatedImageUrl} isLoading={false} showBadge={creatorInput.conBadge} logoAlign={creatorInput.logoAlign} cardStyle={creatorInput.cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} /></div>
        <div ref={exportRefs.poster}     style={{ display: "inline-block" }}><PosterCanvas     content={content} imageUrl={generatedImageUrl} isLoading={false} showBadge={creatorInput.conBadge} logoAlign={creatorInput.logoAlign} cardStyle={creatorInput.cardStyle} imagePosition={imagePosition} imageZoom={imageZoom} /></div>
      </div>

      {/* ── Overlay fullscreen del brandbook ──────────────────────── */}
      {brandbookOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,14,18,0.96)", display: "flex", flexDirection: "column" }}
        >
          {/* Barra superior del overlay */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
            <span className="font-poppins text-white/60 text-legal uppercase tracking-widest">Brandbook Actinver</span>
            <button
              onClick={() => setBrandbookOpen(false)}
              className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
              title="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* iframe del PDF */}
          <iframe
            src="/brandbook-actinver/index.html"
            style={{ flex: 1, border: "none", width: "100%", height: "100%" }}
            title="Brandbook Actinver"
          />
        </div>
      )}

      {/* ── Status bar ──────────────────────────────────────────── */}
      <footer className="flex items-center justify-between px-6 py-2 border-t border-white/5 shrink-0">
        <span className="text-legal text-white/20 font-open-sans">
          Actinver Creative Tool
        </span>
        <span className="text-legal font-open-sans">
          {globalStatus === "loading" && (
            <span className="text-sunset animate-pulse">
              {imageStatus === "loading" ? "Generando imagen..." : "Generando contenido..."}
            </span>
          )}
          {globalStatus === "success" && imageStatus === "success" && (
            <span className="text-green-400/70">Imagen generada</span>
          )}
          {globalStatus === "success" && contentStatus === "success" && imageStatus === "idle" && (
            <span className="text-sunset/70">Contenido listo — genera el fondo</span>
          )}
          {globalStatus === "error" && <span className="text-red-400/70">Error al generar</span>}
          {globalStatus === "idle" && <span className="text-white/20">&nbsp;</span>}
        </span>
      </footer>
    </div>
    </>
  );
}

// ── Strip de panel (pestaña lateral siempre visible) ──────────────────────────

function PanelStrip({
  label,
  side,
  open,
  onToggle,
}: {
  label: string;
  side: "left" | "right";
  open: boolean;
  onToggle: () => void;
}) {
  // Dirección del chevron:
  // Left strip abierto → apunta ← (cerrar), cerrado → apunta → (abrir)
  // Right strip abierto → apunta → (cerrar), cerrado → apunta ← (abrir)
  const pointRight = side === "left" ? !open : open;

  return (
    <button
      onClick={onToggle}
      title={open ? `Cerrar ${label}` : `Abrir ${label}`}
      className={`
        w-8 shrink-0 flex flex-col items-center justify-center gap-3 py-8
        transition-colors duration-150 cursor-pointer select-none
        ${side === "left" ? "border-r" : "border-l"} border-white/10
        ${open ? "bg-white/5 text-sunset" : "text-white/25 hover:text-white/55 hover:bg-white/[0.03]"}
      `}
    >
      {/* Chevron */}
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
        {pointRight
          ? <path d="M1.5 1L5.5 6L1.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M5.5 1L1.5 6L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>

      {/* Etiqueta vertical */}
      <span
        className="font-open-sans uppercase tracking-[0.18em] font-medium"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          fontSize: 9,
          transform: side === "right" ? "rotate(180deg)" : undefined,
        }}
      >
        {label}
      </span>
    </button>
  );
}
