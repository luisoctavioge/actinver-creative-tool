import { NextRequest, NextResponse } from "next/server";
import { generateImageFromPexels, generateImageWithAI } from "@/lib/image-generator";
import { PieceContent } from "@/lib/templates";
import { findFicha } from "@/lib/fichas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, content, provider, message, excludeIds, genero, edadRango, tipoPieza, communicationType, imageMode } = body as {
      product: string;
      content: PieceContent;
      provider: "pexels" | "ai";
      message?: string;
      excludeIds?: string[];
      genero?: string;
      edadRango?: string;
      tipoPieza?: string;
      communicationType?: string;
      imageMode?: string;
    };

    if (!content?.title?.trim()) {
      return NextResponse.json(
        { error: "Se requiere contenido generado antes de buscar la imagen." },
        { status: 400 }
      );
    }

    // Resolver la ficha del producto para enriquecer el prompt de imagen
    const ficha = findFicha(product ?? "");

    const params = {
      product: product ?? "",
      content,
      message,
      ficha,
      excludeIds,
      genero,
      edadRango,
      tipoPieza,
      communicationType,
      imageMode,
    };

    const result = provider === "ai"
      ? await generateImageWithAI(params)
      : await generateImageFromPexels(params);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido al obtener la imagen.";
    console.error("[generate-image]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
