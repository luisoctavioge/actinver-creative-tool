// Carga todas las fichas de producto desde archivos JSON en esta carpeta.
// Soporta dos formatos:
//   - Formato simple (v0): campos planos { nombre, categoria, descripcion, ... }
//   - Formato rico  (v1): schema con { meta, product, communication, visual_guidelines, ... }
//
// `loadAllFichas` normaliza ambos al `ProductFicha` estándar que consume el sistema.

import fs from "fs";
import path from "path";

export interface ProductFicha {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  beneficios: string[];
  publicoObjetivo: string;
  tono: string;
  pexelsQueries?: string[];
  // Datos enriquecidos — presentes cuando la ficha usa el formato v1 rico.
  taglines?: string[];
  emotionalTriggers?: string[];
  prohibitedClaims?: string[];
}

// ── Detector + normalizador de formato ───────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRichFicha(raw: Record<string, any>): ProductFicha {
  // Formato rico (v1): tiene claves "product" y "communication".
  if (raw.product && raw.communication) {
    const meta       = raw.meta         ?? {};
    const product    = raw.product      ?? {};
    const comm       = raw.communication ?? {};
    const brandVoice = comm.brand_voice ?? {};
    const primary    = raw.target_audience?.primary ?? {};
    const visual     = raw.visual_guidelines ?? {};

    return {
      id:           String(meta.product_id ?? product.product_id ?? ""),
      nombre:       String(product.short_name ?? product.name ?? ""),
      categoria:    String(product.category   ?? ""),
      descripcion:  String(product.description ?? ""),
      beneficios:   Array.isArray(comm.key_messages)
                      ? (comm.key_messages as string[])
                      : [],
      publicoObjetivo: String(primary.description ?? ""),
      tono:         String(brandVoice.tone ?? ""),
      // pexels_queries tiene prioridad; si no existe, cae a imagery_keywords.
      pexelsQueries: Array.isArray(visual.pexels_queries)
                       ? (visual.pexels_queries as string[])
                       : Array.isArray(visual.imagery_keywords)
                         ? (visual.imagery_keywords as string[])
                         : undefined,
      taglines:         Array.isArray(comm.taglines)
                          ? (comm.taglines as string[])
                          : undefined,
      emotionalTriggers: Array.isArray(comm.emotional_triggers)
                           ? (comm.emotional_triggers as string[])
                           : undefined,
      prohibitedClaims: Array.isArray(comm.prohibited_claims)
                          ? (comm.prohibited_claims as string[])
                          : undefined,
    };
  }

  // Formato simple (v0): campos planos — devuelve tal cual.
  return raw as unknown as ProductFicha;
}

export function loadAllFichas(): ProductFicha[] {
  const dir = path.join(process.cwd(), "lib/fichas");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    return normalizeRichFicha(raw);
  });
}

/**
 * Busca una ficha por nombre de producto. Intenta:
 *   1. Match exacto (case-insensitive) por `nombre`
 *   2. Match parcial: si el producto del usuario CONTIENE el nombre de la ficha o viceversa
 *   3. Match por palabra clave en categoría o descripción
 * Devuelve null si no encuentra nada.
 */
export function findFichaByProduct(product: string): ProductFicha | null {
  if (!product?.trim()) return null;
  const fichas = loadAllFichas();
  const p = product.trim().toLowerCase();

  // 1. Exacto
  const exact = fichas.find((f) => f.nombre.toLowerCase() === p);
  if (exact) return exact;

  // 2. Parcial bidireccional
  const partial = fichas.find(
    (f) => p.includes(f.nombre.toLowerCase()) || f.nombre.toLowerCase().includes(p),
  );
  if (partial) return partial;

  // 3. Por palabra clave en categoría/descripción
  const byWord = fichas.find((f) => {
    const haystack = `${f.categoria} ${f.descripcion}`.toLowerCase();
    return p.split(/\s+/).some((word) => word.length > 3 && haystack.includes(word));
  });
  return byWord ?? null;
}
