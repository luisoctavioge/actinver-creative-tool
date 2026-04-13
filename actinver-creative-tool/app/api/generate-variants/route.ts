import { NextRequest, NextResponse } from "next/server";
import { generateVariants } from "@/lib/content-generator";
import { CreatorInput } from "@/lib/templates";
import { findFicha } from "@/lib/fichas";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY no configurada." }, { status: 500 });
    }

    const input = await req.json() as CreatorInput;
    if (!input.product?.trim() && !input.message?.trim()) {
      return NextResponse.json({ error: "Se requiere producto o mensaje." }, { status: 400 });
    }

    const ficha = findFicha(input.product ?? "");
    const variants = await generateVariants(input, apiKey, ficha ?? undefined);
    return NextResponse.json({ variants });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido.";
    console.error("[generate-variants]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
