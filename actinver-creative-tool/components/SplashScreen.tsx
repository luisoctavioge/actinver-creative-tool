"use client";

// Splash ejecutivo — single slide para CEO.
// Variable principal: días de entrega (7 → 3 → 0 el mismo día).
// Interactividad: entrada staggered, hover lift, contador animado.

import { useEffect, useRef, useState } from "react";
import ActinverLogo from "./Canvas/ActinverLogo";

interface SplashScreenProps {
  onDone: () => void;
  onOpenBrandbook: () => void;
}

// ── Hook: anima un número de `from` a `to` en `duration`ms. ──────────────────
function useCountUp(to: number, duration = 1000, delay = 0, active = false): number {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const from = to + Math.round(to * 1.4); // arranca 2.4× más alto
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        setValue(Math.round(from + (to - from) * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [active, to, duration, delay]);

  return value;
}

export default function SplashScreen({ onDone, onOpenBrandbook }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(false); // controla la entrada staggered
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const current = useRef({ x: 50, y: 40 });
  const target  = useRef({ x: 50, y: 40 });
  const rafId   = useRef<number | null>(null);

  // Disparar animaciones de entrada al montar.
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Glow que sigue al cursor — lerp suave con rAF.
  useEffect(() => {
    const tick = () => {
      const c = current.current;
      const t = target.current;
      c.x += (t.x - c.x) * 0.07;
      c.y += (t.y - c.y) * 0.07;
      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(ellipse 70% 55% at ${c.x}% ${c.y}%, #1A2433 0%, #0D1219 50%, #0A0E12 100%)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ANCHOR_X = 50, ANCHOR_Y = 40, DRIFT = 0.1;
    const mx = ((e.clientX - rect.left) / rect.width)  * 100;
    const my = ((e.clientY - rect.top)  / rect.height) * 100;
    target.current = {
      x: ANCHOR_X + (mx - ANCHOR_X) * DRIFT,
      y: ANCHOR_Y + (my - ANCHOR_Y) * DRIFT,
    };
  };

  const handleStart = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => onDone(), 520);
  };

  return (
    <div
      ref={glowRef}
      onMouseMove={handleMouseMove}
      className={leaving ? "splash-out" : ""}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: `radial-gradient(ellipse 70% 55% at 50% 40%, #1A2433 0%, #0D1219 50%, #0A0E12 100%)`,
        pointerEvents: leaving ? "none" : "all",
        overflowY: "auto",
      }}
    >
      <div className="min-h-full w-full flex flex-col px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-12"
           style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <header
          className="flex items-center justify-between shrink-0"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(-10px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <ActinverLogo width={116} height={28} />
          <span className="font-open-sans text-white/25 uppercase" style={{ fontSize: 10, letterSpacing: "0.22em" }}>
            Creative Tool · 2026
          </span>
        </header>

        {/* ── Headline + sub ───────────────────────────────────────── */}
        <section
          className="mt-10 sm:mt-12 shrink-0"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(14px)",
            transition: "opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span style={{ width: 20, height: 1, background: "rgba(230,199,138,0.55)" }} />
            <span className="font-open-sans uppercase text-sunset/60" style={{ fontSize: 9.5, letterSpacing: "0.24em" }}>
              Eficiencia operativa y optimización de costos
            </span>
          </div>

          <h1
            className="font-poppins"
            style={{ letterSpacing: "-0.025em", maxWidth: 780 }}
          >
            <span style={{ fontWeight: 800, color: "#ffffff", fontSize: "clamp(26px, 3.6vw, 46px)", lineHeight: 1.08, display: "block" }}>
              De semanas <span style={{ color: "#E6C78A" }}>a minutos.</span>
            </span>
            <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "clamp(14px, 1.5vw, 20px)", lineHeight: 1.3, display: "block", marginTop: 10 }}>
              La eficiencia operativa de marca que Actinver necesita hoy.
            </span>
          </h1>

          <p className="font-open-sans text-white/45 mt-4" style={{ fontSize: "clamp(13px, 1vw, 15px)", lineHeight: 1.65, maxWidth: 620 }}>
            Menos tiempo en tareas repetitivas, más foco en lo que mueve
            la marca y al negocio.
          </p>
        </section>

        {/* ── Cards ────────────────────────────────────────────────── */}
        <section className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 shrink-0">
          {PHASE_CARDS.map((card, i) => (
            <PhaseCard
              key={card.variant}
              visible={visible}
              delay={card.delay}
              variant={card.variant}
              era={card.era}
              dayValue={card.dayValue}
              dayLabel={card.dayLabel}
              headline={card.headline}
              primaryBullet={card.primaryBullet}
              extras={card.extras}
              dimmed={hoveredIdx !== null && hoveredIdx !== i}
              onHover={() => setHoveredIdx(i)}
              onLeave={() => setHoveredIdx(null)}
            />
          ))}
        </section>

        {/* ── CTAs ─────────────────────────────────────────────────── */}
        <footer
          className="mt-10 sm:mt-12 mb-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shrink-0"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease 0.65s",
          }}
        >
          <button
            onClick={handleStart}
            className="font-poppins font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            style={{
              padding: "13px 30px",
              borderRadius: 999,
              border: "1px solid rgba(230,199,138,0.55)",
              background: "linear-gradient(135deg, rgba(230,199,138,0.16), rgba(230,199,138,0.06))",
              color: "#E6C78A",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              fontSize: 14.5,
              letterSpacing: "0.01em",
              boxShadow: "0 8px 28px rgba(230,199,138,0.10)",
            }}
          >
            Entrar a la plataforma&nbsp;&nbsp;→
          </button>

          <button
            onClick={onOpenBrandbook}
            className="font-open-sans font-medium transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            style={{
              padding: "13px 26px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.025)",
              color: "rgba(255,255,255,0.50)",
              fontSize: 13.5,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="2.5" y="1.5" width="9" height="13" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M5 5h4M5 8h4M5 11h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Ver Brandbook
          </button>

        </footer>
      </div>
    </div>
  );
}

// ── PhaseCard ─────────────────────────────────────────────────────────────────

type PhaseVariant = "past" | "present" | "future";

interface PhaseCardProps {
  visible: boolean;
  delay: number;
  variant: PhaseVariant;
  era: string;
  dayValue: number;
  dayLabel: string;
  headline: string;
  primaryBullet: string;
  extras: readonly string[];
  dimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
}

function PhaseCard({ visible, delay, variant, era, dayValue, dayLabel, headline, primaryBullet, extras, dimmed, onHover, onLeave }: PhaseCardProps) {
  const s = VARIANT_STYLES[variant];

  // Contador animado del número de días — arranca cuando `visible` es true.
  const animatedDay = useCountUp(dayValue, 900, delay * 1000 + 300, visible);

  const dayDisplay = `${animatedDay}`;

  // Opacidad y filtro según estado del grupo.
  // dimmed: la card se retira — gris, blur, opacidad baja.
  // !dimmed con hoveredIdx activo (la card está activa): se eleva.
  const cardOpacity  = !visible ? 0 : dimmed ? 0.35 : 1;
  const cardFilter   = dimmed ? "blur(2px) grayscale(0.7)" : "none";
  const cardBorder   = dimmed ? "1px solid rgba(255,255,255,0.04)" : s.borderHover;
  const cardShadow   = dimmed ? "none" : s.shadowHover;
  const cardScale    = dimmed ? "scale(0.985)" : "scale(1)";

  return (
    <article
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "22px 20px",
        borderRadius: 14,
        border: dimmed ? cardBorder : s.border,
        background: s.background,
        boxShadow: dimmed ? cardShadow : s.shadow,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        minHeight: 340,
        cursor: "default",
        opacity: cardOpacity,
        filter: cardFilter,
        transform: visible ? cardScale : "translateY(22px)",
        transition: `opacity 0.55s ease ${delay}s, transform 0.35s ease, filter 0.35s ease, border 0.25s ease, box-shadow 0.25s ease`,
      }}
    >
      {/* Era badge */}
      <div className="flex items-center gap-2 mb-4">
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.accent, flexShrink: 0,
          boxShadow: variant === "future" ? `0 0 10px ${s.accent}` : "none" }} />
        <span className="font-open-sans uppercase" style={{ fontSize: 9.5, letterSpacing: "0.22em", color: s.accent }}>
          {era}
        </span>
      </div>

      {/* Big day number — métrica principal */}
      <div style={{ marginBottom: 14 }}>
        <div
          className="font-poppins"
          style={{
            fontSize: "clamp(44px, 5vw, 64px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: s.dayColor,
            transition: "color 0.3s ease",
          }}
        >
          {dayDisplay}
        </div>
        <div className="font-open-sans" style={{ fontSize: 11, color: s.dayLabelColor, marginTop: 5, letterSpacing: "0.02em" }}>
          {dayLabel}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: s.divider, marginBottom: 14 }} />

      {/* Headline */}
      <h2 className="font-poppins" style={{ fontSize: 15, fontWeight: 700, color: s.titleColor, marginBottom: 6, lineHeight: 1.3 }}>
        {headline}
      </h2>

      {/* Primary metric bullet — resaltado */}
      <p className="font-open-sans" style={{ fontSize: 12.5, color: s.primaryBulletColor, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>
        {primaryBullet}
      </p>

      {/* Extra bullets */}
      <ul className="flex-1 flex flex-col gap-1.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {extras.map((b, i) => (
          <li key={i} className="font-open-sans flex items-start gap-2"
              style={{ fontSize: 12, color: s.bulletColor, lineHeight: 1.5 }}>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: s.bulletDot, flexShrink: 0, marginTop: 7 }} />
            {b}
          </li>
        ))}
      </ul>
    </article>
  );
}

// ── Datos estáticos de cada fase (fuera del componente para evitar re-creación) ──

const PHASE_CARDS = [
  {
    variant: "past" as const, era: "Antes de 2025", delay: 0.18,
    dayValue: 7, dayLabel: "días promedio de entrega",
    headline: "Buzón saturado",
    primaryBullet: "Todo llegaba al correo del líder de marca",
    extras: [
      "Sin distinción entre urgente y rutinario",
      "Briefs incompletos: 1–3 días de ida y vuelta",
      "Cero visibilidad del estado o del backlog",
      "Errores de marca llegaban a entrega final",
    ],
  },
  {
    variant: "present" as const, era: "2025", delay: 0.32,
    dayValue: 3, dayLabel: "días promedio de entrega",
    headline: "Sistema Airtable · Slack · Mail",
    primaryBullet: "+60% volumen sin aumentar headcount",
    extras: [
      "Intake estructurado con brief completo",
      "Alertas automáticas en Slack al equipo",
      "Dashboard ejecutivo de backlog y métricas",
      "Validación IA antes de aprobación final",
    ],
  },
  {
    variant: "future" as const, era: "2026 · Esta plataforma", delay: 0.46,
    dayValue: 0, dayLabel: "días · entrega el mismo día",
    headline: "Creación asistida por IA",
    primaryBullet: "Cero errores humanos. 100% alineado a marca.",
    extras: [
      "Copy + imagen generados desde el brief",
      "Plantillas con lenguaje visual Actinver",
      "Export en todos los formatos de campaña",
      "Captions por canal listas al instante",
    ],
  },
] as const;

// ── Tokens visuales por variante ──────────────────────────────────────────────

const VARIANT_STYLES = {
  past: {
    border:           "1px solid rgba(255,255,255,0.07)",
    borderHover:      "1px solid rgba(255,255,255,0.14)",
    background:       "rgba(255,255,255,0.02)",
    shadow:           "none",
    shadowHover:      "0 12px 36px rgba(0,0,0,0.3)",
    accent:           "rgba(255,255,255,0.30)",
    dayColor:         "rgba(255,255,255,0.45)",
    dayLabelColor:    "rgba(255,255,255,0.28)",
    divider:          "rgba(255,255,255,0.06)",
    titleColor:       "rgba(255,255,255,0.65)",
    primaryBulletColor:"rgba(255,255,255,0.55)",
    bulletColor:      "rgba(255,255,255,0.40)",
    bulletDot:        "rgba(255,255,255,0.20)",
  },
  present: {
    border:           "1px solid rgba(49,69,102,0.50)",
    borderHover:      "1px solid rgba(49,69,102,0.85)",
    background:       "linear-gradient(155deg, rgba(49,69,102,0.16), rgba(26,36,51,0.22))",
    shadow:           "0 8px 28px rgba(0,0,0,0.22)",
    shadowHover:      "0 16px 40px rgba(0,0,0,0.38)",
    accent:           "#8EABD4",
    dayColor:         "#FFFFFF",
    dayLabelColor:    "rgba(255,255,255,0.45)",
    divider:          "rgba(49,69,102,0.45)",
    titleColor:       "#FFFFFF",
    primaryBulletColor:"#8EABD4",
    bulletColor:      "rgba(255,255,255,0.68)",
    bulletDot:        "#8EABD4",
  },
  future: {
    border:           "1px solid rgba(230,199,138,0.35)",
    borderHover:      "1px solid rgba(230,199,138,0.65)",
    background:       "linear-gradient(155deg, rgba(230,199,138,0.09), rgba(230,199,138,0.02))",
    shadow:           "0 10px 36px rgba(230,199,138,0.08), inset 0 1px 0 rgba(230,199,138,0.12)",
    shadowHover:      "0 18px 48px rgba(230,199,138,0.16), inset 0 1px 0 rgba(230,199,138,0.20)",
    accent:           "#E6C78A",
    dayColor:         "#E6C78A",
    dayLabelColor:    "rgba(230,199,138,0.60)",
    divider:          "rgba(230,199,138,0.18)",
    titleColor:       "#FFFFFF",
    primaryBulletColor:"#E6C78A",
    bulletColor:      "rgba(255,255,255,0.80)",
    bulletDot:        "#E6C78A",
  },
} as const;
