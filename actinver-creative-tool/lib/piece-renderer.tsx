// Renderizador server-side de piezas Actinver → PNG
//
// Replica EXACTAMENTE el layout de LayoutRenderer.tsx + tokens de layouts.ts
// usando next/og (satori) para render server-side sin browser.
//
// Escala: los tokens de layouts.ts están en dimensiones NATIVE (preview CSS).
// Multiplicamos por el factor de escala para obtener la resolución final.
//
// Limitaciones de satori vs LayoutRenderer:
//   - backdropFilter no soportado → fondo sólido semitransparente
//   - Sin CSS variables → fontFamily inline
//   - SVG logo vía data URI base64

import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { PieceContent, FormatKey, FORMATS, NATIVE } from "./templates";
import { DEFAULT_LAYOUT, LayoutTokens } from "./layouts";

// ─── Assets locales ────────────────────────────────────────────────────────────

function readAsset(relativePath: string): Buffer {
  return readFileSync(join(process.cwd(), "public", relativePath));
}

/** Convierte Buffer de Node.js → ArrayBuffer puro (requerido por satori/next/og) */
function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return new Uint8Array(buf).buffer as ArrayBuffer;
}

function toDataUri(buffer: Buffer, mime: string): string {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

// ─── Escala de tokens NATIVE → resolución final ────────────────────────────────

function scaleTokens(tokens: LayoutTokens, scale: number): LayoutTokens {
  return {
    logo: { width: tokens.logo.width * scale, height: tokens.logo.height * scale },
    badge: { px: tokens.badge.px * scale, py: tokens.badge.py * scale, fontSize: tokens.badge.fontSize * scale },
    header: { paddingTop: tokens.header.paddingTop * scale, paddingX: tokens.header.paddingX * scale },
    title: {
      fontSize: tokens.title.fontSize * scale,
      letterSpacing: `${parseFloat(tokens.title.letterSpacing) * scale}px`,
      maxWidth: tokens.title.maxWidth ? tokens.title.maxWidth * scale : undefined,
    },
    card: {
      padding: tokens.card.padding * scale,
      borderRadius: tokens.card.borderRadius * scale,
      gap: tokens.card.gap * scale,
      direction: tokens.card.direction,
      maxWidth: tokens.card.maxWidth ? tokens.card.maxWidth * scale : undefined,
    },
    description: { fontSize: tokens.description.fontSize * scale },
    cta: { fontSize: tokens.cta.fontSize * scale },
    content: {
      paddingBottom: tokens.content.paddingBottom * scale,
      paddingX: tokens.content.paddingX * scale,
      gap: tokens.content.gap * scale,
    },
    gradient: tokens.gradient,
  };
}

// ─── AJUSTES DE LAYOUT ────────────────────────────────────────────────────────
// Edita estos valores para modificar el diseño de las piezas generadas.
// Son independientes de la plataforma — no afectan el editor web.
//
// Los valores están en píxeles de la resolución NATIVA (preview CSS).
// Se escalan automáticamente × el factor de cada formato:
//   story:      × 2.84   (1080 / 380)
//   square:     × 2.00   (1080 / 540)
//   horizontal: × 2.00   (1920 / 960)
//   poster:     × 2.00   (1080 / 540)

// ─── Colores de marca ──────────────────────────────────────────────────────────
// IMPORTANTE: satori no soporta hex de 8 dígitos (#rrggbbaa).
// Todos los colores semitransparentes deben usar rgba().

const BG = "#0a0e12";

// Gradiente en rgba — equivalentes exactos de los tokens en layouts.ts:
//   #0a0e12   → rgba(10,14,18,1.00)
//   #0a0e12ee → rgba(10,14,18,0.93)
//   #0a0e1288 → rgba(10,14,18,0.53)
const GRADIENTS: Record<string, string> = {
  story:      "linear-gradient(to top, rgba(10,14,18,1) 0%, rgba(10,14,18,0.93) 20%, rgba(10,14,18,0.53) 45%, transparent 70%)",
  square:     "linear-gradient(to top, rgba(10,14,18,1) 0%, rgba(10,14,18,0.93) 20%, rgba(10,14,18,0.53) 45%, transparent 70%)",
  horizontal: "linear-gradient(to top, rgba(10,14,18,1) 0%, rgba(10,14,18,0.93) 20%, rgba(10,14,18,0.53) 45%, transparent 70%)",
  poster:     "linear-gradient(to top, rgba(10,14,18,1) 0%, rgba(10,14,18,0.93) 25%, rgba(10,14,18,0.53) 50%, transparent 72%)",
};

// ─── Componente JSX (compatible con satori) ────────────────────────────────────

function PieceLayout({
  content,
  backgroundImageUrl,
  logoSvgUri,
  t,
  W,
  H,
}: {
  content:            PieceContent;
  backgroundImageUrl: string;
  logoSvgUri:         string;
  t:                  LayoutTokens;
  W:                  number;
  H:                  number;
}) {
  const hasContent = content.title.trim().length > 0;
  // letterSpacing viene como "-1.5px" — satori acepta strings con unidad
  // pero para mayor compatibilidad lo convertimos a número (px)
  const letterSpacingNum = parseFloat(t.title.letterSpacing) || 0;

  return (
    <div
      style={{
        position:        "relative",
        width:           W,
        height:          H,
        overflow:        "hidden",
        backgroundColor: BG,
        display:         "flex",
        fontFamily:      "Poppins",
      }}
    >
      {/* Fondo fotográfico — <img> con cover simulado manualmente.
          satori no soporta backgroundSize:cover con data URIs grandes.
          Las fotos de Pexels vienen en orientation=square, así que
          el lado mayor = max(W,H) garantiza que cubran el canvas completo.
          overflow:hidden en el padre recorta el excedente. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backgroundImageUrl}
        alt=""
        style={{
          position: "absolute",
          width:    Math.max(W, H),
          height:   Math.max(W, H),
          top:      -Math.round((Math.max(W, H) - H) / 2),
          left:     -Math.round((Math.max(W, H) - W) / 2),
        }}
      />

      {/* Darkness overlay — simula brightness(0.93): oscurece ~7% */}
      <div
        style={{
          position:        "absolute",
          top:             0, left: 0, width: W, height: H,
          backgroundColor: "rgba(0,0,0,0.07)",
          display:         "flex",
        }}
      />

      {/* Cool tint overlay cinematográfico — simula saturate(0.80): enfría y desatura */}
      <div
        style={{
          position:        "absolute",
          top:             0, left: 0, width: W, height: H,
          backgroundColor: "rgba(20,50,140,0.10)",
          display:         "flex",
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position:   "absolute",
          top:        0, left: 0, right: 0, bottom: 0,
          background: t.gradient,
          display:    "flex",
        }}
      />

      {/* Header — Logo + Badge */}
      <div
        style={{
          position:       "absolute",
          top:            0, left: 0, right: 0,
          paddingTop:     t.header.paddingTop,
          paddingLeft:    t.header.paddingX,
          paddingRight:   t.header.paddingX,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo SVG como data URI */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSvgUri}
          alt="Actinver"
          width={t.logo.width}
          height={t.logo.height}
          style={{ width: t.logo.width, height: t.logo.height }}
        />

        {/* Badge quitado en rama airtable-integration — en la plataforma el usuario lo controla */}
      </div>

      {/* Content area — anclada al fondo */}
      <div
        style={{
          position:      "absolute",
          bottom:        0, left: 0, right: 0,
          paddingBottom: t.content.paddingBottom,
          paddingLeft:   t.content.paddingX,
          paddingRight:  t.content.paddingX,
          display:       "flex",
          flexDirection: "column",
          gap:           t.content.gap,
        }}
      >
        {/* Título hero */}
        {hasContent && (
          <div
            style={{
              fontFamily:    "Poppins",
              fontWeight:    800,
              fontSize:      t.title.fontSize,
              lineHeight:    1.1,
              letterSpacing: letterSpacingNum,
              color:         "#ffffff",
              ...(t.title.maxWidth ? { maxWidth: t.title.maxWidth } : {}),
            }}
          >
            {content.title}
          </div>
        )}

        {/* Glass card — border separado en longhand */}
        {hasContent && (content.description || content.cta) && (
          <div
            style={{
              padding:         t.card.padding,
              borderRadius:    t.card.borderRadius,
              borderWidth:     1,
              borderStyle:     "solid",
              borderColor:     "rgba(255,255,255,0.05)",
              backgroundColor: "rgba(10,14,18,0.70)",
              display:         "flex",
              flexDirection:   t.card.direction,
              gap:             t.card.gap,
              ...(t.card.direction === "row" ? { alignItems: "flex-start" } : {}),
              ...(t.card.maxWidth ? { maxWidth: t.card.maxWidth } : {}),
            }}
          >
            <div
              style={{
                display:       "flex",
                flexDirection: "column",
                gap:           t.card.direction === "column" ? t.card.gap * 0.6 : t.card.gap * 0.5,
                flex:          1,
              }}
            >
              {content.description && (
                <span
                  style={{
                    fontFamily: "Poppins",
                    fontSize:   t.description.fontSize,
                    lineHeight: 1.4,
                    color:      "rgba(255,255,255,0.80)",
                  }}
                >
                  {content.description}
                </span>
              )}

              {/* Divider (solo layout column) */}
              {t.card.direction === "column" && content.description && content.cta && (
                <div
                  style={{
                    height:          1,
                    backgroundColor: "rgba(255,255,255,0.10)",
                    display:         "flex",
                  }}
                />
              )}

              {content.cta && (
                <span
                  style={{
                    fontFamily:  "Poppins",
                    fontSize:    t.cta.fontSize,
                    color:       "#E5C78A",
                    fontWeight:  600,
                    lineHeight:  t.card.direction === "column" ? 1.5 : 1,
                  }}
                >
                  {content.cta} →
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Función principal ─────────────────────────────────────────────────────────

export async function renderPiece(
  content:            PieceContent,
  backgroundImageUrl: string,
  format:             FormatKey = "square",
): Promise<ArrayBuffer> {
  const fmt    = FORMATS[format];
  const native = NATIVE[format];
  const scale  = fmt.width / native.w;

  // Tokens escalados a resolución final.
  // Sobreescribimos gradient con rgba() porque satori no soporta hex 8-dígitos.
  const baseTokens = DEFAULT_LAYOUT.tokens[format];
  const t          = { ...scaleTokens(baseTokens, scale), gradient: GRADIENTS[format] };

  // Assets — fuentes TTF + logo SVG
  const poppinsRegular = readAsset("fonts/Poppins-Regular.ttf");
  const poppinsBold    = readAsset("fonts/Poppins-Bold.ttf");
  const logoBuffer     = readAsset("actinver-logo.svg");
  const logoSvgUri     = toDataUri(logoBuffer, "image/svg+xml");

  const response = new ImageResponse(
    <PieceLayout
      content={content}
      backgroundImageUrl={backgroundImageUrl}
      logoSvgUri={logoSvgUri}
      t={t}
      W={fmt.width}
      H={fmt.height}
    />,
    {
      width:  fmt.width,
      height: fmt.height,
      fonts: [
        { name: "Poppins", data: toArrayBuffer(poppinsRegular), weight: 400, style: "normal" },
        { name: "Poppins", data: toArrayBuffer(poppinsBold),    weight: 800, style: "normal" },
      ],
    },
  );

  return response.arrayBuffer();
}

// ─── Render múltiples formatos ─────────────────────────────────────────────────

export async function renderAllFormats(
  content:            PieceContent,
  backgroundImageUrl: string,
  formats:            FormatKey[] = ["story", "square", "horizontal"],
): Promise<Record<FormatKey, ArrayBuffer>> {
  const entries = await Promise.all(
    formats.map(async (fmt) => [fmt, await renderPiece(content, backgroundImageUrl, fmt)] as [FormatKey, ArrayBuffer]),
  );
  return Object.fromEntries(entries) as Record<FormatKey, ArrayBuffer>;
}
