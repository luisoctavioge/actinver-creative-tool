import { NextRequest, NextResponse } from "next/server";
import { generateCaptions } from "@/lib/content-generator";
import { CreatorInput, PieceContent } from "@/lib/templates";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY no configurada." }, { status: 500 });
    }

    const body = await req.json() as { input: CreatorInput; pieceContent: PieceContent };
    const { input, pieceContent } = body;

    if (!input?.product?.trim()) {
      return NextResponse.json({ error: "Se requiere producto o tema." }, { status: 400 });
    }
    if (!input.channels || input.channels.length === 0) {
      return NextResponse.json({ error: "Se requiere al menos un canal." }, { status: 400 });
    }

    const captions = await generateCaptions(input, pieceContent, apiKey);
    return NextResponse.json({ captions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido.";
    console.error("[generate-captions]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
