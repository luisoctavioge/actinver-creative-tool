// Generación de copy para piezas Actinver usando Groq (Llama 3.3 70B)
// Modelo: llama-3.3-70b-versatile — más inteligente para seguir instrucciones complejas
// El MENSAJE del usuario tiene prioridad absoluta sobre el nombre del catálogo.

import OpenAI from "openai";
import { CreatorInput, PieceContent, ChannelCaption, SocialChannel, CAPTION_LIMITS } from "./templates";
import { NARRATIVA } from "./brand/narrativa";
import type { ProductFicha } from "./fichas";
import type { SavedReference } from "./references";

function loadNarrativa(): string {
  return NARRATIVA;
}

// ── Construye el bloque few-shot a partir de referencias aprobadas ────────────
function buildFewShotBlock(references: SavedReference[]): string {
  if (!references || references.length === 0) return "";
  const examples = references
    .slice(0, 2)
    .map((ref, i) => {
      const lines = [
        `Ejemplo aprobado ${i + 1} (${ref.product || ref.message}):`,
        `  - Título: "${ref.pieceContent.title}"`,
        `  - Descripción: "${ref.pieceContent.description}"`,
        `  - CTA: "${ref.pieceContent.cta}"`,
      ];
      return lines.join("\n");
    })
    .join("\n\n");

  return `
━━━ REFERENCIAS APROBADAS (few-shot) ━━━━━━━━
Estas piezas fueron aprobadas para este tipo de comunicación.
Úsalas SOLO como guía de estilo, especificidad y tono. NO copies su contenido.

${examples}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();
}

// ── Recorte inteligente: nunca corta a la mitad de una palabra ─────────────
function smartTrim(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  // Retrocede hasta el último espacio antes del límite
  const cut = t.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace).trimEnd() : cut;
}

// ── Reglas de ortografía y gramática inyectadas en cada prompt ────────────
const GRAMMAR_RULES = `
REGLAS ORTOGRÁFICAS OBLIGATORIAS (cualquier violación invalida la respuesta):
- Español correcto en todo momento. Revisa cada conjugación verbal antes de incluirla.
- Ejemplos de errores PROHIBIDOS: "construemos" → CORRECTO: "construimos"; "haiga" → CORRECTO: "haya"; "hubieron problemas" → CORRECTO: "hubo problemas".
- Tildes obligatorias en palabras que las llevan: tú, él, más, sí, qué, cuándo, etc.
- No repitas palabras del título en la descripción ni en el CTA.
- El texto debe ser fluido, legible y sin redundancias.
`.trim();

export async function generateVariants(
  input: CreatorInput,
  apiKey: string,
  ficha?: ProductFicha,
): Promise<PieceContent[]> {
  const narrativa = loadNarrativa();
  const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

  const fichaContext = ficha
    ? `CONTEXTO DEL PRODUCTO EN CATÁLOGO (contexto secundario — solo si el mensaje no especifica un nombre más concreto):
  - Categoría: ${ficha.categoria}
  - Descripción: ${ficha.descripcion}
  - Beneficios clave: ${ficha.beneficios.join(", ")}
  - Tono sugerido: ${ficha.tono}`
    : `El producto no está en el catálogo de Actinver. Basa el copy únicamente en el mensaje del usuario.`;

  const audiencia = (input.genero ?? "ambos") === "ambos"
    ? "Hombres y mujeres"
    : input.genero === "hombre" ? "Hombres" : "Mujeres";

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Eres el copywriter senior de Actinver. Guías de marca:\n\n${narrativa}\n\n${GRAMMAR_RULES}\n\nResponde ÚNICAMENTE con JSON puro, sin markdown.`,
      },
      {
        role: "user",
        content: `Genera 3 variantes de copy ORIGINALES para este brief. Cada variante con tono distinto (educativo, aspiracional, directo).

━━━ BRIEF ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Producto en catálogo: ${input.product || "(sin seleccionar)"}
Mensaje del usuario: ${input.message || "(sin mensaje — usa el producto del catálogo)"}
Audiencia: ${audiencia}, ${input.edadRango ?? "36-50"} años
Tipo de pieza: ${input.tipoPieza ?? "educativa"}
Incluir CTA: ${input.conCTA !== false ? "Sí" : "No — retorna cta como cadena vacía"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━ JERARQUÍA DE CONTENIDO (OBLIGATORIO) ━━
1. El MENSAJE DEL USUARIO es la directiva primaria absoluta.
   Si el mensaje menciona un producto, fondo o servicio específico por nombre
   (ej. "ActiAI", "Fondo Tech"), ESE nombre es el único tema de las 3 variantes.
2. Si el mensaje no especifica nombre concreto, el copy habla sobre: "${input.product || input.message}".
3. Los ejemplos del narrativa son SOLO de estructura. NUNCA copies su contenido.
   Genera copy 100% original y específico para este brief.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${fichaContext}

━━━ REGLA CTA OBLIGATORIA ━━━━━━━━━━━━━━━━
Frase completa: verbo imperativo + objeto. Entre 15 y 28 caracteres.
Cuenta los caracteres ANTES de escribir. Ejemplos válidos:
  "Conoce el fondo ActiAI" = 22 chars ✓
  "Invierte en IA hoy" = 18 chars ✓
  "Quiero más información" = 22 chars ✓
  "Sí" = 2 chars ✗ (demasiado corto)
  "Sí, quiero contratar mi Plan de Retiro" = 38 chars ✗ (demasiado largo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Devuelve exactamente:
{
  "variants": [
    { "title": "máx 48 chars", "description": "máx 180 chars", "cta": "entre 15 y 28 chars COMPLETOS" },
    { "title": "máx 48 chars", "description": "máx 180 chars", "cta": "entre 15 y 28 chars COMPLETOS" },
    { "title": "máx 48 chars", "description": "máx 180 chars", "cta": "entre 15 y 28 chars COMPLETOS" }
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
    title:       smartTrim(String(v.title       ?? ""), 48),
    description: smartTrim(String(v.description ?? ""), 180),
    cta:         smartTrim(String(v.cta         ?? ""), 28),
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
    cta:         "entre 15 y 28 caracteres COMPLETOS con verbo + objeto. Cuenta los caracteres antes de escribir. NUNCA una sola palabra ni frase que supere 28 chars.",
  }[field];

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `Eres el copywriter senior de Actinver. Guías de marca:\n\n${narrativa}\n\n${GRAMMAR_RULES}\n\nResponde ÚNICAMENTE con JSON puro.`,
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
  const limits = { title: 48, description: 180, cta: 28 };
  return smartTrim(String(parsed[field] ?? ""), limits[field]);
}

export async function generatePieceContent(
  input: CreatorInput,
  apiKey: string,
  ficha?: ProductFicha,
  references?: SavedReference[],
): Promise<PieceContent> {
  const narrativa = loadNarrativa();
  const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

  const fichaContext = ficha
    ? `CONTEXTO DEL PRODUCTO EN CATÁLOGO (contexto secundario — solo si el mensaje no especifica un nombre más concreto):
  - Categoría: ${ficha.categoria}
  - Descripción: ${ficha.descripcion}
  - Beneficios clave: ${ficha.beneficios.join(", ")}
  - Tono sugerido: ${ficha.tono}`
    : `El producto no está en el catálogo de Actinver. Basa el copy únicamente en el mensaje del usuario.`;

  const audiencia = (input.genero ?? "ambos") === "ambos"
    ? "Hombres y mujeres"
    : input.genero === "hombre" ? "Hombres" : "Mujeres";

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Eres el copywriter senior de Actinver.
Guías de marca (aplican a ESTILO y TONO, no como plantillas de copy):

${narrativa}

${GRAMMAR_RULES}

Responde ÚNICAMENTE con JSON puro, sin markdown ni bloques de código.`,
      },
      {
        role: "user",
        content: `Genera el copy para una pieza de comunicación con este brief:

━━━ BRIEF ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Producto en catálogo: ${input.product || "(sin seleccionar)"}
Mensaje del usuario: ${input.message || "(sin mensaje — usa el producto del catálogo)"}
Audiencia: ${audiencia}, ${input.edadRango ?? "36-50"} años
Tipo de pieza: ${input.tipoPieza ?? "educativa"}
Incluir CTA: ${input.conCTA !== false ? "Sí" : "No — retorna cta como cadena vacía"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━ JERARQUÍA DE CONTENIDO (OBLIGATORIO) ━━
1. El MENSAJE DEL USUARIO es la directiva primaria absoluta.
   Si el mensaje menciona un producto, fondo, campaña o servicio por nombre específico
   (ej. "ActiAI", "Fondo Tech", "campaña verano"), ESE nombre es el único tema del copy.
   El nombre del catálogo solo define el sector y el ángulo narrativo de Actinver.
2. Si el mensaje no especifica un nombre concreto, el copy habla literalmente sobre: "${input.product || input.message}".
3. Los ejemplos en las guías de marca son solo de ESTRUCTURA. NUNCA copies su contenido.
   Genera copy 100% original y específico para este brief.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${fichaContext}

${references && references.length > 0 ? buildFewShotBlock(references) + "\n" : ""}
━━━ REGLA CTA OBLIGATORIA ━━━━━━━━━━━━━━━━
Frase completa: verbo imperativo + objeto. Entre 15 y 28 caracteres.
Cuenta los caracteres ANTES de escribir. Ejemplos válidos:
  "Conoce el fondo ActiAI" = 22 chars ✓
  "Invierte en IA hoy" = 18 chars ✓
  "Quiero más información" = 22 chars ✓
  "Sí" = 2 chars ✗ (demasiado corto)
  "Sí, quiero contratar mi Plan de Retiro" = 38 chars ✗ (demasiado largo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Devuelve exactamente:
{
  "title": "máx 48 caracteres — habla del tema específico identificado en el MENSAJE",
  "description": "máx 180 caracteres, complementa el título con beneficios o contexto concreto",
  "cta": "entre 15 y 28 caracteres completos"
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.65,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as PieceContent;

  return {
    title:       smartTrim(String(parsed.title       ?? ""), 48),
    description: smartTrim(String(parsed.description ?? ""), 180),
    cta:         smartTrim(String(parsed.cta         ?? ""), 28),
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
