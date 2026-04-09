// Construcción del prompt para generación de imagen con IA
// Usa el sceneMap de la brand config activa

import { PieceContent } from "./templates";
import { ACTINVER_BRAND } from "./brand/actinver";
import type { BrandConfig } from "./brand/brand-config";

export function buildAIPrompt(product: string, content: PieceContent, brand: BrandConfig = ACTINVER_BRAND): string {
  const p = product.toLowerCase();
  const match = brand.sceneMap.find(({ keywords }) => keywords.some((kw) => p.includes(kw)));

  const scene = match?.scene ??
    "Mexico City skyline at night from above, cinematic aerial perspective, deep navy blue and black tones, city lights, premium financial brand, photorealistic";

  const { colors } = brand;
  const baseRules = [
    "Photorealistic, high resolution, cinematic quality.",
    `Dark moody tone: deep navy blue (${colors.secondary}) and rich black (${colors.primary}) dominant.`,
    `Dramatic lighting with rim light and subtle golden accents (${colors.accent}).`,
    "Absolutely NO text, NO logos, NO UI elements, NO watermarks.",
    "Full-bleed square composition.",
    "Premium, trustworthy, aspirational financial brand aesthetic.",
  ].join(" ");

  const mood = content.title ? `Visual mood (not as text): "${content.title}".` : "";

  return `${scene}. ${baseRules} ${mood}`.trim();
}
