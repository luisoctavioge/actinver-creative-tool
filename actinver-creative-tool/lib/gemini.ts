// Construcción del prompt para generación de imagen con IA (fal.ai Flux Pro)
//
// Usa la ficha del producto, el mensaje del usuario, el copy generado y las
// reglas visuales del brandbook para crear un prompt fotorrealista, contextual
// y único en cada generación.

import { PieceContent } from "./templates";
import { ACTINVER_BRAND } from "./brand/actinver";
import type { BrandConfig } from "./brand/brand-config";
import type { ProductFicha } from "./fichas";

// ─── Variación visual ───────────────────────────────────────────────────────
// Se elige aleatoriamente uno de estos modificadores en cada llamada para
// que el mismo producto + mensaje produzca imágenes distintas.

const CAMERA_ANGLES = [
  "shot from a slightly low angle for a powerful, commanding feel",
  "captured at eye level for an intimate, editorial perspective",
  "wide establishing shot with depth and context",
  "close-up environmental portrait, shallow depth of field",
  "dramatic three-quarter view with rim lighting",
  "overhead detail shot focusing on hands, objects, textures",
  "silhouette composition with backlighting through windows or architecture",
  "candid moment with natural movement and energy",
];

const LIGHTING_MOODS = [
  "deep cinematic blue lighting with single warm accent",
  "golden hour backlight streaming through glass",
  "high-contrast chiaroscuro with dramatic shadows",
  "cool ambient light with warm practical lights in frame",
  "moody side-lit scene, strong directional shadows",
  "subtle god rays piercing through architectural elements",
  "twilight atmosphere, city transitioning from day to night",
  "studio-quality rim light separating subject from dark background",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Scene resolution ────────────────────────────────────────────────────────
// Primero intenta matchear por keywords del sceneMap de la marca.
// Si no encuentra, genera una escena basada en la ficha.

function resolveScene(
  product: string,
  ficha: ProductFicha | null,
  brand: BrandConfig,
): string {
  const p = product.toLowerCase();
  const match = brand.sceneMap.find(({ keywords }) =>
    keywords.some((kw) => p.includes(kw)),
  );

  if (match) return match.scene;

  // Fallback inteligente basado en la ficha
  if (ficha) {
    const cat = ficha.categoria.toLowerCase();
    if (cat.includes("inversión") || cat.includes("inversiones")) {
      return "Mexican executive in high-rise office analyzing financial data on screens, floor-to-ceiling windows with city skyline at night, dramatic cinematic blue lighting, photorealistic";
    }
    if (cat.includes("protección") || cat.includes("seguro")) {
      return "Mexican family in elegant modern home, warm golden light, intimate protective moment, dark cinematic background, photorealistic";
    }
    if (cat.includes("planeación") || cat.includes("retiro")) {
      return "Accomplished professional on a luxury terrace overlooking a vast city at sunset, sense of freedom and contemplation, warm-to-dark cinematic tones, photorealistic";
    }
  }

  // Último recurso: escena genérica Actinver
  return "Mexico City skyline at night from above, cinematic aerial perspective, deep navy blue and black tones, city lights, premium financial brand atmosphere, photorealistic";
}

// ─── buildAIPrompt ───────────────────────────────────────────────────────────
// Construye un prompt completo para fal.ai Flux Pro 1.1 Ultra.
//
// Entradas:
//   product — nombre del producto (string del brief)
//   content — título, descripción y CTA generados
//   message — mensaje clave del usuario (lo que quiere comunicar)
//   ficha   — ficha del producto (opcional, con descripción y beneficios)
//   brand   — configuración de marca (default: Actinver)

export function buildAIPrompt(
  product: string,
  content: PieceContent,
  message?: string,
  ficha?: ProductFicha | null,
  brand: BrandConfig = ACTINVER_BRAND,
): string {
  const { colors } = brand;

  // 1. Escena base del sceneMap o ficha
  const scene = resolveScene(product, ficha ?? null, brand);

  // 2. Variación aleatoria
  const camera   = pickRandom(CAMERA_ANGLES);
  const lighting = pickRandom(LIGHTING_MOODS);

  // 3. Contexto narrativo — qué debe evocar la imagen
  const narrativeParts: string[] = [];

  if (message && message.trim()) {
    narrativeParts.push(`The image must visually evoke: "${message.trim()}".`);
  }

  if (content.title && content.title.trim()) {
    narrativeParts.push(`Visual mood inspired by the headline: "${content.title}".`);
  }

  if (ficha) {
    // Traducir el tono de la ficha a dirección visual
    const tonoParts = ficha.tono.split(",").map((t) => t.trim().toLowerCase());
    const toneDirections: Record<string, string> = {
      "seguro":       "convey stability and trust",
      "aspiracional": "feel ambitious and premium",
      "empoderador":  "show strength and confidence",
      "protector":    "evoke warmth and safety",
      "reflexivo":    "create a contemplative, forward-looking atmosphere",
      "motivador":    "inspire action and determination",
      "sofisticado":  "appear refined, worldly, and elegant",
      "global":       "suggest international scope and reach",
      "estratégico":  "imply intelligence and deliberate planning",
      "accesible":    "feel approachable yet professional",
      "profesional":  "radiate competence and expertise",
      "cercano":      "feel warm, intimate, and trustworthy",
      "confiable":    "project reliability and dependability",
      "conocedor":    "suggest deep knowledge and mastery",
    };

    const toneInstructions = tonoParts
      .map((t) => toneDirections[t])
      .filter(Boolean);

    if (toneInstructions.length > 0) {
      narrativeParts.push(`The image must ${toneInstructions.join(" and ")}.`);
    }

    // Agregar contexto del público objetivo
    if (ficha.publicoObjetivo) {
      narrativeParts.push(
        `Target audience context: ${ficha.publicoObjetivo}. The scene should resonate with this demographic.`,
      );
    }

    // Agregar beneficios como pistas visuales
    if (ficha.beneficios && ficha.beneficios.length > 0) {
      const topBenefits = ficha.beneficios.slice(0, 2).join(", ");
      narrativeParts.push(
        `Key product benefits to suggest visually (not as text): ${topBenefits}.`,
      );
    }
  }

  const narrativeBlock = narrativeParts.length > 0
    ? narrativeParts.join(" ")
    : "";

  // 4. Reglas del brandbook (invariantes)
  const brandRules = [
    "Photorealistic, extremely high resolution, 8K quality, cinematic.",
    `Dominant palette: deep navy blue (${colors.secondary}), rich black (${colors.primary}).`,
    `Subtle warm accent light in golden tone (${colors.accent}) — used sparingly as rim light or reflections, never dominant.`,
    "Absolutely NO text, NO logos, NO watermarks, NO UI elements, NO overlays.",
    "Full-bleed composition optimized for social media with overlaid text.",
    "Leave breathing room — darker areas at bottom third and edges for text overlay.",
    "Premium, trustworthy, aspirational Mexican financial brand aesthetic.",
    "NOT stock-photo generic. Must feel editorial, specific, intentional.",
  ].join(" ");

  // 5. Ensamblar prompt final
  return [
    scene,
    `Camera: ${camera}.`,
    `Lighting: ${lighting}.`,
    narrativeBlock,
    brandRules,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}
