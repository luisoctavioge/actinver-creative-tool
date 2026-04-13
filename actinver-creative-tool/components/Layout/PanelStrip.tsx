// Strip lateral (pestaña siempre visible para abrir/cerrar un panel)

export default function PanelStrip({
  label,
  side,
  open,
  onToggle,
}: {
  label: string;
  side: "left" | "right";
  open: boolean;
  onToggle: () => void;
}) {
  const pointRight = side === "left" ? !open : open;

  return (
    <button
      onClick={onToggle}
      title={open ? `Cerrar ${label}` : `Abrir ${label}`}
      className={`
        w-8 shrink-0 flex flex-col items-center justify-center gap-3 py-8
        transition-colors duration-150 cursor-pointer select-none
        ${side === "left" ? "border-r" : "border-l"} border-white/10
        ${open ? "bg-white/5 text-sunset" : "text-white/25 hover:text-white/55 hover:bg-white/[0.03]"}
      `}
    >
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
        {pointRight
          ? <path d="M1.5 1L5.5 6L1.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M5.5 1L1.5 6L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>

      <span
        className="font-open-sans uppercase tracking-[0.18em] font-medium"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          fontSize: 9,
          transform: side === "right" ? "rotate(180deg)" : undefined,
        }}
      >
        {label}
      </span>
    </button>
  );
}
