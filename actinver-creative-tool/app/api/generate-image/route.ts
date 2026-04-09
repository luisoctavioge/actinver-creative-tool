import { NextRequest, NextResponse } from "next/server";
import { generateImageFromPexels, generateImageWithAI } from "@/lib/image-generator";
import { PieceContent } from "@/lib/templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, content, provider, excludeIds } = body as {
      product: string;
      content: PieceContent;
      provider: "pexels" | "ai";
      excludeIds?: string[];
    };

    if (!content?.title?.trim()) {
      return NextResponse.json(
        { error: "Se requiere contenido generado antes de buscar la imagen." },
        { status: 400 }
      );
    }

    const params = { product: product ?? "", content, excludeIds };
    const result = provider === "ai"
      ? await generateImageWithAI(params)
      : await generateImageFromPexels(params);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido al obtener la imagen.";
    console.error("[generate-image]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
