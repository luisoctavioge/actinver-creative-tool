// Exporta los 4 formatos como PNG en un ZIP descargable.
//
// Estrategia de captura:
// 1. Para cada formato, clonamos el elemento DOM al body con opacity:1.
// 2. Esperamos que todos los <img> del clon hayan cargado (naturalWidth disponible).
// 3. patchCoverImages corre en el clon VIVO: reemplaza cada <img> de fondo
//    con un <canvas> que tiene el crop cover ya dibujado.
//    → Elimina la dependencia de left/top negativos + overflow:hidden que
//      html2canvas no recorta correctamente.
// 4. html2canvas captura el clon — los <canvas> se leen por readback de píxeles
//    (soporte nativo, sin problemas de posicionamiento).
// 5. En onclone se parchean los `backdrop-filter` que html2canvas no soporta.
// 6. El clon se elimina antes de pasar al siguiente formato.
//
// CRÍTICO: patchCoverImages NO puede correr en onclone — el clon interno de html2canvas
// no tiene layout activo (offsetWidth = 0) y el parche fallaría silenciosamente.

import JSZip from "jszip";

const EXPORT = {
  story:      { scale: 1080 / 380, label: "story-9x16"      },
  square:     { scale: 1080 / 540, label: "square-1x1"       },
  horizontal: { scale: 1920 / 960, label: "horizontal-16x9"  },
  poster:     { scale: 1080 / 540, label: "poster-3x4"       },
} as const;

function waitForPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

// Espera a que todos los <img> del elemento hayan cargado su src.
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

// Reemplaza cada <img> de fondo con un <canvas> que tiene el crop cover ya dibujado.
//
// Por qué canvas en lugar de estilos negativos:
//   html2canvas no recorta correctamente elementos absolutamente posicionados con
//   left/top negativos dentro de overflow:hidden — la imagen aparece cortada en el
//   lado opuesto al desplazamiento. Usar <canvas> elimina el problema porque
//   html2canvas captura canvas por readback de píxeles (primer soporte nativo),
//   sin necesitar clipping de posicionamiento.
//
// Maneja DOS estados de la imagen:
//   1. objectFit:cover (natImg null) — usa objectPosition para calcular el crop
//   2. Dims explícitas (natImg set)  — lee left/top/width/height inline para el crop
function patchCoverImages(root: HTMLElement): void {
  root.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;

    const container = img.parentElement;
    if (!container) return;

    // Container está en el DOM vivo → offsetWidth/offsetHeight son valores reales.
    const cw = container.offsetWidth;
    const ch = container.offsetHeight;
    if (!cw || !ch) return;

    // ── Calcular el rectángulo fuente en píxeles originales de la imagen ──────
    let srcX: number, srcY: number, srcW: number, srcH: number;

    if (img.style.objectFit === "cover") {
      // Estado fallback: LayoutRenderer puso objectFit:cover + objectPosition.
      // Reproducimos la matemática CSS object-fit:cover manualmente.
      const coverScale = Math.max(cw / nw, ch / nh);
      const sw = nw * coverScale;
      const sh = nh * coverScale;
      const objPos = img.style.objectPosition || "50% 50%";
      const parts  = objPos.trim().split(/\s+/);
      const pxPct  = (parseFloat(parts[0]) || 50) / 100;
      const pyPct  = (parseFloat(parts[1]) || 50) / 100;
      const offsetX = (cw - sw) * pxPct; // ≤ 0
      const offsetY = (ch - sh) * pyPct; // ≤ 0
      srcX = -offsetX / coverScale;
      srcY = -offsetY / coverScale;
      srcW = cw / coverScale;
      srcH = ch / coverScale;
    } else {
      // Estado explícito: LayoutRenderer calculó dims en píxeles con left/top
      // posiblemente negativos (cover manual). Reconstruimos el crop.
      const imgW    = parseFloat(img.style.width)  || nw;
      const imgH    = parseFloat(img.style.height) || nh;
      const imgLeft = parseFloat(img.style.left)   || 0; // puede ser negativo
      const imgTop  = parseFloat(img.style.top)    || 0; // puede ser negativo
      const scaleX  = nw / imgW;
      const scaleY  = nh / imgH;
      srcX = (-imgLeft) * scaleX;
      srcY = (-imgTop)  * scaleY;
      srcW = cw * scaleX;
      srcH = ch * scaleY;
    }

    // Clamp al tamaño real de la imagen
    srcX = Math.max(0, srcX);
    srcY = Math.max(0, srcY);
    srcW = Math.min(nw - srcX, srcW);
    srcH = Math.min(nh - srcY, srcH);

    // ── Crear canvas con el crop exacto y reemplazar el <img> ─────────────────
    const cv = document.createElement("canvas");
    cv.width  = cw;
    cv.height = ch;
    Object.assign(cv.style, {
      position: "absolute",
      top:      "0",
      left:     "0",
      width:    `${cw}px`,
      height:   `${ch}px`,
    });

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // Aplicar el mismo filtro CSS (saturate / brightness) que tiene el <img>.
    if (img.style.filter) ctx.filter = img.style.filter;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, cw, ch);
    container.replaceChild(cv, img);
  });
}

// Sustituye backdrop-filter por un fondo equivalente (html2canvas no lo soporta).
// Corre en onclone (clon interno de html2canvas) — no necesita layout activo.
function patchBackdropFilter(clonedDoc: Document): void {
  clonedDoc.querySelectorAll<HTMLElement>("[data-export-glass]").forEach((el) => {
    el.style.backdropFilter = "none";
    el.style.setProperty("-webkit-backdrop-filter", "none");
    const variant = el.getAttribute("data-export-glass");
    if (variant === "glass") {
      el.style.background =
        "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))";
    } else if (variant === "badge") {
      el.style.background = "rgba(10,14,18,0.72)";
    } else {
      el.style.background =
        "linear-gradient(135deg, rgba(10,14,18,0.85), rgba(26,36,51,0.80))";
    }
  });
}

async function captureElement(el: HTMLElement, scale: number): Promise<Blob> {
  // 1. Clonar al body — contexto de apilamiento propio, sin heredar opacity/z-index.
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

  // 2. Esperar a que el browser pinte y las imágenes descarguen/decodifiquen.
  await waitForPaint();
  await waitForImages(clone);
  await waitForPaint();

  // 3. Parchar cover images AHORA — el clon está en el DOM real con layout activo.
  //    naturalWidth/naturalHeight están garantizados por waitForImages().
  //    container.offsetWidth/offsetHeight son valores reales (no 0).
  patchCoverImages(clone);

  // 4. Una pintura más para que el browser refleje los estilos modificados.
  await waitForPaint();

  try {
    const { default: html2canvas } = await import("html2canvas");

    const canvas = await html2canvas(clone, {
      scale,
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: "#0a0e12",
      logging:         false,
      onclone: (_clonedDoc) => {
        // Solo backdrop-filter en onclone — el cover ya está resuelto en el clon vivo.
        patchBackdropFilter(_clonedDoc);
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

export async function downloadAllFormats(refs: {
  story:      HTMLElement | null;
  square:     HTMLElement | null;
  horizontal: HTMLElement | null;
  poster:     HTMLElement | null;
}): Promise<void> {
  const zip = new JSZip();

  for (const [fmt, cfg] of Object.entries(EXPORT) as [keyof typeof EXPORT, (typeof EXPORT)[keyof typeof EXPORT]][]) {
    const el = refs[fmt];
    if (!el) throw new Error(`Falta el elemento para el formato "${fmt}"`);

    const blob = await captureElement(el, cfg.scale);
    zip.file(`actinver-${cfg.label}.png`, blob);
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
