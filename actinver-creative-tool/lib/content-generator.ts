// Generación de copy para piezas Actinver usando Groq (Llama 3)
// Consulta lib/brand/narrativa.md en cada llamada como fuente de verdad de marca

import OpenAI from "openai";
import { CreatorInput, PieceContent, ChannelCaption, SocialChannel, CAPTION_LIMITS } from "./templates";
import { NARRATIVA } from "./brand/narrativa";

function loadNarrativa(): string {
  return NARRATIVA;
}

export async function generateVariants(
  input: CreatorInput,
  apiKey: string
): Promise<PieceContent[]> {
  const narrativa = loadNarrativa();
  const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `Eres el copywriter senior de Actinver. Guías de marca:\n\n${narrativa}\n\nResponde ÚNICAMENTE con JSON puro, sin markdown.`,
      },
      {
        role: "user",
        content: `Genera 3 variantes de copy diferentes para este brief. Cada variante debe tener tono distinto.

Brief:
- Producto: ${input.product}
- Objetivo y mensaje: ${input.message || "Generar interés y consideración de marca"}
- Audiencia: ${(input.genero ?? "ambos") === "ambos" ? "Hombres y mujeres" : (input.genero ?? "ambos") === "hombre" ? "Hombres" : "Mujeres"}, edad ${input.edadRango ?? "36-50"} años
- Tipo de pieza: ${input.tipoPieza ?? "educativa"}
- Incluir CTA explícito: ${input.conCTA !== false ? "Sí" : "No — retorna cta como cadena vacía"}

REGLA CTA CRÍTICA: El CTA debe ser una frase completa de mínimo 15 caracteres con verbo + objeto. NUNCA una sola palabra o sílaba como "Sí", "Listo" o "Más info". Si el título es una pregunta, el CTA responde con una acción completa (ej. "Sí, quiero conocer más", "Empieza a invertir hoy").

Devuelve exactamente:
{
  "variants": [
    { "title": "máx 48 chars", "description": "máx 180 chars", "cta": "entre 15 y 30 chars, frase completa" },
    { "title": "máx 48 chars", "description": "máx 180 chars", "cta": "entre 15 y 30 chars, frase completa" },
    { "title": "máx 48 chars", "description": "máx 180 chars", "cta": "entre 15 y 30 chars, frase completa" }
  ]
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.9,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { variants?: PieceContent[] };
  const variants = parsed.variants ?? [];
  return variants.slice(0, 3).map((v) => ({
    title:       String(v.title       ?? "").slice(0, 48),
    description: String(v.description ?? "").slice(0, 180),
    cta:         String(v.cta         ?? "").slice(0, 30),
  }));
}

export async function regenerateSingleField(
  field: keyof PieceContent,
  input: CreatorInput,
  current: PieceContent,
  apiKey: string
): Promise<string> {
  const narrativa = loadNarrativa();
  const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

  const fieldSpec = {
    title:       "máx 48 caracteres, impactante y directo",
    description: "máx 180 caracteres, complementa el título sin repetirlo",
    cta:         "entre 15 y 30 caracteres, frase completa con verbo + objeto. NUNCA una sola palabra. Si el título es pregunta, responde con acción completa.",
  }[field];

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `Eres el copywriter senior de Actinver. Guías de marca:\n\n${narrativa}\n\nResponde ÚNICAMENTE con JSON puro.`,
      },
      {
        role: "user",
        content: `Regenera SOLO el campo "${field}" para una pieza de social media.

Brief:
- Producto: ${input.product}
- Objetivo y mensaje: ${input.message || "Generar interés y consideración de marca"}

Contenido actual (para contexto, no repetir):
- title: "${current.title}"
- description: "${current.description}"
- cta: "${current.cta}"

Devuelve exactamente: { "${field}": "${fieldSpec}" }`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.85,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Record<string, string>;
  const limits = { title: 48, description: 180, cta: 30 };
  return String(parsed[field] ?? "").slice(0, limits[field]);
}

export async function generatePieceContent(
  input: CreatorInput,
  apiKey: string
): Promise<PieceContent> {
  const narrativa = loadNarrativa();

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `Eres el copywriter senior de Actinver.
Aquí están las guías de marca que debes seguir estrictamente:

${narrativa}

Responde ÚNICAMENTE con JSON puro, sin markdown ni bloques de código.`,
      },
      {
        role: "user",
        content: `Genera el copy para una pieza de social media con este brief:

- Producto o tema: ${input.product}
- Objetivo y mensaje: ${input.message || "Generar interés y consideración de marca"}
- Audiencia: ${(input.genero ?? "ambos") === "ambos" ? "Hombres y mujeres" : (input.genero ?? "ambos") === "hombre" ? "Hombres" : "Mujeres"}, edad ${input.edadRango ?? "36-50"} años
- Tipo de pieza: ${input.tipoPieza ?? "educativa"}
- Incluir CTA explícito: ${input.conCTA !== false ? "Sí" : "No — retorna cta como cadena vacía"}

REGLA CRÍTICA: El título y descripción DEBEN hablar DIRECTAMENTE y LITERALMENTE sobre "${input.product}".
Si el producto es "Seguro de auto", el título debe mencionar el auto o el seguro. NUNCA uses metáforas de negocio si el producto es de consumo personal.

REGLA CTA CRÍTICA: El CTA debe ser una frase completa de mínimo 15 caracteres con verbo + objeto. NUNCA una sola palabra o sílaba como "Sí", "Listo" o "Más info". Si el título es una pregunta, el CTA responde con una acción completa (ej. "Sí, quiero conocer más", "Empieza a invertir hoy").

Devuelve exactamente este JSON (respeta los límites de caracteres):
{
  "title": "máx 48 caracteres — específico sobre ${input.product}",
  "description": "máx 180 caracteres, no repitas el título",
  "cta": "entre 15 y 30 caracteres, frase completa con verbo + acción"
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as PieceContent;

  return {
    title:       String(parsed.title       ?? "").slice(0, 48),
    description: String(parsed.description ?? "").slice(0, 180),
    cta:         String(parsed.cta         ?? "").slice(0, 30),
  };
}

// ── Generación de captions por canal social ──────────────────────────────────

const CHANNEL_RULES: Record<SocialChannel, string> = {
  instagram: `Instagram: Tono cercano, aspiracional, visual. 150–300 caracteres ideales. Incluye 5–8 hashtags (mix de marca + tema + descubrimiento). Separa hashtags con un salto de línea. NO incluyas links (IG no los hace clickeables en posts). Usa oraciones cortas, fragmentos impactantes.`,
  linkedin: `LinkedIn: Tono profesional, de thought-leadership. 300–600 caracteres ideales. Incluye 3–5 hashtags profesionales/de industria. Las primeras 2 líneas son el HOOK (es lo que se ve antes del "ver más"). Oraciones completas, puedes mencionar contexto de negocio.`,
  x: `X (Twitter): Tono directo, conciso, con punch. El caption + hashtags DEBEN caber en 280 caracteres TOTAL. Máximo 1–2 hashtags embebidos en el texto. Una sola idea fuerte. Puede ser pregunta retórica o afirmación contundente.`,
  facebook: `Facebook: Tono conversacional, accesible, ligeramente más relajado que LinkedIn. 200–400 caracteres ideales. 2–4 hashtags. Puede ser más narrativo. Las preguntas funcionan bien como hook.`,
};

export async function generateCaptions(
  input: CreatorInput,
  pieceContent: PieceContent,
  apiKey: string
): Promise<ChannelCaption[]> {
  const narrativa = loadNarrativa();
  const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

  const channels = input.channels;
  if (channels.length === 0) return [];

  const channelInstructions = channels
    .map((ch) => `- ${CHANNEL_RULES[ch]}`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `Eres el community manager senior de Actinver. Guías de marca:\n\n${narrativa}\n\nGenera el copy de publicación (caption) que acompaña a una pieza gráfica. El caption NO va dentro de la imagen — es el texto del post en la red social.\n\nResponde ÚNICAMENTE con JSON puro, sin markdown.`,
      },
      {
        role: "user",
        content: `Genera captions para cada canal indicado.

Brief:
- Producto: ${input.product}
- Objetivo y mensaje: ${input.message || "Generar interés y consideración de marca"}

La pieza gráfica que acompaña el post dice:
- Título: "${pieceContent.title}"
- Descripción: "${pieceContent.description}"
- CTA: "${pieceContent.cta}"

Canales y reglas:
${channelInstructions}

Devuelve exactamente:
{
  "captions": [
    ${channels.map((ch) => `{ "channel": "${ch}", "caption": "texto del post", "hashtags": "#Hashtag1 #Hashtag2" }`).join(",\n    ")}
  ]
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.75,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { captions?: ChannelCaption[] };
  const captions = parsed.captions ?? [];

  return captions
    .filter((c) => channels.includes(c.channel))
    .map((c) => ({
      channel:  c.channel,
      caption:  String(c.caption  ?? "").slice(0, CAPTION_LIMITS[c.channel]),
      hashtags: String(c.hashtags ?? ""),
    }));
}
