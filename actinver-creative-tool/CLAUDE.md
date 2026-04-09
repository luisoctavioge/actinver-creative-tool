# Actinver Creative Tool — CLAUDE.md

Fuente de verdad del proyecto. Leer antes de tocar cualquier línea de código.

## Stack
- Next.js 14 (App Router, `"use client"` donde se necesite)
- Tailwind CSS con tokens de marca extendidos
- TypeScript estricto
- Fabric.js (Fase 2 — canvas rendering con capas)
- Google Generative AI SDK / Gemini Imagen 3 (Fase 2)
- JSZip + html2canvas (Fase 2 — export)

## Restricciones absolutas
- Sin librerías de UI externas (no shadcn, no MUI, no Radix)
- CSS solo con Tailwind utilities — sin `style` inline salvo `aspectRatio`, `fontSize` responsivo con clamp(), o valores dinámicos imposibles de expresar con utilidades
- Todo en TypeScript
- `npm run dev` debe correr sin errores en todo momento

## Tokens visuales extraídos del brandbook

### Paleta de color (brandbook pp. 46-50)
| Token Tailwind          | HEX       | Nombre oficial       | Uso principal                          |
|-------------------------|-----------|----------------------|----------------------------------------|
| `azul-grandeza`         | `#0A0E12` | Azul Grandeza        | Fondos primarios, Rich Black           |
| `azul-acompanamiento`   | `#1A2433` | Azul Acompañamiento  | Fondos secundarios, Gunmetal, gradient |
| `azul-actinver`         | `#314566` | Azul Actinver        | Formas complementarias, shapes         |
| `arena`                 | `#F5F2EB` | Arena / Sand         | Fondos claros alternos                 |
| `sunset`                | `#E6C78A` | Sunset / Gold        | Acento, CTA, punto diacrítico logo     |
| `blanco`                | `#FFFFFF` | Blanco               | Texto sobre fondos oscuros             |

**Regla 90/10:** 90% colores primarios + 10% complementario (sunset o azul-actinver).

### Gradiente oficial (brandbook p.49)
- Composición: **40% Azul Grandeza → 60% Azul Acompañamiento**
- Ángulos permitidos: 90°, 45°, 0°, -90° (solo rotación, no mezclar colores)
- Clases disponibles: `bg-brand-gradient-90`, `bg-brand-gradient-180`, `bg-brand-gradient-45`
- **PROHIBIDO:** crear gradientes con otros colores de la paleta

### Tipografía (brandbook pp. 41-44)
| Rol                   | Familia      | Pesos           | Variable CSS        |
|-----------------------|--------------|-----------------|---------------------|
| Primaria              | Poppins      | 300/400/700/800 | `--font-poppins`    |
| Secundaria (web)      | Open Sans    | 300/400/700/800 | `--font-open-sans`  |

**Escala tipográfica — Regla de 4 (múltiplos de 4):**
| Rol              | Peso       | Case      | Tailwind class | px  |
|------------------|------------|-----------|----------------|-----|
| Hero / H1        | Bold       | UPPERCASE | `text-hero`    | 64  |
| Subtítulo / H2   | Bold       | Mixed     | `text-h2`      | 32  |
| Cuerpo / H3      | Regular    | Mixed     | `text-body`    | 16  |
| Legal / H4       | Regular    | Mixed     | `text-legal`   | 12  |

### Logotipo (brandbook pp. 33-39)
- Wordmark "Actinver": font Poppins Light, tracking ajustado
- Punto diacrítico sobre la "i": siempre `#E6C78A` (sunset), nunca modificar
- Versión clara: texto blanco `#FFFFFF` sobre fondos oscuros
- Versión oscura: texto negro `#0A0E12` sobre Arena `#F5F2EB`
- Tamaño mínimo digital: 100px
- No delinear, no rotar, no cambiar colores

### Fotografía / estilo visual (brandbook p.56)
- Lifestyle dinámico, momentos auténticos
- Personas como protagonistas (empresarios, emprendedores)
- Paisajes arquitectónicos o naturales como complemento
- Paleta visual: tonos oscuros cinematográficos, azul marino dominante

### Iconografía (brandbook p.53)
- Estilo: trazo delgado y uniforme (stroke, no fill)
- Íconos relevantes: tendencia alcista, objetivo, portafolio, mundo, cheque

## Anatomía de la pieza (del ejemplo provisto)
```
┌─────────────────────────────┐
│ [Logo Actinver]  [Badge pill]│  ← Header
│                              │
│     [Fondo: foto/gradiente] │  ← Imagen generada (Fase 2)
│                              │
│ Título hero bold             │  ← Poppins Bold, blanco
│ en 2-3 líneas                │
│ ┌──────────────────────────┐ │
│ │[Icon]                    │ │  ← Card semitransparente
│ │ Descripción del producto │ │
│ │ CTA en sunset gold ↗     │ │
│ └──────────────────────────┘ │
└─────────────────────────────┘
```

## Límites de caracteres (definidos en brief)
- Título: 50 chars
- Descripción: 180 chars
- CTA: 40 chars

## Formatos de salida
| Key          | Proporción | Resolución  | Uso              |
|--------------|------------|-------------|------------------|
| `story`      | 9:16       | 1080×1920px | Stories/Reels    |
| `square`     | 1:1        | 1080×1080px | Feed cuadrado    |
| `horizontal` | 16:9       | 1920×1080px | Post horizontal  |

## Estructura de archivos clave
```
app/
  layout.tsx      — Fonts (Poppins + Open Sans), metadata
  page.tsx        — Layout dos paneles + estado global
  globals.css     — Variables CSS, reset base, scrollbar
components/
  Toolbar/FormatToolbar.tsx  — Selector de 3 formatos con íconos
  Editor/EditorPanel.tsx     — 3 campos con contador de chars
  Canvas/CanvasPreview.tsx   — Preview responsive de la pieza
lib/
  templates.ts    — Tipos, constantes de formato y límites
  gemini.ts       — Stub para integración Gemini (Fase 2)
```

## Roadmap de fases

**Fase activa: 2**
**Último cambio: 2026-03-31**

### ✅ Fase 1 — Scaffolding y estructura base (COMPLETADA)
- ✅ Next.js 14 inicializado con TypeScript y Tailwind (App Router)
- ✅ Estructura de carpetas `app/`, `components/`, `lib/`, `public/generated/`
- ✅ `tailwind.config.ts` extendido con paleta de marca, fuentes, escala tipográfica y gradientes
- ✅ `app/layout.tsx` — Poppins + Open Sans via `next/font/google`, lang="es"
- ✅ `app/globals.css` — variables CSS de marca, reset, scrollbar personalizado
- ✅ `components/Toolbar/FormatToolbar.tsx` — 3 botones (Story/Cuadrado/Horizontal) con íconos proporcionales
- ✅ `components/Editor/EditorPanel.tsx` — campos Título/Descripción/CTA con contador de chars y límites de color
- ✅ `components/Canvas/CanvasPreview.tsx` — preview reactivo en 3 proporciones con gradiente de marca
- ✅ `lib/templates.ts` — tipos `FormatKey`, `PieceContent`, `FORMATS`, `CHAR_LIMITS`
- ✅ `lib/gemini.ts` — stub tipado para integración futura
- ✅ `CLAUDE.md` — fuente de verdad con tokens, restricciones y roadmap
- ✅ `.env.local` — template con `GEMINI_API_KEY` vacía
- ✅ `npm run build` pasa sin errores ni warnings
- ✅ `npm run dev` corre sin errores

### Fase 2 — Generación de imagen con IA y exportación
- ✅ Route handler `app/api/generate-image/route.ts` con Google Generative AI SDK
- ✅ Integrar Gemini con prompt basado en tono de marca (`gemini-2.0-flash-preview-image-generation`)
- ✅ Mostrar imagen generada como fondo en `CanvasPreview`
- ✅ Estado de carga / error en el editor (loading skeleton, error box, hint texts)
- [ ] Exportación: html2canvas → canvas → blob por formato
- [ ] JSZip empaqueta los 3 formatos y dispara descarga
- [ ] Botón "Descargar" funcional en la toolbar

### Feature branch: airtable-integration — Integración Airtable → IA → Email
**Branch:** `feature/airtable-integration`

**Flujo completo:**
```
Airtable Form → nuevo Record → Airtable Automation (HTTP Request)
  → POST /api/airtable-webhook
      ├── generatePieceContent()   — Groq/Llama genera título, descripción, CTA
      ├── generateImageFromPexels() — imagen de fondo contextual
      ├── renderPiece()            — next/og → PNG server-side (sin browser)
      └── uploadAttachment()       — Airtable Content API → adjunto en el record
  → Airtable Automation (Send email) — incluye el adjunto generado
```

**Archivos nuevos:**
- `lib/airtable-client.ts` — REST + Content API (getRecord, updateRecord, uploadAttachment)
- `lib/piece-renderer.tsx` — ImageResponse (next/og/satori) → PNG buffer server-side
- `app/api/airtable-webhook/route.ts` — POST handler + GET health-check

**Variables de entorno requeridas (agregar en Vercel y .env.local):**
| Variable                  | Descripción                                    |
|---------------------------|------------------------------------------------|
| `AIRTABLE_API_KEY`        | Personal Access Token (scopes: read + write)   |
| `AIRTABLE_BASE_ID`        | ID del base ("app...")                         |
| `AIRTABLE_TABLE_ID`       | ID o nombre de la tabla del form               |
| `AIRTABLE_IMAGE_FIELD_ID` | Field ID del adjunto ("fld...")                |
| `AIRTABLE_WEBHOOK_SECRET` | Secreto para el header `x-webhook-secret`      |

**Configuración de la Automation en Airtable:**
1. Trigger: "When a record is created" (en la tabla del form)
2. Action: "Run a script" o "Send a webhook" → POST a `https://tu-dominio/api/airtable-webhook`
   - Header: `x-webhook-secret: {AIRTABLE_WEBHOOK_SECRET}`
   - Body (JSON): `{ "id": "{{record_id}}", "fields": { "Producto": "{{Producto}}", ... } }`
3. Segunda Automation (opcional): "When Estado = Listo ✓" → "Send email" con el adjunto

**Campos esperados en el form de Airtable:**
| Campo        | Tipo          | Requerido | Opciones                              |
|--------------|---------------|-----------|---------------------------------------|
| `Producto`   | Text          | Sí        | —                                     |
| `Mensaje`    | Long text     | No        | —                                     |
| `Genero`     | Single select | No        | Hombre / Mujer / Ambos                |
| `EdadRango`  | Single select | No        | 25-35 / 36-50 / 51-65                 |
| `TipoPieza`  | Single select | No        | Educativa / Promo / Institucional     |
| `Formatos`   | Multi-select  | No        | story / square / horizontal / poster  |

**Campos que escribe el webhook de vuelta:**
| Campo               | Tipo          | Descripción                |
|---------------------|---------------|----------------------------|
| `Estado`            | Single select | Generando... / Listo ✓ / Error |
| `TituloGenerado`    | Text          | Título generado por IA     |
| `DescripcionGenerada` | Long text   | Descripción generada       |
| `CTAGenerado`       | Text          | CTA generado               |
| `ImagenGenerada`    | Attachment    | PNG(s) de la pieza         |
| `FechaGeneracion`   | Date          | ISO 8601                   |

### Fase 3 — Capas y variaciones avanzadas
- [ ] Fabric.js para edición de capas sobre el canvas
- [ ] Variaciones Actinver Trade (logo alternativo)
- [ ] Sistema de plantillas con múltiples layouts

## Tono de marca (para prompts de Gemini en Fase 2)
- Seguro, aspiracional, empoderador
- Lifestyle ejecutivo mexicano
- Luz cinematográfica, azul marino dominante
- No usar rojo, verde o amarillo brillante
- No fondos blancos ni muy claros para piezas dark
