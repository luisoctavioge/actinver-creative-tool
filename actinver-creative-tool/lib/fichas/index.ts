// Carga todas las fichas de producto desde archivos JSON en esta carpeta.
// Usado por el API route GET /api/fichas para servir al dropdown del cliente.

import fs from "fs";
import path from "path";

export interface ProductFicha {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  beneficios: string[];
  publicoObjetivo: string;
  tono: string;
}

export function loadAllFichas(): ProductFicha[] {
  const dir = path.join(process.cwd(), "lib/fichas");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    return JSON.parse(raw) as ProductFicha;
  });
}
