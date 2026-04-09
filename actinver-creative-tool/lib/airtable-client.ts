// Cliente Airtable — REST API v0 + Content API (upload directo de adjuntos)
//
// Variables de entorno requeridas:
//   AIRTABLE_API_KEY          — Personal Access Token (scopes: data.records:read, data.records:write)
//   AIRTABLE_BASE_ID          — ID del base (empieza con "app...")
//   AIRTABLE_TABLE_ID         — ID o nombre de la tabla del form
//   AIRTABLE_IMAGE_FIELD_ID   — Field ID del campo adjunto (empieza con "fld...")

const AIRTABLE_API_URL     = "https://api.airtable.com/v0";
const AIRTABLE_CONTENT_URL = "https://content.airtable.com/v0";

function getApiKey(): string {
  const key = process.env.AIRTABLE_API_KEY;
  if (!key) throw new Error("AIRTABLE_API_KEY no está configurada en .env.local");
  return key;
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getApiKey()}` };
}

function jsonHeaders(): Record<string, string> {
  return { ...authHeaders(), "Content-Type": "application/json" };
}

// ─── Tipos ─────────────────────────────────────────────────────────────────

export interface AirtableRecord<T = Record<string, unknown>> {
  id:          string;
  fields:      T;
  createdTime: string;
}

// Campos que espera llegar del form de Airtable
export interface FormFields {
  // Linked record del catálogo Productos → [{id, name, ...}]
  // También acepta string para compatibilidad con payload manual / legacy
  Producto:   string | Array<{ id: string; name: string; [key: string]: unknown }>;
  Mensaje?:   string;           // Objetivo o mensaje clave
  Genero?:    "Hombre" | "Mujer" | "Ambos";
  EdadRango?: "25-35" | "36-50" | "51-65";
  TipoPieza?: "Educativa" | "Promo" | "Institucional";
  Formatos?:  string[];         // ["story", "square", "horizontal"]
}

// Campos que escribe el webhook de vuelta al record.
// Acepta cualquier campo genérico para permitir limpiar attachment fields
// pasando field IDs como keys con valor [].
export type ResultFields = Partial<Record<string, unknown>>;

// ─── Lectura de records ─────────────────────────────────────────────────────

export async function getRecord<T = FormFields>(
  baseId: string,
  tableId: string,
  recordId: string,
): Promise<AirtableRecord<T>> {
  const res = await fetch(
    `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(tableId)}/${recordId}`,
    { headers: authHeaders() },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable getRecord [${res.status}]: ${body}`);
  }

  return res.json() as Promise<AirtableRecord<T>>;
}

// ─── Actualización de campos de texto ──────────────────────────────────────

export async function updateRecord(
  baseId:   string,
  tableId:  string,
  recordId: string,
  fields:   ResultFields,
): Promise<void> {
  const res = await fetch(
    `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(tableId)}/${recordId}`,
    {
      method:  "PATCH",
      headers: jsonHeaders(),
      body:    JSON.stringify({ fields }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable updateRecord [${res.status}]: ${body}`);
  }
}

// ─── Upload directo de adjunto (Content API) ────────────────────────────────
//
// Sube un buffer PNG/JPEG directamente al campo adjunto del record.
// Requiere que AIRTABLE_IMAGE_FIELD_ID esté configurado.
// El field ID se obtiene en: Airtable → tabla → campo adjunto → menú → "Copy field ID"

export async function uploadAttachment(
  baseId:      string,
  recordId:    string,
  fieldId:     string,
  buffer:      ArrayBuffer,
  filename:    string,
  contentType = "image/png",
): Promise<void> {
  const base64 = Buffer.from(buffer).toString("base64");

  const res = await fetch(
    `${AIRTABLE_CONTENT_URL}/${baseId}/${recordId}/${fieldId}/uploadAttachment`,
    {
      method:  "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body:    JSON.stringify({ contentType, file: base64, filename }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable uploadAttachment [${res.status}]: ${body}`);
  }
}
