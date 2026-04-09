# Actinver Brandbook · CLAUDE.md

Memoria persistente para sesiones de Claude Code. Lee esto antes de tocar cualquier archivo.

---

## Qué es este proyecto

Digital brandbook de Actinver. Single-page HTML con sidebar de navegación fijo, 14 secciones, completamente autónomo (sin dependencias externas en producción).

**Archivos principales:**
- `index.html` — Toda la estructura y contenido del brandbook
- `style.css` — CSS completo: @font-face Poppins + todos los estilos
- `assets/` — Fuentes, logos SVG, fotografías, mockups

---

## Tokens del sistema de diseño

```
--grandeza:   #0A0E12   (fondo principal)
--acomp:      #1A2433   (fondo secundario / cards)
--actinver:   #314566   (azul medio / botones)
--arena:      #F5F2EB   (texto sobre oscuro / fondos claros)
--blanco:     #FFFFFF
--sunset:     #E6C78A   (acento / punto diacrítico / CTAs)
--line:       rgba(230,199,138,0.12)
--line-b:     rgba(255,255,255,0.07)
--muted:      rgba(255,255,255,0.5)
--muted2:     rgba(255,255,255,0.28)
```

**Tipografía:** Poppins (100–900, normal + italic) embebida desde `assets/fonts/`  
**Tipografía secundaria:** Open Sans — importada desde Google Fonts en `index.html`

---

## Estructura de secciones

| # | id | Título |
|---|---|---|
| 00 | `#hero` | Inicio |
| 01 | `#tokens` | Design Tokens |
| 02 | `#esencia` | Esencia de marca |
| 03 | `#mensajes` | Mensajes |
| 04 | `#lenguaje` | Uso del lenguaje |
| 05 | `#logotipo` | Logotipo |
| 06 | `#tipografia` | Tipografía |
| 07 | `#colores` | Colores |
| 08 | `#dataviz` | Visualización de datos |
| 09 | `#fotografia` | Fotografía |
| 10 | `#layout` | Layout & Grid |
| 11 | `#aplicaciones` | Aplicaciones |
| 12 | `#cobranding` | Cobranding |
| 13 | `#recursos` | Recursos |

Para agregar una sección nueva: añadir `<a href="#nueva-seccion">` en el `#sidebar .sb-nav`, luego el bloque `<section id="nueva-seccion">` en `main`.

---

## Convenciones CSS

- `.reveal` — clase para scroll reveal (IntersectionObserver en JS al final del HTML)
- `.kicker` — etiqueta pequeña en Sunset antes del título de sección
- `.sec-title` — H2 principal de cada sección
- `.sec-desc` — párrafo descriptor debajo del título
- `.subsec` — subetiqueta dentro de una sección
- `.divider` — separador horizontal `1px`
- `.tok` — fila de design token clickeable (copy to clipboard)
- `.dv-tab / .dv-panel` — sistema de tabs en Data Viz (JS: función `dvTab()`)

---

## Assets

```
assets/
├── fonts/          18 archivos Poppins TTF (Thin→Black, normal+italic)
├── logos/
│   ├── Actinver_Vector.svg                  Primario (blanco + punto sunset)
│   ├── Actinver_Simplificado_Claro.svg      A· con punto (fondo oscuro)
│   └── Actinver_Simplificado_Oscuro.svg     A· oscuro (fondo Arena)
├── images/         8 fotografías aprobadas de marca
│   ├── photo-painter.jpg
│   ├── photo-laptop-night.jpg
│   ├── photo-craftwoman.jpg
│   ├── photo-office-woman.jpg
│   ├── photo-financial-meeting.jpg
│   ├── photo-focus-night.jpg
│   ├── photo-pottery-studio.jpg
│   └── photo-designer-studio.jpg
└── mockups/        3 mockups de aplicaciones reales
    ├── mockup-flyer.jpg
    ├── mockup-social-post.jpg
    └── mockup-billboard.png
```

Los logos SVG están **también embebidos inline** en el HTML para garantizar render correcto sin servidor. Si cambias un logo, actualiza tanto el archivo SVG como el inline en el HTML.

---

## Reglas para editar

1. **No romper el self-contained** — el HTML debe funcionar abriéndolo directo en browser (file://) con los assets en rutas relativas. No usar rutas absolutas.
2. **Open Sans** se carga desde Google Fonts en producción. Si necesitas que sea completamente offline, agregar los TTF a `assets/fonts/` y crear @font-face adicionales en `style.css`.
3. **Data Viz** — Las 3 paletas son un sistema interconectado. Los colores de la paleta Categórica tienen código HEX exacto del brandbook (PDF v1.0 Mayo 2025). No inventar colores.
4. **Fotografías** — solo usar las 8 de `assets/images/`. El brandbook define estilos específicos (retoque frío, personas protagonistas).
5. **Sidebar** — el estado activo se maneja via `IntersectionObserver` en el JS inline al final del HTML. Si agregas secciones, el observer las detecta automáticamente.

---

## Para desplegar

Es un proyecto estático. Funciona con cualquier servidor de archivos:

```bash
# Desarrollo local
npx serve .
# o
python3 -m http.server 8080

# GitHub Pages
# Subir a rama gh-pages o configurar Pages desde main
# No requiere build steps
```

---

## Historial de versiones

| v | Cambios |
|---|---|
| v1 | Brandbook base desde PDF Actinver v1.0 Mayo 2025 |
| v2 | Logos SVG reales + 8 fotos aprobadas embebidas |
| v3 | Data Viz corregida desde PDF (swatches, tokens, ejemplos reales) |
| v4 | Poppins embebida localmente + fotos sin recorte (aspect-ratio) |
| v5 | Mockups reales en Aplicaciones (flyer, social post, billboard) |
| v6 | Proyecto desempaquetado: rutas relativas, CSS separado, estructura GitHub |
