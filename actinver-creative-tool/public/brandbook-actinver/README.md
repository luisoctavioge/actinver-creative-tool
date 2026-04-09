# Actinver · Brand Identity System

Digital brandbook interactivo del sistema de identidad visual de Actinver. Single-page HTML, sin dependencias de build, completamente autónomo.

## Estructura

```
actinver-brandbook/
├── index.html              Brandbook completo
├── style.css               Poppins @font-face + todos los estilos
├── CLAUDE.md               Memoria persistente para Claude Code
├── README.md
└── assets/
    ├── fonts/              Poppins TTF (18 variantes Thin→Black)
    ├── logos/              SVGs oficiales (primario + simplificados)
    ├── images/             Fotografías aprobadas de marca (8)
    └── mockups/            Aplicaciones reales (flyer, social, billboard)
```

## Uso

Abrir `index.html` directamente en el browser, o servir con cualquier servidor estático:

```bash
npx serve .
# → http://localhost:3000
```

## Secciones

00 Inicio · 01 Design Tokens · 02 Esencia · 03 Mensajes · 04 Lenguaje · 05 Logotipo · 06 Tipografía · 07 Colores · 08 Data Viz · 09 Fotografía · 10 Layout · 11 Aplicaciones · 12 Cobranding · 13 Recursos

## Tokens de color

| Token | Hex | Uso |
|-------|-----|-----|
| Azul Grandeza | `#0A0E12` | Fondo principal |
| Acompañamiento | `#1A2433` | Fondos secundarios |
| Azul Actinver | `#314566` | Elementos medios |
| Arena | `#F5F2EB` | Fondos claros |
| Sunset | `#E6C78A` | Acento, punto diacrítico |

---

Versión 1.0 · Mayo 2025 · Uso interno Actinver
