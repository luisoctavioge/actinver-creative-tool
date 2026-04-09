// Generación / búsqueda de imagen de fondo para piezas Actinver
//
// DOS PROVEEDORES:
//   generateImageFromPexels → búsqueda de stock (Pexels)
//   generateImageWithAI     → generación con IA (Pollinations Flux)

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
// PEXELS — búsqueda de stock photography con deduplicación
// ─────────────────────────────────────────────────────────────────────────────
export async function generateImageFromPexels(params: ImageParams): Promise<ImageResult> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error("PEXELS_API_KEY no está configurada en .env.local");

  const query = await resolveSearchQuery(params.product, params.content);
  const page = Math.floor(Math.random() * 3) + 1;
  console.log(`[pexels] query: "${query}" page: ${page}`);

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=square&size=large&per_page=40&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Pexels error ${res.status}`);

  const data = await res.json() as {
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
// IA GENERATIVA — Pollinations (flux)
// Gratuito, sin API key. Google Imagen 3 requiere Vertex AI + billing.
// Cuando tengas acceso a Vertex AI, reemplaza este bloque.
// ─────────────────────────────────────────────────────────────────────────────
export async function generateImageWithAI(params: ImageParams): Promise<ImageResult> {
  const prompt = buildAIPrompt(params.product, params.content);
  const seed = Math.floor(Math.random() * 1_000_000);

  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=1080&height=1080&seed=${seed}&nologo=true&model=flux`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error al generar imagen con IA (${res.status})`);

  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = res.headers.get("content-type") ?? "image/jpeg";

  return { imageUrl: `data:${mimeType};base64,${base64}` };
}
