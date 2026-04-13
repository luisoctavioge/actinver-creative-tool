// Fichas de producto — importadas estáticamente para que Vercel las incluya en el bundle.
// NO usar fs.readFileSync: en serverless el filesystem no es confiable en runtime.

import accionesMercado from "./acciones-mercado.json";
import divisasCambios from "./divisas-cambios.json";
import fondosInversion from "./fondos-inversion.json";
import planRetiro from "./plan-retiro.json";
import segurosPatrimoniales from "./seguros-patrimoniales.json";

export interface ProductFicha {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  beneficios: string[];
  publicoObjetivo: string;
  tono: string;
}

const ALL_FICHAS: ProductFicha[] = [
  accionesMercado,
  divisasCambios,
  fondosInversion,
  planRetiro,
  segurosPatrimoniales,
];

export function loadAllFichas(): ProductFicha[] {
  return ALL_FICHAS;
}

// ── Busca la ficha que mejor coincida con el nombre de producto del brief ──────
// Exportada aquí para que tanto generate-image como generate-content la usen.
export function findFicha(product: string): ProductFicha | null {
  if (!product) return null;
  const fichas = loadAllFichas();
  const p = product.toLowerCase();

  // 1. Match exacto por nombre
  const exact = fichas.find((f) => f.nombre.toLowerCase() === p);
  if (exact) return exact;

  // 2. Match parcial — al menos 2 palabras significativas del nombre de la ficha
  const partial = fichas.find((f) => {
    const words = f.nombre.toLowerCase().split(/\s+/);
    const matches = words.filter((w) => w.length > 3 && p.includes(w));
    return matches.length >= 2;
  });
  if (partial) return partial;

  // 3. Match por id (reemplaza guiones por espacios)
  const byId = fichas.find((f) => p.includes(f.id.replace(/-/g, " ")));
  if (byId) return byId;

  // 4. Match por categoría keywords
  const byCat = fichas.find((f) => {
    const catWords = f.categoria.toLowerCase().split(/\s+/);
    return catWords.some((w) => w.length > 3 && p.includes(w));
  });

  return byCat ?? null;
}
