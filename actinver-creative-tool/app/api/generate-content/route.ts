import { NextRequest, NextResponse } from "next/server";
import { generatePieceContent } from "@/lib/content-generator";
import { CreatorInput } from "@/lib/templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = body as CreatorInput;

    if (!input?.product?.trim()) {
      return NextResponse.json(
        { error: "El producto o tema es obligatorio para generar el contenido." },
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

    const content = await generatePieceContent(input, apiKey);
    return NextResponse.json(content);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al generar el contenido.";
    console.error("[generate-content]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
