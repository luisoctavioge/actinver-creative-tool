import { NextRequest, NextResponse } from "next/server";
import { generateImageFromPexels, generateImageWithAI } from "@/lib/image-generator";
import { PieceContent } from "@/lib/templates";
import { loadAllFichas, ProductFicha } from "@/lib/fichas";

// Busca la ficha que mejor coincida con el nombre de producto del brief
function findFicha(product: string): ProductFicha | null {
  if (!product) return null;
  const fichas = loadAllFichas();
  const p = product.toLowerCase();

  // Match exacto por nombre
  const exact = fichas.find((f) => f.nombre.toLowerCase() === p);
  if (exact) return exact;

  // Match parcial — busca keywords del nombre de la ficha dentro del product
  const partial = fichas.find((f) => {
    const words = f.nombre.toLowerCase().split(/\s+/);
    // Al menos 2 palabras significativas deben coincidir
    const matches = words.filter((w) => w.length > 3 && p.includes(w));
    return matches.length >= 2;
  });
  if (partial) return partial;

  // Match por id
  const byId = fichas.find((f) => p.includes(f.id.replace(/-/g, " ")));
  if (byId) return byId;

  // Match por categoría keywords
  const byCat = fichas.find((f) => {
    const catWords = f.categoria.toLowerCase().split(/\s+/);
    return catWords.some((w) => w.length > 3 && p.includes(w));
  });

  return byCat ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, content, provider, message, excludeIds } = body as {
      product: string;
      content: PieceContent;
      provider: "pexels" | "ai";
      message?: string;
      excludeIds?: string[];
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
