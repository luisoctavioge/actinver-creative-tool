"use client";

// Layout "Editorial" — inspirado en los posteos reales de Actinver
// ("Favoritas Globales", "Smart Picks").
//
// Estructura:
//   ┌────────────────────────────┐
//   │              [Categoría]   │  ← label gold italic, top-right
//   │                            │
//   │    [IMAGEN — ~55% alto]    │  ← producto/tema directo
//   │                            │
//   │ ── gradiente suave ─────── │
//   │                            │
//   │ TÍTULO GRANDE              │  ← Poppins ExtraBold
//   │ (ACENTO EN GOLD)           │  ← subtítulo/ticker
//   │                            │
//   │ Párrafo descriptivo sin    │  ← Open Sans Regular, white/80
//   │ tarjeta glass, limpio.     │
//   │                            │
//   │              [Logo]        │  ← Actinver, bottom-right
//   └────────────────────────────┘

import { FormatKey, NATIVE, PieceContent, LogoAlign } from "@/lib/templates";
import { EDITORIAL_TOKENS, type EditorialTokens } from "@/lib/layouts";
import ActinverLogo from "./ActinverLogo";

const BG = "#0a0e12";

interface EditorialRendererProps {
  format: FormatKey;
  content: PieceContent;
  imageUrl: string | null;
  isLoading: boolean;
  categoryLabel?: string;
  logoAlign?: LogoAlign;
  forExport?: boolean;
}

export default function EditorialRenderer({
  format,
  content,
  imageUrl,
  isLoading,
  categoryLabel = "",
  logoAlign = "right",
  forExport = false,
}: EditorialRendererProps) {
  const { w, h } = NATIVE[format];
  const t: EditorialTokens = EDITORIAL_TOKENS[format];
  const hasContent = content.title.trim().length > 0;

  // Altura de la zona de imagen
  const imageH = Math.round(h * t.imageHeightPercent);
  // Altura de la zona de texto
  const textH = h - imageH;

  // Separar el título en dos líneas si contiene paréntesis (ej: "NVIDIA (NVDA)")
  // O usar title como línea principal y CTA como acento gold
  const parenMatch = content.title.match(/^(.+?)\s*(\(.+?\))$/);
  const mainTitle = parenMatch ? parenMatch[1].trim() : content.title;
  const accentText = parenMatch ? parenMatch[2].trim() : "";

  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        overflow: "hidden",
        borderRadius: forExport ? 0 : 20,
        background: BG,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Zona de imagen (parte superior) ─────────────────────────── */}
      <div style={{ position: "relative", width: w, height: imageH, flexShrink: 0 }}>
        {isLoading ? (
          <>
            <div style={{ position: "absolute", inset: 0, background: BG }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.03)",
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />
          </>
        ) : imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              filter: "saturate(0.85) brightness(0.90)",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, ${BG}, #1A2433)`,
            }}
          />
        )}

        {/* Gradiente de transición — funde la imagen hacia la zona de texto */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: `linear-gradient(to top, ${BG} 0%, ${BG}dd 30%, transparent 100%)`,
          }}
        />

        {/* Tint cinematográfico sutil */}
        {!isLoading && imageUrl && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(20, 50, 140, 0.06)" }} />
        )}

        {/* Label de categoría — esquina superior derecha */}
        {categoryLabel && (
          <div
            style={{
              position: "absolute",
              top: t.categoryLabel.paddingTop,
              right: t.categoryLabel.paddingRight,
              fontFamily: "var(--font-open-sans)",
              fontSize: t.categoryLabel.fontSize,
              color: "#E5C78A",
              fontStyle: "italic",
              letterSpacing: "0.06em",
              textShadow: "0 1px 6px rgba(0,0,0,0.6)",
            }}
          >
            {categoryLabel}
          </div>
        )}
      </div>

      {/* ── Zona de texto (parte inferior) ──────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingLeft: t.padding.x,
          paddingRight: t.padding.x,
          paddingBottom: t.padding.bottom,
          gap: t.gap,
          // El título se superpone ligeramente sobre la zona de imagen
          marginTop: -Math.round(textH * 0.08),
        }}
      >
        {/* Título */}
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-poppins)",
              fontWeight: 800,
              fontSize: t.title.fontSize,
              lineHeight: t.title.lineHeight,
              letterSpacing: t.title.letterSpacing,
              color: "#ffffff",
              textTransform: "uppercase",
            }}
          >
            {hasContent ? mainTitle : (
              <span style={{ color: "rgba(255,255,255,0.15)" }}>Tu título aquí</span>
            )}
          </h1>

          {/* Acento en gold (ticker, subtítulo) */}
          {hasContent && accentText && (
            <span
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 700,
                fontSize: t.accentTitle.fontSize,
                color: "#E5C78A",
                letterSpacing: "0.02em",
                display: "inline-block",
                marginTop: 2,
              }}
            >
              {accentText}
            </span>
          )}
        </div>

        {/* Descripción — texto corrido sin glass card */}
        {hasContent && content.description && (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-open-sans)",
              fontSize: t.body.fontSize,
              lineHeight: t.body.lineHeight,
              color: "rgba(255,255,255,0.80)",
              textAlign: "justify",
            }}
          >
            {content.description}
          </p>
        )}

        {!hasContent && (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-open-sans)",
              fontSize: t.body.fontSize,
              color: "rgba(255,255,255,0.15)",
            }}
          >
            Genera el contenido con tu brief
          </p>
        )}

        {/* Spacer para empujar el logo hacia abajo */}
        <div style={{ flex: 1 }} />

        {/* Logo en la zona inferior */}
        <div
          style={{
            display: "flex",
            justifyContent: logoAlign === "right" ? "flex-end" : "flex-start",
          }}
        >
          <div data-export-logo>
            <ActinverLogo
              width={t.logo.width}
              height={t.logo.height}
              style={forExport ? undefined : {
                filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.60))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
