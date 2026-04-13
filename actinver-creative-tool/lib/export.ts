// Exporta formatos como PNG en un ZIP descargable.
//
// Fixes clave vs html2canvas:
//   1. Logo inline SVG: ActinverLogo usa fills explícitos — html2canvas lo renderiza nativamente.
//   2. border-radius: los export refs usan forExport=true que lo pone a 0.
//   3. backdrop-filter: no soportado, se simula con gradiente sólido.

import JSZip from "jszip";
import { FormatKey, FORMATS, NATIVE } from "./templates";

// Escala de exportación: resolución final / tamaño nativo CSS
function getExportScale(format: FormatKey): number {
  const { width } = FORMATS[format];
  const { w } = NATIVE[format];
  return width / w;
}

function getExportLabel(format: FormatKey): string {
  const labels: Record<FormatKey, string> = {
    story:              "story-9x16",
    square:             "square-1x1",
    horizontal:         "horizontal-16x9",
    poster:             "poster-3x4",
    "fullhd-v":         "pantalla-v-9x16",
    "fullhd-h":         "pantalla-h-16x9",
    "email-internal":   "email-interno",
    "email-client":     "email-cliente",
    "event-invitation": "invitacion-4x5",
  };
  return labels[format] ?? format;
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"));
  return Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load",  () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
    )
  ).then(() => undefined);
}

// Sustituye backdrop-filter por un fondo sólido equivalente.
function patchBackdropFilter(clonedDoc: Document): void {
  clonedDoc.querySelectorAll<HTMLElement>("[data-export-glass]").forEach((el) => {
    el.style.backdropFilter = "none";
    el.style.setProperty("-webkit-backdrop-filter", "none");
    el.style.background = "linear-gradient(135deg, rgba(10,14,18,0.85), rgba(26,36,51,0.80))";
  });
}

async function captureElement(el: HTMLElement, scale: number): Promise<Blob> {
  const clone = el.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position:      "fixed",
    top:           "0",
    left:          "0",
    zIndex:        "999999",
    opacity:       "1",
    pointerEvents: "none",
    display:       "inline-block",
  });
  document.body.appendChild(clone);

  await waitForPaint();
  await waitForImages(clone);
  await waitForPaint();

  try {
    const { default: html2canvas } = await import("html2canvas");

    const canvas = await html2canvas(clone, {
      scale,
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: "#0a0e12",
      logging:         false,
      onclone: (clonedDoc) => {
        patchBackdropFilter(clonedDoc);
        // Ensure logo SVGs are visible and have no problematic filters
        clonedDoc.querySelectorAll<HTMLElement>("[data-export-logo]").forEach((el) => {
          el.style.display = "block";
          el.style.filter = "none";
        });
      },
    });

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob devolvió null"))),
        "image/png"
      );
    });
  } finally {
    document.body.removeChild(clone);
  }
}

/**
 * Downloads all active formats as a ZIP.
 * `refs` is a partial map of FormatKey → DOM element.
 * `activeFormats` specifies which formats to include (defaults to all keys in refs).
 */
export async function downloadAllFormats(
  refs: Partial<Record<FormatKey, HTMLElement | null>>,
  activeFormats?: FormatKey[],
): Promise<void> {
  const formats = activeFormats ?? (Object.keys(refs) as FormatKey[]);
  const zip = new JSZip();

  for (const fmt of formats) {
    const el = refs[fmt];
    if (!el) continue;

    const scale = getExportScale(fmt);
    const label = getExportLabel(fmt);
    const blob = await captureElement(el, scale);
    zip.file(`actinver-${label}.png`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "actinver-piezas.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
