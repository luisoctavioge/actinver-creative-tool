"use client";

import { useState, useCallback, useRef } from "react";
import {
  FormatKey,
  DEFAULT_FORMAT,
  DEFAULT_CONTENT,
  DEFAULT_CREATOR_INPUT,
  PieceContent,
  CreatorInput,
  ChannelCaption,
} from "@/lib/templates";
import { downloadAllFormats } from "@/lib/export";
import { getFormatsForChannels } from "@/lib/types/channels";
import { saveReference, getMatchingReferences, type SavedReference } from "@/lib/references";

export type GenerationStatus = "idle" | "loading" | "success" | "error";

export function useCreativeState() {
  const [splashDone, setSplashDone] = useState(false);
  const [format, setFormat] = useState<FormatKey>(DEFAULT_FORMAT);

  // Panel abierto: solo uno puede estar abierto al mismo tiempo
  const [openPanel, setOpenPanel] = useState<"brief" | "content" | null>("brief");
  const togglePanel = (panel: "brief" | "content") =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  // Refs para exportación (elementos DOM nativos de cada formato)
  const exportRefs = {
    story:                useRef<HTMLDivElement>(null),
    square:               useRef<HTMLDivElement>(null),
    horizontal:           useRef<HTMLDivElement>(null),
    poster:               useRef<HTMLDivElement>(null),
    "fullhd-v":           useRef<HTMLDivElement>(null),
    "fullhd-h":           useRef<HTMLDivElement>(null),
    "email-internal":     useRef<HTMLDivElement>(null),
    "email-client":       useRef<HTMLDivElement>(null),
    "event-invitation":   useRef<HTMLDivElement>(null),
  };

  // Brandbook fullscreen overlay
  const [brandbookOpen, setBrandbookOpen] = useState(false);

  // Brief del usuario
  const [creatorInput, setCreatorInput] = useState<CreatorInput>(DEFAULT_CREATOR_INPUT);

  // Active formats derived from selected channel
  const activeFormats = getFormatsForChannels(creatorInput.selectedChannels);

  // Contenido generado (va a la pieza)
  const [content, setContent] = useState<PieceContent>(DEFAULT_CONTENT);

  // Imagen de fondo generada
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  // Historial de las últimas 5 imágenes generadas
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  // IDs de Pexels ya usados — evita repetir fotos en la misma sesión
  const [seenPexelsIds, setSeenPexelsIds] = useState<string[]>([]);

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

  // Regenerar campo individual
  const [regeneratingField, setRegeneratingField] = useState<keyof PieceContent | null>(null);

  // Descarga
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "loading">("idle");

  // Pre-flight confirmation modal
  const [showBriefConfirm, setShowBriefConfirm] = useState(false);

  // ── Generar imagen de fondo ────────────────────────────────────────────────
  const handleGenerateImage = useCallback(async (provider: "pexels" | "ai") => {
    if (!content.title.trim()) return;

    setImageStatus("loading");
    setImageError(null);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: creatorInput.product,
          content,
          provider,
          message: creatorInput.message,
          excludeIds: provider === "pexels" ? seenPexelsIds : undefined,
          genero: creatorInput.genero,
          edadRango: creatorInput.edadRango,
          tipoPieza: creatorInput.tipoPieza,
          communicationType: creatorInput.communicationTypes[0] ?? "external",
          imageMode: creatorInput.imageMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar la imagen.");

      setGeneratedImageUrl(data.imageUrl);
      setImageHistory((prev) => [data.imageUrl, ...prev].slice(0, 5));
      if (data.pexelsId) {
        setSeenPexelsIds((prev) => [...prev, data.pexelsId]);
      }
      setImageStatus("success");
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : "Error desconocido.");
      setImageStatus("error");
    }
  }, [content, creatorInput.product, creatorInput.message, seenPexelsIds]);

  // ── Crear pieza completa (texto + imagen + variantes en paralelo) ──────────
  const handleCreateFull = useCallback(async () => {
    if (!creatorInput.product.trim() && !creatorInput.message.trim()) return;

    // 1. Generar copy
    setContentStatus("loading");
    setContentError(null);
    setGeneratedImageUrl(null);
    setImageStatus("idle");
    setVariants([]);
    setVariantsStatus("loading");

    const hasChannels = creatorInput.channels.length > 0;
    if (hasChannels) {
      setCaptions([]);
      setCaptionsStatus("loading");
    }

    // Buscar referencias relevantes en localStorage para few-shot
    const matchingRefs = getMatchingReferences(creatorInput.product, creatorInput.message ?? "");

    let generatedContent: PieceContent | null = null;
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...creatorInput, references: matchingRefs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar el contenido.");
      generatedContent = data as PieceContent;
      setContent(generatedContent);
      setContentStatus("success");
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parallelTasks: Promise<any>[] = [
      // [0] Imagen Pexels
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: creatorInput.product,
          content: generatedContent,
          provider: "pexels",
          message: creatorInput.message,
          excludeIds: seenPexelsIds,
          genero: creatorInput.genero,
          edadRango: creatorInput.edadRango,
          tipoPieza: creatorInput.tipoPieza,
          communicationType: creatorInput.communicationTypes[0] ?? "external",
          imageMode: creatorInput.imageMode,
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
    if (contentStatus === "success") setContentStatus("idle");
  };

  const handleFormatChange = (next: FormatKey) => {
    setFormat(next);
  };

  // When selected channels change, auto-select first format if current is no longer active
  const handleSetCreatorInput = useCallback((next: CreatorInput) => {
    setCreatorInput((prev) => {
      const prevFormats = getFormatsForChannels(prev.selectedChannels);
      const nextFormats = getFormatsForChannels(next.selectedChannels);
      const hasChanged = JSON.stringify(prev.selectedChannels) !== JSON.stringify(next.selectedChannels);
      if (hasChanged && nextFormats.length > 0 && !nextFormats.includes(format)) {
        setFormat(nextFormats[0]);
      }
      // If channels were removed, also reset format if needed
      if (hasChanged && prevFormats.includes(format) && !nextFormats.includes(format)) {
        setFormat(nextFormats[0] ?? "story");
      }
      return next;
    });
  }, [format]);

  const handleSelectVariant = useCallback((variant: PieceContent) => {
    setContent(variant);
    setVariants([]);
    setVariantsStatus("idle");
    setCaptions([]);
    setCaptionsStatus("idle");
    setBottomPanelOpen(false);
  }, []);

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

  const handleDownload = useCallback(async () => {
    if (downloadStatus === "loading") return;
    setDownloadStatus("loading");
    try {
      const refs: Partial<Record<FormatKey, HTMLElement | null>> = {};
      for (const fmt of activeFormats) {
        refs[fmt] = exportRefs[fmt]?.current ?? null;
      }
      await downloadAllFormats(refs, activeFormats);
    } finally {
      setDownloadStatus("idle");
    }
  }, [downloadStatus, activeFormats, exportRefs]);

  const handleSelectHistoryImage = useCallback((url: string) => {
    setGeneratedImageUrl(url);
    setImageStatus("success");
  }, []);

  // ── Guardar pieza aprobada como referencia ──────────────────────────────────
  const handleSaveReference = useCallback((): SavedReference | null => {
    if (!content.title.trim()) return null;
    const ref = saveReference({
      product: creatorInput.product,
      message: creatorInput.message ?? "",
      pieceContent: content,
      imageUrlThumb: generatedImageUrl,
      creatorInput,
    });
    return ref;
  }, [content, creatorInput, generatedImageUrl]);

  // ── Pre-flight: muestra confirmación antes de generar ──────────────────────
  const handleRequestCreate = useCallback(() => {
    if (!creatorInput.product.trim() && !creatorInput.message.trim()) return;
    setShowBriefConfirm(true);
  }, [creatorInput.product, creatorInput.message]);

  const handleConfirmCreate = useCallback(() => {
    setShowBriefConfirm(false);
    handleCreateFull();
  }, [handleCreateFull]);

  const handleCancelCreate = useCallback(() => {
    setShowBriefConfirm(false);
  }, []);

  // ── Estado global para status bar ──────────────────────────────────────────
  const globalStatus = imageStatus !== "idle" ? imageStatus : contentStatus;

  return {
    // Derived
    activeFormats,

    // State
    splashDone,
    format,
    openPanel,
    brandbookOpen,
    creatorInput,
    content,
    generatedImageUrl,
    imageHistory,
    contentStatus,
    contentError,
    imageStatus,
    imageError,
    variants,
    variantsStatus,
    captions,
    captionsStatus,
    bottomPanelOpen,
    regeneratingField,
    downloadStatus,
    globalStatus,
    exportRefs,
    showBriefConfirm,

    // Actions
    setSplashDone,
    togglePanel,
    setBrandbookOpen,
    setCreatorInput: handleSetCreatorInput,
    setBottomPanelOpen,
    handleGenerateImage,
    handleCreateFull,
    handleSaveReference,
    handleRequestCreate,
    handleConfirmCreate,
    handleCancelCreate,
    handleContentChange,
    handleFormatChange,
    handleSelectVariant,
    handleRegenerateField,
    handleDownload,
    handleSelectHistoryImage,
  };
}
