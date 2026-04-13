import { NextRequest, NextResponse } from "next/server";
import { generatePieceContent } from "@/lib/content-generator";
import { CreatorInput } from "@/lib/templates";
import { findFicha } from "@/lib/fichas";
import type { SavedReference } from "@/lib/references";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { references, ...inputRaw } = body as CreatorInput & { references?: SavedReference[] };
    const input = inputRaw as CreatorInput;

    if (!input?.product?.trim() && !input?.message?.trim()) {
      return NextResponse.json(
        { error: "El producto o mensaje es obligatorio para generar el contenido." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY no está configurada en .env.local" },
        { status: 500 }
      );
    }

    // Enriquecer con ficha del producto (contexto secundario — el mensaje tiene prioridad)
    const ficha = findFicha(input.product ?? "");

    const content = await generatePieceContent(input, apiKey, ficha ?? undefined, references);
    return NextResponse.json(content);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al generar el contenido.";
    console.error("[generate-content]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
