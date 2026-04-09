import { NextResponse } from "next/server";
import { loadAllFichas } from "@/lib/fichas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fichas = loadAllFichas();
    return NextResponse.json(fichas);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al cargar fichas.";
    console.error("[fichas]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
