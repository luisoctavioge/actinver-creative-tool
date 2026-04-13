"use client";

import { useState } from "react";
import ActinverLogo from "./Canvas/ActinverLogo";

interface WelcomeScreenProps {
  onDone: () => void;
}

export default function WelcomeScreen({ onDone }: WelcomeScreenProps) {
  const [leaving, setLeaving] = useState(false);

  const handleStart = () => {
    setLeaving(true);
    setTimeout(() => onDone(), 550);
  };

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
        gap:            32,
        background: `
          radial-gradient(ellipse at 50% 38%, #1A2433 0%, #0D1219 55%, #0A0E12 100%)
        `,
        pointerEvents: leaving ? "none" : "all",
      }}
    >
      {/* Logo */}
      <div className="splash-logo-in">
        <ActinverLogo width={180} height={44} />
      </div>

      {/* Línea + subtítulo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div
          className="splash-line-in"
          style={{
            width:      56,
            height:     1,
            background: "rgba(230,199,138,0.5)",
            borderRadius: 1,
          }}
        />
        <span
          className="splash-sub-in font-open-sans uppercase tracking-widest text-white/30"
          style={{ fontSize: 11, letterSpacing: "0.22em" }}
        >
          Creative Tool
        </span>
      </div>

      {/* Botón Comenzar a crear */}
      <button
        onClick={handleStart}
        className="splash-sub-in mt-6 group cursor-pointer"
        style={{ animationDelay: "0.8s" }}
      >
        <span
          className="
            inline-flex items-center gap-2.5 px-8 py-3 rounded-full
            border border-sunset/40 text-sunset font-poppins font-medium
            text-sm tracking-wide
            transition-all duration-300
            hover:bg-sunset/10 hover:border-sunset/60 hover:shadow-[0_0_24px_rgba(230,199,138,0.12)]
            active:scale-[0.97]
          "
        >
          Comenzar a crear
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  );
}
