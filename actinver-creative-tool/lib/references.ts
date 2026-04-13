// Sistema de referencias y fichas personalizadas — almacenado en localStorage.
// Solo se ejecuta en el cliente (no en Server Components ni API routes).

import type { ProductFicha } from "./fichas";
import type { PieceContent, CreatorInput } from "./templates";

// ── Fichas personalizadas ────────────────────────────────────────────────────

const CUSTOM_FICHAS_KEY = "actinver_custom_fichas";

export function getCustomFichas(): ProductFicha[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_FICHAS_KEY);
    return raw ? (JSON.parse(raw) as ProductFicha[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomFicha(ficha: ProductFicha): void {
  if (typeof window === "undefined") return;
  const existing = getCustomFichas().filter((f) => f.id !== ficha.id);
  localStorage.setItem(CUSTOM_FICHAS_KEY, JSON.stringify([...existing, ficha]));
}

export function deleteCustomFicha(id: string): void {
  if (typeof window === "undefined") return;
  const updated = getCustomFichas().filter((f) => f.id !== id);
  localStorage.setItem(CUSTOM_FICHAS_KEY, JSON.stringify(updated));
}

/** Genera un id único a partir del nombre de la ficha */
export function fichaIdFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Piezas aprobadas como referencias (few-shot) ─────────────────────────────

export interface SavedReference {
  id: string;
  savedAt: string;            // ISO date
  product: string;
  message: string;
  pieceContent: PieceContent;
  imageUrlThumb: string | null;
  creatorInput: CreatorInput;
}

const REFERENCES_KEY = "actinver_saved_references";
const MAX_REFERENCES = 30;

export function getSavedReferences(): SavedReference[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REFERENCES_KEY);
    return raw ? (JSON.parse(raw) as SavedReference[]) : [];
  } catch {
    return [];
  }
}

export function saveReference(ref: Omit<SavedReference, "id" | "savedAt">): SavedReference {
  const newRef: SavedReference = {
    ...ref,
    id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
  };
  const existing = getSavedReferences();
  // Guardar las más recientes (MAX_REFERENCES máximo)
  const updated = [newRef, ...existing].slice(0, MAX_REFERENCES);
  if (typeof window !== "undefined") {
    localStorage.setItem(REFERENCES_KEY, JSON.stringify(updated));
  }
  return newRef;
}

export function deleteReference(id: string): void {
  if (typeof window === "undefined") return;
  const updated = getSavedReferences().filter((r) => r.id !== id);
  localStorage.setItem(REFERENCES_KEY, JSON.stringify(updated));
}

// ── Matching de referencias para few-shot ────────────────────────────────────

/** Normaliza un string a palabras clave significativas (> 3 letras) */
function keywordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\W+/)
    .filter((w) => w.length > 3);
}

/** Score de similitud por keywords comunes (Jaccard-like) */
function keywordSimilarity(a: string, b: string): number {
  const ka = new Set(keywordsOf(a));
  const kb = new Set(keywordsOf(b));
  if (ka.size === 0 || kb.size === 0) return 0;
  const intersection = Array.from(ka).filter((w) => kb.has(w)).length;
  const union = new Set([...Array.from(ka), ...Array.from(kb)]).size;
  return intersection / union;
}

/**
 * Devuelve hasta 2 referencias guardadas que sean relevantes para el brief actual.
 * Usa Jaccard sobre keywords del mensaje + producto.
 */
export function getMatchingReferences(
  product: string,
  message: string,
  limit = 2
): SavedReference[] {
  const refs = getSavedReferences();
  if (refs.length === 0) return [];

  const query = `${product} ${message}`.trim();
  if (!query) return refs.slice(0, limit);

  const scored = refs.map((ref) => {
    const refQuery = `${ref.product} ${ref.message}`.trim();
    const score = keywordSimilarity(query, refQuery);
    return { ref, score };
  });

  return scored
    .filter(({ score }) => score > 0.1) // umbral mínimo de relevancia
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ ref }) => ref);
}
