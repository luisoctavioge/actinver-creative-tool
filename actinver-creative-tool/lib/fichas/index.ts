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
