// Generación de copy para piezas Actinver usando Groq (Llama 3.3 70B).
// - Consulta lib/brand/narrativa.md en cada llamada como fuente de verdad de marca.
// - Si el producto coincide con una ficha en lib/fichas/*.json, inyecta sus
//   beneficios, público objetivo y tono al prompt para copy más específico.
// - Añade guía específica por tipoPieza (educativa / promo / institucional).

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import {
  CreatorInput,
  PieceContent,
  ChannelCaption,
  SocialChannel,
  CAPTION_LIMITS,
  TipoPieza,
} from "./templates";
import { findFichaByProduct, ProductFicha } from "./fichas";

// Modelo principal — 70B para mejor tono y especificidad.
const MODEL = "llama-3.3-70b-versatile";

function loadNarrativa(): string {
  const filePath = path.join(process.cwd(), "lib/brand/narrativa.md");
  return fs.readFileSync(filePath, "utf-8");
}

// ── Guía por tipo de pieza ───────────────────────────────────────────────────
function tipoPiezaGuidance(tipo: TipoPieza): string {
  switch (tipo) {
    case "educativa":
      return `TIPO: EDUCATIVA
- Aporta un dato, principio o criterio útil sobre el tema. Enseña, no vendas.
- El título puede ser pregunta o afirmación con aire didáctico.
- La descripción aclara un concepto o da contexto práctico.
- El CTA invita a profundizar ("Conoce más", "Entiende cómo funciona").`;
    case "promo":
      return `TIPO: PROMO
- Destaca un beneficio concreto del producto. Directa, sin ambigüedad.
- El título comunica la ventaja principal del producto.
- La descripción da una razón fuerte de por qué actuar ahora.
- El CTA es imperativo de conversión ("Empieza a invertir", "Abre tu cuenta", "Solicita tu cotización").
- OBLIGATORIO: el campo "highlight" es una frase corta (≤60 chars) que resalta la OFERTA o VENTAJA DIFERENCIAL. Algo como "Sin comisiones el primer año" o "Cobertura desde $X al mes". Directo, concreto, que se lea de un vistazo.`;
    case "institucional":
      return `TIPO: INSTITUCIONAL
- Proyecta solidez, trayectoria y carácter de Actinver. Aspiracional.
- El título es una afirmación de marca o visión (sin vender producto directamente).
- La descripción refuerza la promesa institucional (30+ años, respaldo, asesoría).
- El CTA abre conversación, no cierra venta ("Conversemos", "Agenda tu cita", "Conoce Actinver").`;
  }
}

// ── Bloque de ficha inyectado al prompt ──────────────────────────────────────
function fichaBlock(ficha: ProductFicha | null): string {
  if (!ficha) return "";
  const lines = [
    `FICHA DE PRODUCTO (usa esta información como fuente de verdad):`,
    `- Nombre: ${ficha.nombre}`,
    `- Categoría: ${ficha.categoria}`,
    `- Descripción: ${ficha.descripcion}`,
    `- Mensajes clave / beneficios: ${ficha.beneficios.map((b) => `"${b}"`).join(", ")}`,
    `- Público objetivo: ${ficha.publicoObjetivo}`,
    `- Tono de marca: ${ficha.tono}`,
  ];
  if (ficha.taglines?.length)
    lines.push(`- Taglines oficiales (úsalos como inspiración): ${ficha.taglines.slice(0, 3).map((t) => `"${t}"`).join(", ")}`);
  if (ficha.emotionalTriggers?.length)
    lines.push(`- Detonadores emocionales del producto: ${ficha.emotionalTriggers.join(", ")}`);
  if (ficha.prohibitedClaims?.length)
    lines.push(`- PROHIBIDO incluir en el copy: ${ficha.prohibitedClaims.join(" / ")}`);
  return lines.join("\n");
}

// ── Audiencia en texto ───────────────────────────────────────────────────────
function audienciaLine(input: CreatorInput): string {
  const genero =
    input.genero === "ambos"
      ? "Hombres y mujeres"
      : input.genero === "hombre"
        ? "Hombres"
        : "Mujeres";
  return `${genero}, edad ${input.edadRango} años`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 variantes con tonos distintos
// ─────────────────────────────────────────────────────────────────────────────
export async function generateVariants(
  input: CreatorInput,
  apiKey: string
): Promise<PieceContent[]> {
  const narrativa = loadNarrativa();
  const ficha = findFichaByProduct(input.product);
  const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `Eres el copywriter senior de Actinver. Guías de marca:\n\n${narrativa}\n\nResponde ÚNICAMENTE con JSON puro, sin markdown.`,
      },
      {
        role: "user",
        content: `Genera 3 variantes de copy con TONOS DIFERENTES para el mismo brief.
- Variante 1: más racional / directa al beneficio concreto.
- Variante 2: más aspiracional / emocional.
- Variante 3: más curiosa / pregunta retórica o dato impactante.

Brief:
- Producto: ${input.product}
- Mensaje del creador: ${input.message || "Generar interés y consideración de marca"}
- Audiencia: ${audienciaLine(input)}
- Incluir CTA explícito: ${input.conCTA !== false ? "Sí" : "No — retorna cta como cadena vacía"}

${fichaBlock(ficha)}

${tipoPiezaGuidance(input.tipoPieza)}

REGLA CRÍTICA: El título debe mencionar directamente el producto o su beneficio principal. Nada de metáforas genéricas tipo "haz crecer tu dinero" sin contexto del producto.

CAMPO HIGHLIGHT: En cada variante incluye un campo "highlight" (≤60 chars) con la frase más impactante para destacar visualmente (tipo chip o etiqueta en la pieza). Para Promo es la oferta concreta; para Educativa es el dato o idea clave; para Institucional es la promesa de marca más directa.

Devuelve exactamente:
{
  "variants": [
    { "title": "máx 48 chars", "description": "máx 180 chars", "cta": "máx 30 chars", "highlight": "máx 60 chars" },
    { "title": "máx 48 chars", "description": "máx 180 chars", "cta": "máx 30 chars", "highlight": "máx 60 chars" },
    { "title": "máx 48 chars", "description": "máx 180 chars", "cta": "máx 30 chars", "highlight": "máx 60 chars" }
  ]
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.95,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { variants?: PieceContent[] };
  const variants = parsed.variants ?? [];
  return variants.slice(0, 3).map((v) => ({
    title:       String(v.title       ?? "").slice(0, 48),
    description: String(v.description ?? "").slice(0, 180),
    cta:         String(v.cta         ?? "").slice(0, 30),
    highlight:   String(v.highlight   ?? "").slice(0, 60),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Regenerar un solo campo
// ─────────────────────────────────────────────────────────────────────────────
export async function regenerateSingleField(
  field: keyof PieceContent,
  input: CreatorInput,
  current: PieceContent,
  apiKey: string
): Promise<string> {
  const narrativa = loadNarrativa();
  const ficha = findFichaByProduct(input.product);
  const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

  const fieldSpec: Record<keyof PieceContent, string> = {
    title:       "máx 48 caracteres, impactante y directo — DEBE mencionar el producto o su beneficio principal",
    description: "máx 180 caracteres, complementa el título con un dato/beneficio concreto, sin repetir palabras del título",
    cta:         "máx 30 caracteres, verbo imperativo, en español, sin punto final",
    highlight:   "máx 60 caracteres, frase de impacto para resaltar visualmente (chip en la pieza)",
  };
  const spec = fieldSpec[field];

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `Eres el copywriter senior de Actinver. Guías de marca:\n\n${narrativa}\n\nResponde ÚNICAMENTE con JSON puro.`,
      },
      {
        role: "user",
        content: `Regenera SOLO el campo "${field}" para una pieza de social media. Dame una alternativa distinta al contenido actual (tono o ángulo diferente).

Brief:
- Producto: ${input.product}
- Mensaje: ${input.message || "Generar interés y consideración de marca"}
- Audiencia: ${audienciaLine(input)}

${fichaBlock(ficha)}

${tipoPiezaGuidance(input.tipoPieza)}

Contenido actual (para contexto, NO repetir ni parafrasear):
- title: "${current.title}"
- description: "${current.description}"
- cta: "${current.cta}"

Devuelve exactamente: { "${field}": "${spec}" }`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.9,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Record<string, string>;
  const limits: Record<keyof PieceContent, number> = { title: 48, description: 180, cta: 30, highlight: 60 };
  return String(parsed[field] ?? "").slice(0, limits[field]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Contenido principal de la pieza
// ─────────────────────────────────────────────────────────────────────────────
export async function generatePieceContent(
  input: CreatorInput,
  apiKey: string
): Promise<PieceContent> {
  const narrativa = loadNarrativa();
  const ficha = findFichaByProduct(input.product);

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const response = await client.chat.completions.create({
    model: MODEL,
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
- Mensaje del creador: ${input.message || "Generar interés y consideración de marca"}
- Audiencia: ${audienciaLine(input)}
- Incluir CTA explícito: ${input.conCTA !== false ? "Sí" : "No — retorna cta como cadena vacía"}

${fichaBlock(ficha)}

${tipoPiezaGuidance(input.tipoPieza)}

REGLAS CRÍTICAS:
- Título y descripción DEBEN hablar DIRECTAMENTE sobre "${input.product}". Nada de metáforas vagas.
- Si hay mensaje del creador, úsalo como ángulo principal del copy — no lo ignores.
- Si hay ficha, apóyate en sus beneficios y público para el tono.
- Sin signos de exclamación, sin emojis, sin palabras prohibidas (ver narrativa).

CAMPO HIGHLIGHT: Incluye un campo "highlight" (≤60 chars) con la frase más impactante para destacar visualmente (chip/etiqueta en la pieza). Para Promo es la oferta o ventaja concreta; para Educativa es el dato/idea clave; para Institucional es la promesa de marca más directa.

Devuelve exactamente este JSON (respeta los límites de caracteres):
{
  "title": "máx 48 caracteres — específico sobre ${input.product}",
  "description": "máx 180 caracteres, complementa el título con beneficio/dato concreto",
  "cta": "máx 30 caracteres, verbo imperativo",
  "highlight": "máx 60 caracteres, frase de impacto para resaltar visualmente"
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.75,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as PieceContent;

  return {
    title:       String(parsed.title       ?? "").slice(0, 48),
    description: String(parsed.description ?? "").slice(0, 180),
    cta:         String(parsed.cta         ?? "").slice(0, 30),
    highlight:   String((parsed as PieceContent).highlight ?? "").slice(0, 60),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Captions por canal social
// ─────────────────────────────────────────────────────────────────────────────

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
  const ficha = findFichaByProduct(input.product);
  const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

  const channels = input.channels;
  if (channels.length === 0) return [];

  const channelInstructions = channels.map((ch) => `- ${CHANNEL_RULES[ch]}`).join("\n");

  const response = await client.chat.completions.create({
    model: MODEL,
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
- Mensaje del creador: ${input.message || "Generar interés y consideración de marca"}
- Audiencia: ${audienciaLine(input)}

${fichaBlock(ficha)}

${tipoPiezaGuidance(input.tipoPieza)}

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
    temperature: 0.8,
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
