// Generación / búsqueda de imagen de fondo para piezas Actinver
//
// PROVEEDORES:
//   generateImageFromPexels → búsqueda de stock (Pexels)
//   generateImageWithAI     → fal.ai Flux Pro 1.1 Ultra (máxima calidad)

import { fal } from "@fal-ai/client";
import OpenAI from "openai";
import { buildAIPrompt } from "./gemini";
import { PieceContent } from "./templates";

export interface ImageParams {
  product: string;
  content: PieceContent;
  excludeIds?: string[];
}

export interface ImageResult {
  imageUrl: string;
  pexelsId?: string;
  credit?: string;
  creditUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ANGLE MODIFIERS — fuerzan variación visual en cada búsqueda
// ─────────────────────────────────────────────────────────────────────────────
const ANGLE_MODIFIERS = [
  "close-up detail shot focusing on textures and materials",
  "wide establishing shot showing the full environment",
  "overhead bird's-eye view looking straight down",
  "low-angle dramatic perspective looking upward",
  "silhouette composition with backlighting",
  "environmental portrait with context and surroundings",
  "shallow depth of field with soft bokeh background",
  "moody side-lit scene with strong shadows",
  "golden hour warm natural lighting",
  "minimalist composition with negative space",
  "candid moment captured in motion",
  "architectural lines and geometric framing",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// TAGS DINÁMICOS — Groq convierte el brief en keywords en inglés para Pexels
// ─────────────────────────────────────────────────────────────────────────────
async function resolveSearchQuery(product: string, content: PieceContent): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return `${product} professional lifestyle photography`;

  const angle = pickRandom(ANGLE_MODIFIERS);

  try {
    const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You generate concise English search queries for Pexels stock photography.
Rules:
- Return ONLY 3-5 English keywords, nothing else
- Keywords must describe a visual scene (people, objects, places, mood)
- Prefer cinematic, moody, professional photography
- No abstract concepts — describe what a camera would capture
- IMPORTANT: Every call must produce COMPLETELY DIFFERENT keywords. Be creative and surprising.
- Examples: "luxury car night rain", "executive skyline twilight", "chef cooking restaurant kitchen"`,
        },
        {
          role: "user",
          content: `Social media piece topic: ${product}. Title: ${content.title || "(none)"}. Visual angle: ${angle}. Generate Pexels keywords:`,
        },
      ],
      max_tokens: 30,
      temperature: 0.85,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "";
    const clean = raw.replace(/["""'']/g, "").replace(/\.$/, "").trim();
    return clean || `${product} professional lifestyle`;
  } catch {
    return `${product} professional lifestyle photography`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PEXELS — búsqueda de stock photography con deduplicación y fallbacks
// ─────────────────────────────────────────────────────────────────────────────

type PexelsPhoto = {
  id: number;
  src: { large2x: string; large: string };
  photographer: string;
  photographer_url: string;
};

async function searchPexels(query: string, apiKey: string, excludeIds: Set<string>): Promise<PexelsPhoto | null> {
  const page = Math.floor(Math.random() * 3) + 1;
  console.log(`[pexels] query: "${query}" page: ${page}`);

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=square&size=large&per_page=40&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) return null;

  const data = await res.json() as { photos: PexelsPhoto[] };
  if (!data.photos?.length) return null;

  let candidates = data.photos.filter((p) => !excludeIds.has(String(p.id)));
  if (!candidates.length) candidates = data.photos;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export async function generateImageFromPexels(params: ImageParams): Promise<ImageResult> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error("PEXELS_API_KEY no está configurada en .env.local");

  const excludeSet = new Set(params.excludeIds ?? []);

  const primaryQuery = await resolveSearchQuery(params.product, params.content);
  let pick = await searchPexels(primaryQuery, apiKey, excludeSet);

  if (!pick && params.product && params.product.length < 60) {
    pick = await searchPexels(`${params.product} professional`, apiKey, excludeSet);
  }

  if (!pick) {
    pick = await searchPexels("business executive finance investment professional", apiKey, excludeSet);
  }

  if (!pick) throw new Error(`No se encontraron imágenes para: "${primaryQuery}"`);

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
// fal.ai — Flux Pro 1.1 Ultra (máxima calidad fotorrealista)
// SDK oficial: @fal-ai/client
// Modelo: fal-ai/flux-pro/v1.1-ultra
// ─────────────────────────────────────────────────────────────────────────────

type FalImage = { url: string; content_type?: string };
type FalOutput = { images?: FalImage[] };

export async function generateImageWithAI(params: ImageParams): Promise<ImageResult> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) throw new Error("FAL_KEY no está configurada en .env.local");

  // Configurar credenciales por request (seguro en serverless)
  fal.config({ credentials: falKey });

  const prompt = buildAIPrompt(params.product, params.content);
  console.log(`[fal.ai] Flux Pro 1.1 Ultra — prompt: "${prompt.slice(0, 120)}..."`);

  const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
    input: {
      prompt,
      aspect_ratio:     "1:1",   // cuadrado 1:1 para social media
      num_images:       1,
      safety_tolerance: "5",
      output_format:    "jpeg",
      enhance_prompt:   false,   // el prompt ya viene optimizado por buildAIPrompt
    },
    logs: false,
  }) as { data: FalOutput };

  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error("fal.ai no devolvió imagen");

  console.log(`[fal.ai] ✓ Imagen generada: ${imageUrl.slice(0, 80)}...`);

  // Descargar y convertir a base64 para el cliente
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Error descargando imagen de fal.ai (${imgRes.status})`);
  const buffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = imgRes.headers.get("content-type") ?? "image/jpeg";

  return { imageUrl: `data:${mimeType};base64,${base64}` };
}
