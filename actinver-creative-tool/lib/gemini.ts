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
// Construye la escena base combinando:
//   1. El mensaje del usuario (máxima prioridad — dice qué quiere comunicar)
//   2. La demografía objetivo (quién aparece en la foto)
//   3. La ficha del producto (contexto de categoría)
//   4. El sceneMap de la marca como último recurso

function resolveScene(
  product: string,
  ficha: ProductFicha | null,
  brand: BrandConfig,
  message?: string,
  context?: {
    genero?: string;
    edadRango?: string;
    tipoPieza?: string;
    communicationType?: string;
  },
): string {
  // Mapas de traducción para demografía → descripción visual de personas
  const ageScene: Record<string, string> = {
    "25-35": "young Mexican adults in their late twenties or early thirties",
    "36-50": "Mexican professionals in their forties",
    "51-65": "mature Mexican adults in their fifties or sixties",
  };
  const genderScene: Record<string, string> = {
    "hombre": "man",
    "mujer":  "woman",
    "ambos":  "man and woman",
  };

  const who = [
    genderScene[context?.genero ?? ""] ?? "",
    ageScene[context?.edadRango ?? ""] ?? "",
  ].filter(Boolean).join(", ");

  // Si hay un mensaje del usuario, construir la escena a partir de él
  if (message?.trim()) {
    const msg = message.trim().toLowerCase();

    // Detectar palabras clave del mensaje para elegir la escena emocional correcta
    const isRetirement = /retiro|ppr|pensión|jubil|futuro|vejez|largo plazo/i.test(msg + product);
    const isYouthful   = /jóvenes?|joven|millenni|empezar|desde joven|temprano/i.test(msg);
    const isFamily     = /familia|hijos?|pareja|matrimonio|hogar/i.test(msg);
    const isProtection = /proteg|seguro|cuidar|blindar/i.test(msg + product);
    const isGrowth     = /crec|patrimoni|invert|rendimiento|multiplica/i.test(msg + product);
    const isInternal   = context?.communicationType === "internal";

    if (isRetirement && isYouthful && who) {
      return `${who} sitting outdoors in a park or rooftop in Mexico City, looking thoughtfully into the distance, cinematic mood, soft natural light, contemplating their future, photorealistic`;
    }
    if (isRetirement && who) {
      return `${who} in a serene outdoor setting — beach, garden or terrace — relaxed and fulfilled, warm cinematic light, enjoying life without financial worries, photorealistic`;
    }
    if (isFamily && who) {
      return `${who} sharing a warm family moment at home or outdoors, golden natural light, emotional and intimate scene, cinematic color grade, photorealistic`;
    }
    if (isProtection && who) {
      return `${who} in a calm, safe home environment, soft warm light, sense of security and peace, cinematic atmosphere, photorealistic`;
    }
    if (isGrowth && who) {
      return `${who} with a confident, forward-looking expression, modern urban setting, cinematic dramatic lighting, sense of ambition and achievement, photorealistic`;
    }
    if (isInternal) {
      return `Professional team in a modern Mexican office, collaborative environment, clean cinematic lighting, photorealistic`;
    }
  }

  // Fallback: sceneMap estático de la marca
  const p = product.toLowerCase();
  const match = brand.sceneMap.find(({ keywords }) =>
    keywords.some((kw) => p.includes(kw)),
  );
  if (match) {
    // Enriquecer con demografía si está disponible
    if (who) return `${match.scene}. The subject is ${who}.`;
    return match.scene;
  }

  // Fallback por categoría de ficha
  if (ficha) {
    const cat = ficha.categoria.toLowerCase();
    const subject = who ? `${who}` : "Mexican professional";
    if (cat.includes("retiro") || cat.includes("planeación")) {
      return `${subject} outdoors at sunset, contemplative mood, sense of freedom and future, cinematic warm tones, photorealistic`;
    }
    if (cat.includes("inversión")) {
      return `${subject} in a modern setting, confident expression, cinematic blue tones, photorealistic`;
    }
    if (cat.includes("protección")) {
      return `${subject} in a warm home setting, sense of security, cinematic light, photorealistic`;
    }
  }

  // Último recurso
  const subject = who ? `${who}` : "Mexican professional";
  return `${subject} in an aspirational outdoor setting in Mexico, cinematic blue and warm tones, photorealistic`;
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
  context?: {
    genero?: string;
    edadRango?: string;
    tipoPieza?: string;
    communicationType?: string;
    imageMode?: string;
  },
): string {
  const { colors } = brand;
  const imageMode = context?.imageMode ?? "auto";

  // 1. Escena base — depende del imageMode
  let scene: string;

  if (imageMode === "product-hero") {
    // Modo Producto: la imagen DEBE mostrar el producto/tema como sujeto principal
    scene = `Product hero shot of "${product}". The product or its physical representation is the main subject, filling 60-70% of the frame. Studio-quality product photography with dramatic lighting, dark background. Close-up or medium shot. Think Apple product launch imagery or Bloomberg editorial photos. Photorealistic, ultra-detailed.`;
  } else if (imageMode === "abstract") {
    // Modo Abstracto: formas geométricas 3D, texturas, sin personas
    scene = `Abstract 3D geometric shapes and forms, dark metallic surfaces with subtle golden reflections, futuristic financial technology aesthetic, deep navy and black environment, volumetric lighting, no people, no products, purely abstract and elegant, photorealistic 3D render quality.`;
  } else if (imageMode === "lifestyle") {
    // Modo Lifestyle: personas reales en situación auténtica
    scene = resolveScene(product, ficha ?? null, brand, message, context);
  } else {
    // Modo Auto: la función resolveScene decide la escena más apropiada
    scene = resolveScene(product, ficha ?? null, brand, message, context);
  }

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

  // Context from v2 brief parameters
  if (context) {
    // Demographic direction — use concrete, realistic age descriptors (not "professional" stereotypes)
    if (context.genero || context.edadRango) {
      const genderMap: Record<string, string> = {
        "hombre": "man",
        "mujer":  "woman",
        "ambos":  "man and woman, or mixed group",
      };
      const ageMap: Record<string, string> = {
        "25-35": "visibly young, late twenties to early thirties — NOT a suit-wearing executive",
        "36-50": "mid-career adult, forties appearance",
        "51-65": "visibly mature, fifties to early sixties",
      };
      const demo = genderMap[context.genero ?? ""] ?? "";
      const age  = ageMap[context.edadRango ?? ""] ?? "";
      if (demo || age) {
        narrativeParts.push(
          `People visible in the scene MUST appear as: ${[demo, age].filter(Boolean).join(", ")}. This is non-negotiable.`,
        );
      }
    }

    // Piece type visual direction
    if (context.tipoPieza) {
      const pieceMap: Record<string, string> = {
        "educativa":     "Clean, informative composition with structured lighting. Educational tone — clarity and trust.",
        "promo":         "Bold, energetic, high-impact composition. Promotional tone — urgency and excitement.",
        "institucional": "Premium, corporate, understated elegance. Institutional tone — authority and prestige.",
      };
      const pieceDir = pieceMap[context.tipoPieza];
      if (pieceDir) narrativeParts.push(pieceDir);
    }

    // Communication type context
    if (context.communicationType === "internal") {
      narrativeParts.push("This is for internal corporate communication — office environment, workplace, team settings are appropriate.");
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
