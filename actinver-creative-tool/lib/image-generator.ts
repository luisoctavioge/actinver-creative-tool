// Generación / búsqueda de imagen de fondo para piezas Actinver
//
// PROVEEDORES:
//   generateImageFromPexels → búsqueda de stock (Pexels)
//   generateImageWithAI     → fal.ai Flux Pro 1.1 Ultra (máxima calidad)

import { fal } from "@fal-ai/client";
import OpenAI from "openai";
import { buildAIPrompt } from "./gemini";
import { PieceContent } from "./templates";
import type { ProductFicha } from "./fichas";

export interface ImageParams {
  product: string;
  content: PieceContent;
  message?: string;
  ficha?: ProductFicha | null;
  excludeIds?: string[];
  // v2 context — enrich AI prompts with brief parameters
  genero?: string;
  edadRango?: string;
  tipoPieza?: string;
  communicationType?: string;
  imageMode?: string;
}

export interface ImageResult {
  imageUrl: string;
  pexelsId?: string;
  credit?: string;
  creditUrl?: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIACIONES VISUALES — garantizan imágenes distintas en cada llamada
// ─────────────────────────────────────────────────────────────────────────────
const VISUAL_VARIATIONS = [
  "candid lifestyle moment",
  "portrait with natural light",
  "outdoor environmental scene",
  "indoor warm light",
  "action moment with people",
  "serene contemplative scene",
  "group interaction",
  "solo person thinking",
  "urban setting",
  "nature setting",
];

// ─────────────────────────────────────────────────────────────────────────────
// TAGS DINÁMICOS — Groq convierte el brief en keywords concretas para Pexels
// La clave: el modelo DEBE leer el mensaje y producto literal, no inventar
// estética genérica de "ejecutivo en oficina".
// ─────────────────────────────────────────────────────────────────────────────
async function resolveSearchQuery(
  product: string,
  content: PieceContent,
  message?: string,
  ficha?: ProductFicha | null,
  briefContext?: { genero?: string; edadRango?: string; tipoPieza?: string; communicationType?: string },
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return `${product} lifestyle people`;

  const variation = pickRandom(VISUAL_VARIATIONS);

  // Construir el brief completo y explícito para que el LLM no se invente la escena
  const briefLines: string[] = [];
  briefLines.push(`PRODUCT: ${product}`);
  if (message?.trim()) briefLines.push(`MESSAGE TO COMMUNICATE: ${message.trim()}`);
  if (content.title?.trim()) briefLines.push(`HEADLINE: ${content.title.trim()}`);
  if (ficha?.publicoObjetivo) briefLines.push(`TARGET AUDIENCE: ${ficha.publicoObjetivo}`);
  if (ficha?.descripcion) briefLines.push(`PRODUCT DESCRIPTION: ${ficha.descripcion}`);

  // Demografía concreta — crítica para que el LLM ajuste la escena real
  const ageLabels: Record<string, string> = {
    "25-35": "young adults aged 25-35",
    "36-50": "adults aged 36-50",
    "51-65": "mature adults aged 51-65",
  };
  const genderLabels: Record<string, string> = {
    "hombre": "men",
    "mujer":  "women",
    "ambos":  "men and women",
  };
  const age    = ageLabels[briefContext?.edadRango ?? ""] ?? "";
  const gender = genderLabels[briefContext?.genero ?? ""] ?? "";
  if (age || gender)    briefLines.push(`DEMOGRAPHICS: ${[gender, age].filter(Boolean).join(", ")}`);
  if (briefContext?.communicationType === "internal") briefLines.push(`CONTEXT: internal workplace communication`);

  const briefBlock = briefLines.join("\n");

  try {
    const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You translate advertising briefs into Pexels photo search queries.

CRITICAL RULES:
1. Return ONLY 3-4 English keywords — no punctuation, no explanation, nothing else.
2. Keywords MUST describe the SPECIFIC people and situation in the brief. Read the MESSAGE carefully.
3. The scene must match the demographic (age, gender) literally. If the audience is "young adults 25-35", show young people. NOT executives or suits.
4. Keywords describe what a CAMERA would photograph: people, setting, activity, emotion.
5. Avoid generic financial clichés: NO "executive", "businessman", "office", "skyline", "boardroom", "advisor" unless the MESSAGE specifically demands it.
6. Match the emotional tone of the message: retirement planning for young people → "young person future thinking"; family protection → "family together park"; investment → "professional confident smiling".
7. Always vary: each call must produce different keywords.

BAD examples (too generic, wrong audience): "financial advisor calm office", "executive skyline twilight", "businessman warm coffee"
GOOD examples (message-specific): "young couple planning future", "elderly man relaxing park bench", "woman laptop coffee planning", "friends talking laughing park"`,
        },
        {
          role: "user",
          content: `Brief:\n${briefBlock}\n\nVisual variation hint: ${variation}\n\nGenerate 3-4 Pexels keywords:`,
        },
      ],
      max_tokens: 20,
      temperature: 0.75,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "";
    // Limpiar cualquier prefijo, puntuación o comillas que el LLM añada
    const clean = raw
      .replace(/^(keywords?:|query:|search:|result:)/i, "")
      .replace(/["""'''*\-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return clean || `${product} people lifestyle`;
  } catch {
    return `${product} people lifestyle`;
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

  const primaryQuery = await resolveSearchQuery(params.product, params.content, params.message, params.ficha, params);
  let pick = await searchPexels(primaryQuery, apiKey, excludeSet);

  // Fallback 1: producto + personas (más genérico pero sigue siendo contextual)
  if (!pick && params.product && params.product.length < 60) {
    const demographicHint = params.edadRango === "25-35" ? "young" : params.edadRango === "51-65" ? "mature" : "";
    pick = await searchPexels(`${demographicHint} people ${params.product}`.trim(), apiKey, excludeSet);
  }

  // Fallback 2: solo demografía + escena de vida
  if (!pick) {
    const fallbackMap: Record<string, string> = {
      "25-35": "young adults lifestyle happy",
      "36-50": "adults professional smiling",
      "51-65": "mature couple relaxing outdoor",
    };
    pick = await searchPexels(fallbackMap[params.edadRango ?? ""] ?? "people lifestyle professional", apiKey, excludeSet);
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

  const prompt = buildAIPrompt(
    params.product,
    params.content,
    params.message,
    params.ficha,
    undefined, // brand = default
    {
      genero: params.genero,
      edadRango: params.edadRango,
      tipoPieza: params.tipoPieza,
      communicationType: params.communicationType,
      imageMode: params.imageMode,
    },
  );
  console.log(`[fal.ai] Flux Pro 1.1 Ultra — prompt (${prompt.length} chars): "${prompt.slice(0, 200)}..."`);

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
