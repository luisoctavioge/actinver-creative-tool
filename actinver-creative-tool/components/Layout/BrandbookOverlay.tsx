// Fullscreen brandbook PDF overlay

interface BrandbookOverlayProps {
  onClose: () => void;
}

export default function BrandbookOverlay({ onClose }: BrandbookOverlayProps) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,14,18,0.96)", display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <span className="font-poppins text-white/60 text-legal uppercase tracking-widest">Brandbook Actinver</span>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
          title="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <iframe
        src="/brandbook-actinver/index.html"
        style={{ flex: 1, border: "none", width: "100%", height: "100%" }}
        title="Brandbook Actinver"
      />
    </div>
  );
}
