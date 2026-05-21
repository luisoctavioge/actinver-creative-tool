// Generación / búsqueda de imagen de fondo para piezas Actinver.
//
// DOS PROVEEDORES:
//   generateImageFromPexels → búsqueda de stock (Pexels)
//     - Query construida por Groq usando producto + mensaje + ficha + ángulo random
//     - Deduplica por IDs ya vistos (feedback loop "otra imagen")
//
//   generateImageWithAI     → generación con IA (fal.ai — FLUX)
//     - Mejor calidad y consistencia que Pollinations
//     - Acepta `excludeDescriptions` para evitar repetir composiciones rechazadas

import OpenAI from "openai";
import { buildAIPrompt } from "./gemini";
import { PieceContent } from "./templates";
import { findFichaByProduct, ProductFicha } from "./fichas";

export interface ImageParams {
  product: string;
  message?: string;
  content: PieceContent;
  excludeIds?: string[];           // Pexels IDs rechazados / ya vistos
  excludeDescriptions?: string[];  // descripciones de imágenes AI rechazadas
  compositionIndex?: number;       // índice rotativo de ángulo de composición (para fal.ai)
}

export interface ImageResult {
  imageUrl: string;
  pexelsId?: string;
  credit?: string;
  creditUrl?: string;
  // Para AI: descripción usada (para que el cliente pueda acumularla en excludeDescriptions)
  aiSceneDescription?: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Query para Pexels
//   - Si la ficha del producto trae `pexelsQueries`, ROTAMOS entre esas queries
//     literales (bypass Groq). Así garantizamos que las fotos hablen del
//     producto concreto. Si hay excludeIds, sube la variedad usando queries
//     que no se han usado recientemente.
//   - Si no hay ficha con queries, caemos al generador de Groq como antes,
//     pero con prompt más anclado para evitar que invente abstracciones.
// ─────────────────────────────────────────────────────────────────────────────
async function resolveSearchQuery(
  product: string,
  message: string | undefined,
  content: PieceContent,
  ficha: ProductFicha | null,
): Promise<string> {
  // Path preferido: queries literales de la ficha.
  if (ficha?.pexelsQueries?.length) {
    const q = pickRandom(ficha.pexelsQueries);
    console.log(`[pexels] ficha query (${ficha.id}): "${q}"`);
    return q;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return product.split(/\s+/)[0] || product;

  try {
    const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You return ONE single English noun that is the literal physical object or person associated with the product.
Rules:
- Return ONLY one word (max two words if truly necessary). No punctuation. No quotes.
- It must be a concrete noun you could photograph — not a metaphor, not an abstract concept.
- Examples:
  product "car insurance" → "car"
  product "retirement plan" → "retirement"
  product "life insurance" → "family"
  product "home insurance" → "house"
  product "health insurance" → "doctor"
  product "stock trading" → "trader"
  product "savings account" → "money"
NEVER return abstract words like "freedom", "future", "journey", "moon", "wave", "sunset".`,
        },
        {
          role: "user",
          content: `Product: ${product}${message ? ` · Message: ${message}` : ""}${ficha ? ` · Context: ${ficha.descripcion}` : ""}${content.title ? ` · Title: "${content.title}"` : ""}
One concrete noun:`,
        },
      ],
      max_tokens: 10,
      temperature: 0.2,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "";
    const clean = raw.replace(/["""''`.,]/g, "").trim().toLowerCase();
    return clean || product.split(/\s+/)[0] || product;
  } catch {
    return product.split(/\s+/)[0] || product;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PEXELS — búsqueda de stock photography con deduplicación
// ─────────────────────────────────────────────────────────────────────────────
export async function generateImageFromPexels(params: ImageParams): Promise<ImageResult> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error("PEXELS_API_KEY no está configurada en .env.local");

  const ficha = findFichaByProduct(params.product);
  const query = await resolveSearchQuery(params.product, params.message, params.content, ficha);
  const page = Math.floor(Math.random() * 5) + 1;
  console.log(`[pexels] query: "${query}" page: ${page}`);

  // orientation=landscape porque cubrimos fondos de distintos formatos — deja
  // más variedad estética. Si el query es una sola palabra, Pexels devuelve
  // miles de fotos y podemos pickear aleatoriamente dentro de ~80 candidatos.
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&size=large&per_page=80&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Pexels error ${res.status}`);

  const data = (await res.json()) as {
    photos: Array<{
      id: number;
      src: { large2x: string; large: string };
      photographer: string;
      photographer_url: string;
    }>;
  };

  if (!data.photos?.length) throw new Error(`No se encontraron imágenes para: "${query}"`);

  // Filtrar fotos ya vistas en esta sesión
  const excludeSet = new Set(params.excludeIds ?? []);
  let candidates = data.photos.filter((p) => !excludeSet.has(String(p.id)));

  // Si todas están excluidas, usar el set completo como fallback
  if (!candidates.length) candidates = data.photos;

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const imageRes = await fetch(pick.src.large2x || pick.src.large);
  if (!imageRes.ok) throw new Error(`Error al descargar imagen de Pexels (${imageRes.status})`);
  const buffer = await imageRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = imageRes.headers.get("content-type") ?? "image/jpeg";

  return {
    imageUrl:  `data:${mimeType};base64,${base64}`,
    pexelsId:  String(pick.id),
    credit:    pick.photographer,
    creditUrl: pick.photographer_url,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// IA GENERATIVA — fal.ai (FLUX)
// Requiere FAL_KEY en .env.local. Mejor calidad y consistencia que Pollinations.
// ─────────────────────────────────────────────────────────────────────────────

// Modelos fal disponibles:
//   fal-ai/flux/schnell  — rápido, barato, ok para borradores
//   fal-ai/flux/dev      — mejor calidad, un poco más lento
//   fal-ai/flux-pro/v1.1 — top tier, más caro
const FAL_MODEL = "fal-ai/flux/dev";

interface FalResponse {
  images: Array<{ url: string; width: number; height: number }>;
  seed?: number;
}

export async function generateImageWithAI(params: ImageParams): Promise<ImageResult> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) throw new Error("FAL_KEY no está configurada en .env.local");

  const groqKey = process.env.GROQ_API_KEY;
  const ficha = findFichaByProduct(params.product);

  const prompt = await buildAIPrompt(
    {
      product: params.product,
      message: params.message,
      ficha,
      content: params.content,
      excludeDescriptions: params.excludeDescriptions,
      compositionIndex: params.compositionIndex,
    },
    groqKey,
  );

  console.log(`[fal] model: ${FAL_MODEL}`);
  console.log(`[fal] prompt: ${prompt.slice(0, 220)}${prompt.length > 220 ? "…" : ""}`);

  const seed = Math.floor(Math.random() * 1_000_000);

  const res = await fetch(`https://fal.run/${FAL_MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: "square_hd",
      num_inference_steps: 28,
      seed,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Error fal.ai (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as FalResponse;
  const imageUrl = data.images?.[0]?.url;
  if (!imageUrl) throw new Error("fal.ai no devolvió ninguna imagen");

  // Descargar y convertir a data URL para que html2canvas pueda exportarla sin CORS.
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error(`Error al descargar imagen AI (${imageRes.status})`);
  const buffer = await imageRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = imageRes.headers.get("content-type") ?? "image/jpeg";

  return {
    imageUrl: `data:${mimeType};base64,${base64}`,
    aiSceneDescription: prompt.slice(0, 220),
  };
}
