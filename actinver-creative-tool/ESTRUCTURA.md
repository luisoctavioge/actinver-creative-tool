# Actinver Creative Tool — Estructura del proyecto

## Qué es

Herramienta interna para generar piezas de comunicación (social media, editorial) con identidad Actinver. El usuario llena un brief, la app genera texto con IA (Gemini), genera imagen (fal.ai Flux Pro 1.1 Ultra), y exporta la pieza como PNG lista para publicar. Las solicitudes se registran en Airtable vía webhook.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Estilos | Tailwind CSS |
| Texto IA | Google Gemini |
| Imagen IA | fal.ai — Flux Pro 1.1 Ultra |
| Datos | Airtable (webhook + cliente REST) |
| Export | html2canvas → PNG |
| Deploy | Vercel |

---

## Estructura de carpetas

```
actinver-creative-tool/
├── app/
│   ├── page.tsx                  # UI principal / flujo completo
│   ├── layout.tsx
│   └── api/
│       ├── generate-content/     # Genera copy con Gemini
│       ├── generate-image/       # Genera imagen con fal.ai
│       ├── generate-variants/    # Variantes de copy
│       ├── generate-captions/    # Pies de foto / captions
│       ├── regenerate-field/     # Regenera un campo específico
│       ├── fichas/               # Listado de productos (fichas)
│       └── airtable-webhook/     # Envía solicitud a Airtable
│
├── components/
│   ├── Canvas/                   # Vista previa de la pieza
│   │   ├── CanvasPreview.tsx
│   │   ├── LayoutRenderer.tsx
│   │   └── ActinverLogo.tsx      # SVG inlineado (necesario para html2canvas)
│   ├── Editor/
│   │   └── EditorPanel.tsx       # Panel de edición de campos
│   ├── CaptionPanel/             # Panel de captions
│   ├── Toolbar/
│   │   └── FormatToolbar.tsx
│   └── SplashScreen.tsx          # Pantalla de carga inicial
│
├── lib/
│   ├── brand/
│   │   ├── actinver.ts           # Tokens de marca (colores, tipografía)
│   │   ├── brand-config.ts
│   │   └── narrativa.ts          # Tono de voz y narrativa de marca
│   ├── fichas/
│   │   └── index.ts              # Fichas de productos financieros
│   ├── gemini.ts                 # Cliente Gemini + prompts
│   ├── image-generator.ts        # Cliente fal.ai
│   ├── airtable-client.ts        # Cliente Airtable REST
│   ├── content-generator.ts      # Orquesta generación de contenido
│   ├── templates.ts              # Plantillas de piezas
│   ├── layouts.ts                # Configuración de layouts
│   ├── export.ts                 # Lógica de exportación PNG
│   └── piece-renderer.tsx        # Renderizador de pieza
│
└── public/                       # Assets estáticos
```

---

## Ramas

### Árbol de commits

```
main  (2 commits — base estable)
  │
  └── feature/airtable-integration  (+9 commits sobre main)
        │
        └── feature/v2-flow  (+2 commits sobre airtable-integration)
```

---

### `main`

Estado: **base / producción inicial**

Contiene la Fase 2 del proyecto: la herramienta funciona end-to-end pero sin integración con Airtable y con la UI original de `page.tsx` como único componente grande.

Commits:
- `b00104c` Initial commit
- `73158ce` feat: Actinver Creative Tool — Fase 2

---

### `feature/airtable-integration`

Estado: **integración backend + mejoras de calidad**

Rama activa de desarrollo. Se bifurca de `main` y agrega:

1. **Airtable** — webhook (`/api/airtable-webhook`) y cliente REST (`lib/airtable-client.ts`) para registrar cada solicitud con datos del brief, producto y email del solicitante.
2. **Imagen IA mejorada** — migración a Flux Pro 1.1 Ultra vía fal.ai con mejor calidad de CTAs.
3. **Prompt contextual** — el prompt de imagen usa la ficha del producto + mensaje de campaña + brandbook para resultados más alineados a la marca.
4. **Splash screen** — pantalla de entrada con logo y gradiente de marca.
5. **Fixes de logo y export** — logo SVG inlineado para que html2canvas lo capture correctamente; correcciones de alineación.

Commits únicos (9):
```
90aa88a  feat: Airtable integration — webhook y cliente
f4f5453  fix: trim webhook secret
dadce16  feat: upgrade fal.ai a Flux Pro 1.1 Ultra
1daa412  feat: campo Email en webhook
b05ca34  fix: fal.ai Flux Pro 1.1 Ultra + Vercel fs fix
69905c6  feat: logo alignment + export fixes
847ed5c  fix: remove yellow dot from header logo
9a035ad  feat: splash screen
65a9f0b  fix: inline ActinverLogo SVG para html2canvas
20590ec  feat: prompt contextual para imagen AI
```

---

### `feature/v2-flow`

Estado: **refactor de UX + nuevo layout editorial**

Se bifurca de `feature/airtable-integration` (hereda todo lo anterior) y agrega una reescritura mayor del flujo y la UI:

1. **Layout Editorial** — nuevo renderer (`EditorialRenderer.tsx`) para piezas con estética de revista/editorial, diferente al layout estándar de redes.
2. **Selector de modo de imagen AI** — el usuario puede elegir entre imagen generada por IA o imagen de referencia subida manualmente.
3. **Refactor de `page.tsx`** — el componente monolítico se descompone en subcomponentes dedicados: `Header`, `PanelStrip`, `StatusBar`, `BrandbookOverlay`, `WelcomeScreen`, `BriefConfirm`, `CustomFichaModal`.
4. **Hook `useCreativeState`** — extrae todo el estado de la herramienta a un hook propio (`hooks/useCreativeState.ts`), dejando la página limpia.
5. **Sistema de tipos de canal** — `lib/types/channels.ts` define los formatos soportados (Instagram feed, stories, LinkedIn, etc.).
6. **Referencias visuales** — `lib/references.ts` para gestionar imágenes de referencia por campaña.
7. **Corrección de export** — fix del stretch de imagen en PNG exportado.

Commits únicos (2):
```
49fc15b  feat: layout Editorial + selector de modo de imagen AI
e9b1900  fix: corrige stretch en export, amplía campos, mejora UX editorial
```

---

## Diferencias clave entre ramas

| | `main` | `feature/airtable-integration` | `feature/v2-flow` |
|---|---|---|---|
| Airtable | No | Sí | Sí (heredado) |
| Imagen IA | fal.ai básico | Flux Pro 1.1 Ultra | Flux Pro 1.1 Ultra + selector manual |
| Layout editorial | No | No | Sí |
| Splash screen | No | Sí | Sí |
| Estado en hook propio | No | No | Sí (`useCreativeState`) |
| `page.tsx` | Monolítico | Monolítico + mejoras | Descompuesto en subcomponentes |
| Tipos de canal | No | No | Sí |

---

## Estado actual

`feature/v2-flow` es la rama más avanzada — tiene todo lo de las anteriores más el refactor de UX. `main` es la versión base sin integraciones.
