// Webhook de Airtable → genera imagen → sube de vuelta al record
//
// FLUJO:
//   1. Airtable Automation detecta "Record created" en la tabla del form
//   2. Dispara un HTTP Request (POST) a esta URL con el payload del record
//   3. Este handler genera content + imagen, renderiza la pieza como PNG
//   4. Sube el PNG al campo adjunto del mismo record (Airtable Content API)
//   5. Actualiza los campos de texto (título, descripción, CTA, estado)
//   6. Airtable puede entonces enviar el email con el adjunto via otra Automation
//
// SEGURIDAD:
//   Incluye el header `x-webhook-secret: {AIRTABLE_WEBHOOK_SECRET}` en
//   el HTTP Request de la Automation de Airtable.
//
// PAYLOAD ESPERADO (cuerpo del POST desde Airtable):
//   {
//     "id":     "recXXXXXX",
//     "fields": {
//       "Producto":   "Fondo en dólares",
//       "Mensaje":    "Protege tu patrimonio",
//       "Genero":     "Ambos",           // opcional
//       "EdadRango":  "36-50",           // opcional
//       "TipoPieza":  "Educativa",       // opcional
//       "Formatos":   ["square","story"] // opcional — default: ["square"]
//     }
//   }

import { NextRequest, NextResponse } from "next/server";
import { generatePieceContent } from "@/lib/content-generator";
import { generateImageFromPexels } from "@/lib/image-generator";
import { renderPiece } from "@/lib/piece-renderer";
import {
  updateRecord,
  uploadAttachment,
  FormFields,
} from "@/lib/airtable-client";
import { FormatKey, CreatorInput } from "@/lib/templates";

// ─── Env helpers ─────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} no está configurada en .env.local`);
  return val;
}

// ─── Validación de secreto ────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.AIRTABLE_WEBHOOK_SECRET;
  if (!secret) return true; // sin secreto configurado: aceptar todo (solo para dev local)

  const header = req.headers.get("x-webhook-secret");
  return header === secret;
}

// ─── Extractor de nombre de producto ─────────────────────────────────────────
// Soporta dos formatos:
//   a) Linked record de Airtable → [{id, name, ...}] (campo "Producto" linked)
//   b) String plano → compatibilidad con payloads manuales / legacy

function extractProductName(raw: FormFields["Producto"]): string {
  if (Array.isArray(raw)) {
    return (raw[0] as { name?: string })?.name?.trim() ?? "";
  }
  return String(raw ?? "").trim();
}

// ─── Normalización de campos del form ────────────────────────────────────────

function normalizeFields(fields: Partial<FormFields>): CreatorInput {
  const generoMap: Record<string, CreatorInput["genero"]> = {
    Hombre: "hombre",
    Mujer:  "mujer",
    Ambos:  "ambos",
  };

  const edadMap: Record<string, CreatorInput["edadRango"]> = {
    "25-35": "25-35",
    "36-50": "36-50",
    "51-65": "51-65",
  };

  const tipoMap: Record<string, CreatorInput["tipoPieza"]> = {
    Educativa:     "educativa",
    Promo:         "promo",
    Institucional: "institucional",
  };

  return {
    product:   extractProductName(fields.Producto ?? ""),
    message:   fields.Mensaje  ?? "",
    channels:  [],
    genero:    generoMap[fields.Genero ?? ""] ?? "ambos",
    edadRango: edadMap[fields.EdadRango ?? ""] ?? "36-50",
    tipoPieza: tipoMap[fields.TipoPieza ?? ""] ?? "educativa",
    conCTA:    true,
    conBadge:  true,
  };
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const baseId    = requireEnv("AIRTABLE_BASE_ID");
  const tableId   = requireEnv("AIRTABLE_TABLE_ID");
  const fieldId1  = requireEnv("AIRTABLE_IMAGE_FIELD_ID");
  const fieldId2  = requireEnv("AIRTABLE_IMAGE_FIELD_ID_2");
  const groqKey   = requireEnv("GROQ_API_KEY");

  // Parsear payload
  let recordId: string;
  let rawFields: Partial<FormFields>;

  try {
    const body = await req.json() as { id?: string; fields?: Partial<FormFields> };
    recordId  = body.id ?? "";
    rawFields = body.fields ?? {};
  } catch {
    return NextResponse.json({ error: "Payload JSON inválido" }, { status: 400 });
  }

  if (!recordId) {
    return NextResponse.json({ error: "Falta el campo 'id' del record" }, { status: 400 });
  }

  if (!extractProductName(rawFields.Producto ?? "")) {
    return NextResponse.json(
      { error: "El campo 'Producto' es obligatorio" },
      { status: 400 },
    );
  }

  // Determinar qué formatos generar.
  // Airtable puede mandar Formatos como string "square, story" (getCellValueAsString)
  // o como array ["square","story"] (getCellValue). Manejamos ambos casos.
  const VALID_FORMATS = ["story", "square", "horizontal", "poster"] as const;
  // rawFormatos puede llegar como array o como string CSV según cómo lo manda Airtable
  const rawFormatos = rawFields.Formatos as unknown;
  let formatList: string[] = [];

  if (Array.isArray(rawFormatos)) {
    formatList = rawFormatos as string[];
  } else if (typeof rawFormatos === "string" && rawFormatos.trim()) {
    formatList = rawFormatos.split(",").map((s: string) => s.trim());
  }

  const requestedFormats: FormatKey[] = formatList.filter(
    (f): f is FormatKey => VALID_FORMATS.includes(f as FormatKey),
  );
  const formats = requestedFormats.length > 0 ? requestedFormats : ["square" as FormatKey];

  // Marcar como "en proceso" + limpiar imágenes anteriores (evita acumulación al regenerar)
  await updateRecord(baseId, tableId, recordId, {
    EstadoProceso: "Generando...",
    [fieldId1]: [],
    [fieldId2]: [],
  }).catch(() => {});

  try {
    const input = normalizeFields(rawFields);

    // ── Paso 1: Generar copy con Groq ──────────────────────────────────────
    const content = await generatePieceContent(input, groqKey);

    // ── Paso 2: Dos fondos distintos de Pexels (V1 y V2) ─────────────────
    const bg1 = await generateImageFromPexels({ product: input.product, content });
    const bg2 = await generateImageFromPexels({
      product:    input.product,
      content,
      excludeIds: bg1.pexelsId ? [bg1.pexelsId] : [],
    });

    // ── Paso 3: Renderizar piezas como PNG y subir a Airtable ──────────────
    const formatLabel: Record<FormatKey, string> = {
      story:      "Story_9x16",
      square:     "Cuadrado_1x1",
      horizontal: "Horizontal_16x9",
      poster:     "Poster_3x4",
    };

    for (const format of formats) {
      const label = formatLabel[format];

      // Renderizar ambas versiones en paralelo
      const [png1, png2] = await Promise.all([
        renderPiece(content, bg1.imageUrl, format),
        renderPiece(content, bg2.imageUrl, format),
      ]);

      // Subir V1 → campo ImagenGenerada / V2 → campo ImagenGeneradaV2
      await uploadAttachment(baseId, recordId, fieldId1, png1, `actinver_${label}_V1_${recordId}.png`);
      await uploadAttachment(baseId, recordId, fieldId2, png2, `actinver_${label}_V2_${recordId}.png`);
    }

    // ── Paso 4: Escribir resultados de vuelta en el record ─────────────────
    await updateRecord(baseId, tableId, recordId, {
      EstadoProceso:              "Listo ✓",
      TituloGenerado:      content.title,
      DescripcionGenerada: content.description,
      CTAGenerado:         content.cta,
      FechaGeneracion:     new Date().toISOString(),
    });

    console.log(`[airtable-webhook] ✓ Pieza generada para record ${recordId}`);

    return NextResponse.json({
      ok:       true,
      recordId,
      formats,
      content,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error(`[airtable-webhook] Error en record ${recordId}:`, err);

    // Marcar el record como error para que el equipo lo revise en Airtable
    await updateRecord(baseId, tableId, recordId, {
      EstadoProceso: `Error: ${message.slice(0, 200)}`,
    }).catch(() => {});

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: health check para verificar que la URL está activa
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "airtable-webhook" });
}
