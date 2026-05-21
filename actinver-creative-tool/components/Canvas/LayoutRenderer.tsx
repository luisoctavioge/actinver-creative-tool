"use client";

// Renderer genérico de layouts — lee todos los valores de un LayoutConfig
// en lugar de hardcodearlos. Mismo DOM e inline styles que los canvas originales
// (requerido para html2canvas).
//
// REGLAS DE COMPATIBILIDAD html2canvas:
// - Sin transform: scale() en imágenes dentro de overflow:hidden (el clip no funciona).
//   → Zoom se implementa con dimensiones absolutas + left/top offset.
// - Sin display:inline-flex ni alignSelf en elementos hijos flex
//   (el chip de highlight usa display:inline-block dentro de un wrapper block).
// - Sin CSS gap en flex si se quiere garantizar spacing en exportación.
//   → Usamos marginLeft explícito en el badge.
// - SIN objectFit: cover en <img> — html2canvas no lo implementa (la imagen se estira).
//   → Calculamos el "cover scale" manualmente con naturalWidth/naturalHeight vía onLoad.
//   → Mientras no se conoce el tamaño natural, la img ocupa 100%×100% como fallback.

import { useState, useEffect } from "react";
import { FormatKey, NATIVE, PieceContent, LogoAlign, CardStyle } from "@/lib/templates";
import { LayoutTokens } from "@/lib/layouts";
import ActinverLogo from "./ActinverLogo";

const BG = "#0a0e12";

interface LayoutRendererProps {
  format: FormatKey;
  tokens: LayoutTokens;
  content: PieceContent;
  imageUrl: string | null;
  isLoading: boolean;
  showBadge?: boolean;
  logoAlign?: LogoAlign;
  cardStyle?: CardStyle;
  imagePosition?: { x: number; y: number }; // 0-100 porcentajes
  imageZoom?: number; // 1.0 = normal, >1 = zoom in, <1 = zoom out
}

export default function LayoutRenderer({
  format,
  tokens,
  content,
  imageUrl,
  isLoading,
  showBadge = true,
  logoAlign = "left",
  cardStyle = "solid",
  imagePosition,
  imageZoom = 1,
}: LayoutRendererProps) {
  const { w, h } = NATIVE[format];
  const hasContent = content.title.trim().length > 0;
  const t = tokens;
  const headerReversed = logoAlign === "right";
  const headerCentered = logoAlign === "center";

  // ── Dimensiones naturales de la imagen (para cover sin objectFit) ────────────
  // html2canvas NO implementa object-fit: cover — la imagen se estira.
  // Solución: trackear naturalWidth/naturalHeight con onLoad y calcular el
  // "cover scale" manualmente, igual que hacemos con el zoom.
  const [natImg, setNatImg] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => { setNatImg(null); }, [imageUrl]);

  const handleImgNaturalSize = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const nw = e.currentTarget.naturalWidth;
    const nh = e.currentTarget.naturalHeight;
    if (nw && nh) setNatImg({ w: nw, h: nh });
  };

  // ── Cover + Zoom en píxeles absolutos (sin objectFit, sin transform) ─────────
  const zoom = Math.max(0.5, Math.min(2.5, imageZoom ?? 1));
  const px = imagePosition?.x ?? 50; // 0-100
  const py = imagePosition?.y ?? 50; // 0-100

  // Compute cover+zoom dims ONLY once naturalWidth/naturalHeight are known.
  // Mientras natImg es null usamos el fallback objectFit:cover del browser (ver imgStyle abajo).
  const coverScale = natImg ? Math.max(w / natImg.w, h / natImg.h) : 1;
  const imgW    = natImg ? Math.round(natImg.w * coverScale * zoom) : w;
  const imgH    = natImg ? Math.round(natImg.h * coverScale * zoom) : h;
  const imgLeft = natImg ? Math.round((w - imgW) * (px / 100)) : 0;
  const imgTop  = natImg ? Math.round((h - imgH) * (py / 100)) : 0;

  // Estilo de la imagen:
  // • natImg disponible → dimensiones absolutas explícitas (sin objectFit) → html2canvas OK
  // • natImg null (cargando) → objectFit:cover gestionado por el browser → preview correcto
  //   El parche patchCoverImages en export.ts corrige el caso null en la exportación.
  const coverImgStyle = (extra?: React.CSSProperties): React.CSSProperties =>
    natImg
      ? { position: "absolute", width: imgW, height: imgH, left: imgLeft, top: imgTop,
          filter: "saturate(0.80) brightness(0.93)", ...extra }
      : { position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: `${px}% ${py}%`,
          filter: "saturate(0.80) brightness(0.93)", ...extra };

  // ── Card de texto ────────────────────────────────────────────────────────────
  const isGlass = cardStyle === "glass";
  const cardBackground = isGlass ? "rgba(255,255,255,0.08)" : "rgba(10,14,18,0.65)";
  const cardBackdrop   = isGlass ? "blur(24px) saturate(1.8)" : "blur(12px)";
  const cardBorder     = isGlass ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.05)";
  const cardBoxShadow  = isGlass
    ? "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)"
    : "0 8px 32px rgba(0,0,0,0.3)";
  const cardExportGlass = isGlass ? "glass" : "solid";

  // Spacing entre elementos del card (sin usar gap para compatibilidad export).
  const innerGap = t.card.direction === "column" ? 16 : 12;

  return (
    // Sin borderRadius — el redondeo visual lo aplica CanvasPreview sobre su wrapper.
    // En exportación el canvas se captura SIN esquinas redondeadas (correcto para RRSS).
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: BG }}>

      {/* ── Fondo ── */}
      {isLoading ? (
        <>
          <div style={{ position: "absolute", inset: 0, background: BG }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.03)", animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }} />
        </>
      ) : imageUrl ? (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden
            onLoad={handleImgNaturalSize}
            style={coverImgStyle()}
          />
        </div>
      ) : (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/default-bg.jpg"
            alt=""
            aria-hidden
            onLoad={handleImgNaturalSize}
            style={coverImgStyle({ opacity: 0.6 })}
          />
        </div>
      )}

      {/* Tinte frío cinematográfico */}
      {!isLoading && <div style={{ position: "absolute", inset: 0, background: "rgba(20,50,140,0.06)" }} />}

      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: t.gradient }} />

      {/* ── Header ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        paddingTop:   t.header.paddingTop,
        paddingLeft:  t.header.paddingX,
        paddingRight: t.header.paddingX,
        display: "flex",
        alignItems: "center",
        justifyContent: headerCentered ? "center" : "space-between",
        flexDirection: headerReversed ? "row-reverse" : "row",
      }}>
        <ActinverLogo
          width={t.logo.width}
          height={t.logo.height}
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.55))" }}
        />

        {/* Badge — solo se muestra cuando el logo NO está centrado */}
        {showBadge && !headerCentered && (
          <div
            data-export-glass="badge"
            style={{
              display: "inline-block",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.15)",
              paddingLeft:  t.badge.px,
              paddingRight: t.badge.px,
              paddingTop:   t.badge.py,
              paddingBottom: t.badge.py,
              background: "rgba(10,14,18,0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            <span style={{ fontFamily: "var(--font-open-sans)", fontSize: t.badge.fontSize, color: "rgba(255,255,255,0.75)" }}>
              El privilegio de ser
            </span>
            <span style={{ fontFamily: "var(--font-bad-script)", fontSize: t.badge.fontSize + 1, color: "#E5C78A", fontStyle: "italic", marginLeft: 4 }}>
              Fundador
            </span>
          </div>
        )}
      </div>

      {/* ── Área de contenido ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        paddingBottom: t.content.paddingBottom,
        paddingLeft:   t.content.paddingX,
        paddingRight:  t.content.paddingX,
        display: "flex",
        flexDirection: "column",
        gap: t.content.gap,
        textAlign: "left",
      }}>
        {/* Título */}
        <h1 style={{
          margin: 0,
          fontFamily: "var(--font-poppins)",
          fontWeight: 800,
          fontSize: t.title.fontSize,
          lineHeight: 1.1,
          letterSpacing: t.title.letterSpacing,
          color: "#ffffff",
          textShadow: "0 2px 24px rgba(0,0,0,0.5)",
          maxWidth: t.title.maxWidth,
        }}>
          {hasContent
            ? content.title
            : <span style={{ color: "rgba(255,255,255,0.15)" }}>Tu título aparecerá aquí</span>
          }
        </h1>

        {/* Highlight chip — fuera del card, entre título y card.                */}
        {/* Mismo concepto que el badge Fundador en el header: elemento flotante  */}
        {/* sobre la imagen, no apilado dentro del card (las capas semi-transparentes  */}
        {/* apiladas confunden a html2canvas). display:inline-block para que no   */}
        {/* estire el ancho completo; whiteSpace:nowrap para que no parta línea.  */}
        {hasContent && content.highlight && (
          <div style={{ textAlign: "left" }}>
            <span
              data-export-glass="badge"
              style={{
                display:        "inline-block",
                whiteSpace:     "nowrap",
                paddingLeft:    t.badge.px,
                paddingRight:   t.badge.px,
                paddingTop:     t.badge.py - 2,
                paddingBottom:  t.badge.py - 2,
                borderRadius:   9999,
                background:     "rgba(10,14,18,0.72)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border:         "1px solid rgba(230,199,138,0.40)",
                boxShadow:      "0 2px 12px rgba(0,0,0,0.2)",
                fontFamily:     "var(--font-poppins)",
                fontWeight:     700,
                fontSize:       t.badge.fontSize,
                color:          "#E5C78A",
                lineHeight:     1,
                letterSpacing:  "0.01em",
              }}
            >
              {content.highlight}
            </span>
          </div>
        )}

        {/* Card de texto */}
        <div
          data-export-glass={cardExportGlass}
          style={{
            padding:          t.card.padding,
            borderRadius:     t.card.borderRadius,
            border:           cardBorder,
            background:       cardBackground,
            backdropFilter:   cardBackdrop,
            WebkitBackdropFilter: cardBackdrop,
            boxShadow:        cardBoxShadow,
            display:          "flex",
            flexDirection:    t.card.direction,
            gap:              t.card.gap,
            alignItems:       t.card.direction === "row" ? "flex-start" : undefined,
            maxWidth:         t.card.maxWidth,
            textAlign:        "left",
          }}
        >
          {/* Columna de texto interior — sin gap, usa marginTop en cada hijo */}
          <div style={{ display: "block", flex: 1, minWidth: 0 }}>

            {/* Descripción */}
            {hasContent && content.description && (
              <p style={{
                margin:        0,
                marginBottom:  (hasContent && content.cta) ? innerGap : 0,
                fontFamily:    "var(--font-open-sans)",
                fontSize:      t.description.fontSize,
                lineHeight:    1.4,
                color:         "rgba(255,255,255,0.80)",
              }}>
                {content.description}
              </p>
            )}

            {/* Divisor (layout columna) */}
            {t.card.direction === "column" && hasContent && content.cta && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.10)", marginBottom: innerGap }} />
            )}

            {/* CTA */}
            {hasContent && content.cta && (
              <p style={{
                margin:      0,
                fontFamily:  "var(--font-open-sans)",
                fontSize:    t.cta.fontSize,
                color:       "#E5C78A",
                fontWeight:  600,
                lineHeight:  t.card.direction === "column" ? 1.5 : undefined,
              }}>
                {content.cta}{" "}
                <span style={{ opacity: 0.6 }}>{"\u2192"}</span>
              </p>
            )}

            {!hasContent && (
              <p style={{ margin: 0, fontFamily: "var(--font-open-sans)", fontSize: 13, color: "rgba(255,255,255,0.15)" }}>
                Genera el contenido con tu brief
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
