"use client";

import { useEffect, useState } from "react";
import ActinverLogo from "./Canvas/ActinverLogo";

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Hold → start fade out at 1.6s → call onDone at 2.15s
    const fadeOut = setTimeout(() => setLeaving(true), 1600);
    const done    = setTimeout(() => onDone(),         2150);
    return () => { clearTimeout(fadeOut); clearTimeout(done); };
  }, [onDone]);

  return (
    <div
      className={leaving ? "splash-out" : ""}
      style={{
        position:       "fixed",
        inset:          0,
        zIndex:         9999,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            24,
        // Gradiente radial cinematográfico con los colores de marca
        background: `
          radial-gradient(ellipse at 50% 38%, #1A2433 0%, #0D1219 55%, #0A0E12 100%)
        `,
        pointerEvents: leaving ? "none" : "all",
      }}
    >
      {/* Logo — inline SVG para consistencia con el canvas y evitar problemas CORS */}
      <div className="splash-logo-in">
        <ActinverLogo width={148} height={36} />
      </div>

      {/* Línea sunset + subtítulo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          className="splash-line-in"
          style={{
            width:           48,
            height:          1,
            background:      "rgba(230,199,138,0.5)",
            borderRadius:    1,
          }}
        />
        <span
          className="splash-sub-in font-open-sans uppercase tracking-widest text-white/30"
          style={{ fontSize: 10, letterSpacing: "0.22em" }}
        >
          Creative Tool
        </span>
      </div>
    </div>
  );
}
