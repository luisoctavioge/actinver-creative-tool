"use client";

// Renderer genérico de layouts — lee todos los valores de un LayoutConfig
// en lugar de hardcodearlos. Mismo DOM e inline styles que los canvas originales
// (requerido para html2canvas).

import { FormatKey, NATIVE, PieceContent, LogoAlign } from "@/lib/templates";
import { LayoutTokens } from "@/lib/layouts";

const BG = "#0a0e12";

interface LayoutRendererProps {
  format: FormatKey;
  tokens: LayoutTokens;
  content: PieceContent;
  imageUrl: string | null;
  isLoading: boolean;
  showBadge?: boolean;
  logoAlign?: LogoAlign;
  forExport?: boolean;
}

export default function LayoutRenderer({ format, tokens, content, imageUrl, isLoading, showBadge = true, logoAlign = "left", forExport = false }: LayoutRendererProps) {
  const { w, h } = NATIVE[format];
  const hasContent = content.title.trim().length > 0;
  const t = tokens;
  // Cuando el logo está a la derecha, el badge se mueve a la izquierda y viceversa
  const headerReversed = logoAlign === "right";

  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", borderRadius: forExport ? 0 : 20, background: BG }}>
      {/* Background */}
      {isLoading ? (
        <>
          <div style={{ position: "absolute", inset: 0, background: BG }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.03)", animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }} />
        </>
      ) : imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: "saturate(0.80) brightness(0.93)" }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/default-bg.jpg" alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.6, filter: "saturate(0.80) brightness(0.93)" }} />
      )}

      {/* Cool tint overlay — aporta el tono ligeramente frío cinematográfico, compatible con html2canvas */}
      {!isLoading && <div style={{ position: "absolute", inset: 0, background: "rgba(20, 50, 140, 0.06)" }} />}

      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: t.gradient }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        paddingTop: t.header.paddingTop,
        paddingLeft: t.header.paddingX,
        paddingRight: t.header.paddingX,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexDirection: headerReversed ? "row-reverse" : "row",
      }}>
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/actinver-logo.svg"
          alt="Actinver"
          data-export-logo="true"
          width={t.logo.width}
          height={t.logo.height}
          style={{
            width: t.logo.width,
            height: t.logo.height,
            objectFit: "contain",
            filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.80)) drop-shadow(0 2px 12px rgba(0,0,0,0.50))",
          }}
        />

        {/* Badge */}
        {showBadge && <div
          data-export-glass="0.55"
          style={{
            display: "flex", alignItems: "center", gap: 4,
            borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.15)",
            paddingLeft: t.badge.px, paddingRight: t.badge.px,
            paddingTop: t.badge.py, paddingBottom: t.badge.py,
            background: "rgba(10,14,18,0.55)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            lineHeight: 1,
          }}
        >
          <span style={{ fontFamily: "var(--font-open-sans)", fontSize: t.badge.fontSize, color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>
            El privilegio de ser
          </span>
          <span style={{ fontFamily: "var(--font-bad-script)", fontSize: t.badge.fontSize + 1, color: "#E5C78A", fontStyle: "italic", whiteSpace: "nowrap" }}>
            Fundador
          </span>
        </div>}
      </div>

      {/* Content area */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        paddingBottom: t.content.paddingBottom,
        paddingLeft: t.content.paddingX,
        paddingRight: t.content.paddingX,
        display: "flex", flexDirection: "column", gap: t.content.gap,
      }}>
        {/* Title */}
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
          {hasContent ? content.title : <span style={{ color: "rgba(255,255,255,0.15)" }}>Tu título aparecerá aquí</span>}
        </h1>

        {/* Glass card */}
        <div
          data-export-glass="0.55"
          style={{
            padding: t.card.padding,
            borderRadius: t.card.borderRadius,
            border: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(10,14,18,0.65)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: t.card.direction,
            gap: t.card.gap,
            alignItems: t.card.direction === "row" ? "flex-start" : undefined,
            maxWidth: t.card.maxWidth,
          }}
        >
          {/* Text content */}
          <div style={{ display: "flex", flexDirection: "column", gap: t.card.direction === "column" ? 16 : 12, flex: 1, minWidth: 0 }}>
            {hasContent && content.description && (
              <p style={{
                margin: 0,
                fontFamily: "var(--font-open-sans)",
                fontSize: t.description.fontSize,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.80)",
              }}>
                {content.description}
              </p>
            )}

            {/* Divider (column layout only) */}
            {t.card.direction === "column" && hasContent && content.cta && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.10)" }} />
            )}

            {hasContent && content.cta && (
              <p style={{
                margin: 0,
                fontFamily: "var(--font-open-sans)",
                fontSize: t.cta.fontSize,
                color: "#E5C78A",
                fontWeight: 600,
                lineHeight: t.card.direction === "column" ? 1.5 : undefined,
              }}>
                {content.cta} <span style={{ opacity: 0.6 }}>{"\u2192"}</span>
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
