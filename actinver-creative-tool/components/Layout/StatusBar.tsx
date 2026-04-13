// Bottom status bar

import type { GenerationStatus } from "@/hooks/useCreativeState";

interface StatusBarProps {
  globalStatus: GenerationStatus;
  contentStatus: GenerationStatus;
  imageStatus: GenerationStatus;
}

export default function StatusBar({ globalStatus, contentStatus, imageStatus }: StatusBarProps) {
  return (
    <footer className="flex items-center justify-between px-6 py-2 border-t border-white/5 shrink-0">
      <span className="text-legal text-white/20 font-open-sans">
        Actinver Creative Tool · v2
      </span>
      <span className="text-legal font-open-sans">
        {globalStatus === "loading" && (
          <span className="text-sunset animate-pulse">
            {imageStatus === "loading" ? "Generando imagen..." : "Generando contenido..."}
          </span>
        )}
        {globalStatus === "success" && imageStatus === "success" && (
          <span className="text-green-400/70">Imagen generada</span>
        )}
        {globalStatus === "success" && contentStatus === "success" && imageStatus === "idle" && (
          <span className="text-sunset/70">Contenido listo — genera el fondo</span>
        )}
        {globalStatus === "error" && <span className="text-red-400/70">Error al generar</span>}
        {globalStatus === "idle" && <span className="text-white/20">Actinver Creative Tool</span>}
      </span>
    </footer>
  );
}
