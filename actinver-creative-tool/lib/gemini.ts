// Construcción del prompt para generación de imagen con IA.
// - Si el producto matchea `sceneMap` de la brand config → usa esa escena.
// - Si NO matchea → pide a Groq que construya una escena contextual desde
//   la ficha, el mensaje del creador y el título. Así evitamos que todo
//   caiga al default "Mexico City skyline".
// - Soporta `excludeDescriptions`: descripciones de imágenes previas que
//   el usuario rechazó (feedback loop "otra imagen").

import OpenAI from "openai";
import { PieceContent } from "./templates";
import { ACTINVER_BRAND } from "./brand/actinver";
import type { BrandConfig } from "./brand/brand-config";
import { ProductFicha } from "./fichas";

export interface AIPromptContext {
  product: string;
  message?: string;
  ficha?: ProductFicha | null;
  content: PieceContent;
  excludeDescriptions?: string[];
  brand?: BrandConfig;
  compositionIndex?: number; // 0-N → rota entre ángulos de composición para máxima variedad
}

// Ángulos de composición que rotan en cada nueva generación AI.
// Garantizan que imágenes del mismo tema sean visualmente distintas.
// NOTA: ninguna opción debe generar personas de espaldas, trajes genéricos o skylines.
const COMPOSITION_ANGLES = [
  "Wide environmental shot with dramatic sky. Key element or object in lower third, vast atmospheric surroundings fill the frame. Epic scale.",
  "Macro close-up texture. Extreme close-up of a meaningful object: leather, paper, metal, marble, fabric. Rich surface detail, razor-sharp focus, shallow depth of field.",
  "Architectural geometry — no people. Clean lines of a modern or classical building: staircase, facade, corridor, vault. Strong graphic shapes, dramatic chiaroscuro light.",
  "Heroic low angle. Camera below looking up at a tall structure, object, or figure — commanding, monumental perspective. Deep sky in background.",
  "Luxury interior ambient — no people. High-end room: library, study, hotel lobby, boardroom empty. Architectural lines, warm and cool light contrast, absolute stillness.",
  "Light and reflection study. Light refracting through crystal glass, rippling water surface, or polished metal. Semi-abstract but intentional composition, editorial feel.",
  "Object in dramatic spotlight. A single meaningful object — pen, watch, compass, key, coin — precisely lit on a dark surface. Macro or medium shot. Subject is the only element.",
  "High angle overhead / flat lay. Camera directly above looking down at a curated scene: desk objects, documents, instruments, arranged on dark marble or wood.",
];

// Reglas base de estilo aplicadas a toda imagen AI (independiente de la escena).
function baseVisualRules(brand: BrandConfig): string {
  const { colors } = brand;
  return [
    // Calidad fotográfica
    "Ultra-high resolution professional photography. Shot on Phase One IQ4 150MP or Hasselblad H6D-400c. f/2.0-f/2.8 aperture. Tack-sharp focus on subject. Award-winning editorial photography quality. 8K ultra-detailed.",
    // Paleta de color y atmosfera
    `Dark moody cinematic tone: deep navy blue (${colors.secondary}) and rich black (${colors.primary}) absolutely dominant. Dramatic chiaroscuro lighting. Single key light. Rim lighting on edges. Subtle warm gold accents (${colors.accent}) used sparingly. No flat or evenly lit scenes.`,
    // PROHIBICIONES ABSOLUTAS — crítico para evitar clichés de IA
    "STRICTLY PROHIBITED — any of these will FAIL: people in business suits seen from behind, person with back to camera, generic city skyline or horizon line as main subject, corporate handshake, generic stock photo look, people looking at laptops or phones, meeting rooms with multiple people, fluorescent office lighting, American Eagle pose, AI-generated plastic skin quality. VIOLATING ANY PROHIBITION makes the image unusable.",
    // Sin texto, marcas ni UI de ningún tipo
    "Absolutely NO text of any kind, NO logos, NO brand names, NO signatures, NO watermarks, NO copyright marks, NO UI elements, NO charts, NO numbers, NO letters, NO words anywhere in the image. Any visible text or mark renders the image unusable.",
    // Framing multi-formato
    "WIDE CINEMATIC FRAMING for multi-format cropping: the main subject must fit within the central 55-60% of the frame with generous headroom above, footroom below, and safe margin on sides. The image will be cropped to vertical (9:16), square (1:1), horizontal (16:9) and portrait (3:4) — composition MUST survive all four crops.",
    // Estetica de marca
    "Premium, aspirational aesthetic. Luxury without ostentation. Timeless, not trendy. Mexican executive sensibility.",
  ].join(" ");
}

// Busca match en sceneMap; devuelve la escena rotada por compositionIndex.
// Cada entrada tiene múltiples escenas distintas para garantizar variedad real.
function matchScene(product: string, brand: BrandConfig, compositionIndex = 0): string | null {
  const p = product.toLowerCase();
  const match = brand.sceneMap.find(({ keywords }) =>
    keywords.some((kw) => p.includes(kw)),
  );
  if (!match) return null;
  const scenes = match.scenes;
  return scenes[compositionIndex % scenes.length];
}

/**
 * Pide a Groq que genere una escena visual contextual cuando no hay match
 * en el sceneMap. Usa ficha (si existe) + mensaje + título para que la
 * escena sea específica al producto, no un skyline genérico.
 */
async function buildContextualScene(ctx: AIPromptContext, apiKey: string): Promise<string> {
  const { product, message, ficha, content } = ctx;

  try {
    const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a world-class art director for a premium Mexican financial brand. You write cinematic scene descriptions (2-3 sentences, English) for AI image generation.

ABSOLUTE RULES — scenes must NEVER include:
- People in suits seen from behind or with back to camera
- Generic city skylines or horizon lines as background
- Corporate stock photo clichés (handshakes, meetings, laptops)
- Generic "executive in office" scenes

INSTEAD use creative, specific, visually striking alternatives such as:
- Close-up objects that SYMBOLIZE the product (a compass for direction, a key for security, coins for wealth, an hourglass for time)
- Dramatic architectural photography (empty luxury spaces, modernist geometry)
- Nature as metaphor (mountain summits, sea horizon at dusk, forest depth)
- Macro textures that suggest luxury (leather, marble, polished metal, aged paper)
- Abstract light studies (reflections, refractions, shadows with meaning)

Always dark/moody/editorial. Return ONLY the scene description — no preamble, no bullets, no quotes.`,
        },
        {
          role: "user",
          content: `Product: ${product}
${message ? `Creator message: ${message}` : ""}
${ficha ? `Product context: ${ficha.descripcion} · Target audience: ${ficha.publicoObjetivo}` : ""}
${content.title ? `Piece title: "${content.title}"` : ""}

Write a visually SURPRISING and SPECIFIC cinematic scene (2-3 sentences, English) for this product. Think symbolically — use objects, architecture, nature, or light instead of generic corporate people. Be concrete and evocative.`,
        },
      ],
      max_tokens: 140,
      temperature: 0.85,
    });
    const raw = response.choices[0]?.message?.content?.trim() ?? "";
    return raw.replace(/^["']|["']$/g, "") ||
      "Mexican executive in a modern office at night, deep blue cinematic tones, photorealistic";
  } catch {
    return "Mexican executive in a modern office at night, deep blue cinematic tones, photorealistic";
  }
}

/**
 * Construye el prompt final para la imagen AI. Si no se pasa apiKey,
 * opera en modo "solo sceneMap" (sin fallback a Groq).
 */
export async function buildAIPrompt(
  ctx: AIPromptContext,
  apiKey?: string,
): Promise<string> {
  const brand = ctx.brand ?? ACTINVER_BRAND;
  const matched = matchScene(ctx.product, brand, ctx.compositionIndex ?? 0);

  let scene: string;
  if (matched) {
    scene = matched;
  } else if (apiKey) {
    scene = await buildContextualScene(ctx, apiKey);
  } else {
    scene = "Mexican professional in a high-end environment at night, deep blue cinematic tones, photorealistic";
  }

  const mood = ctx.content.title ? `Visual mood (not as text): "${ctx.content.title}".` : "";

  const avoid = ctx.excludeDescriptions?.length
    ? `Avoid repeating these previously generated concepts: ${ctx.excludeDescriptions.map((d) => `"${d}"`).join(", ")}. Use a clearly different composition, subject or setting.`
    : "";

  // Composición rotativa para máxima variedad entre generaciones.
  const compIdx = (ctx.compositionIndex ?? 0) % COMPOSITION_ANGLES.length;
  const composition = `REQUIRED SHOT TYPE: ${COMPOSITION_ANGLES[compIdx]}`;

  return [scene + ".", composition, baseVisualRules(brand), mood, avoid]
    .filter(Boolean)
    .join(" ")
    .trim();
}
