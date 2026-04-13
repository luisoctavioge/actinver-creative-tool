// Iconos SVG compartidos entre componentes.
// Extraídos de EditorPanel y CaptionPanel para eliminar duplicados.

import { SocialChannel } from "@/lib/templates";

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L9.5 6.5H15L10.5 9.5L12 15L8 12L4 15L5.5 9.5L1 6.5H6.5L8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="5.5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 11L5 7.5L7.5 10L10.5 7L14.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VariantsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="7" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="12" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className={spinning ? "animate-spin" : ""}>
      <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.5 1.5V5h-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChannelIcon({ channel, size = 13 }: { channel: SocialChannel; size?: number }) {
  switch (channel) {
    case "instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="4" r="0.8" fill="currentColor" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 7v4M5 5v0.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 11V8.5a1.5 1.5 0 1 1 3 0V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "x":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <path d="M3 3l4.5 5L3 13M13 3l-4.5 5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "facebook":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M10 1.5V5H8.5A1 1 0 0 0 7.5 6v1.5H10L9.5 10H7.5v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

// ── Iconos de canales de comunicación ─────────────────────────────────────────

export function MonitorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="2" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 14h5M8 11v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 4.5L8 9l6.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShareIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.8 7.1L10.2 5M5.8 8.9L10.2 11" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function MessageIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2.5 2.5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-2.5 2V3.5a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function BankIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 6.5L8 2l6 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6.5v6M6 6.5v6M10 6.5v6M13 6.5v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M1.5 12.5h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
