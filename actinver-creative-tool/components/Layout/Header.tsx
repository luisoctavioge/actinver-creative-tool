// Top bar: branding + FormatToolbar + action buttons

"use client";

import { useState, useRef, useEffect } from "react";
import FormatToolbar from "@/components/Toolbar/FormatToolbar";
import { FormatKey, PieceContent } from "@/lib/templates";

interface HeaderProps {
  format: FormatKey;
  onFormatChange: (f: FormatKey) => void;
  content: PieceContent;
  imageUrl: string | null;
  isImageLoading: boolean;
  onBrandbookOpen: () => void;
  onDownload: () => void;
  downloadStatus: "idle" | "loading";
  activeFormats?: FormatKey[];
}

function EmailPopover({
  onClose,
}: {
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!email.trim() || !email.includes("@")) return;
    // TODO: connect backend
    setStatus("sent");
    setTimeout(onClose, 1500);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        zIndex: 50,
        width: 280,
        background: "rgba(10,14,18,0.97)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        backdropFilter: "blur(16px)",
      }}
    >
      {status === "sent" ? (
        <p className="text-legal font-open-sans text-sunset text-center py-1">
          ¡Listo! Archivos enviados
        </p>
      ) : (
        <>
          <p className="text-legal font-open-sans text-white/40 mb-2">
            Ingresa el email para recibir los archivos
          </p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="email"
              value={email}
              placeholder="email@actinver.com"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); if (e.key === "Escape") onClose(); }}
              className="flex-1 min-w-0 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-legal text-white placeholder:text-white/25 font-open-sans focus:outline-none focus:border-sunset/60 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!email.includes("@")}
              className="px-3 py-2 rounded-lg text-legal font-open-sans font-bold transition-all duration-150 bg-sunset/90 text-azul-grandeza hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              Enviar
            </button>
          </div>
          <p className="text-legal font-open-sans text-white/20 mt-2" style={{ fontSize: 10 }}>
            Funcionalidad próximamente disponible
          </p>
        </>
      )}
    </div>
  );
}

export default function Header({
  format,
  onFormatChange,
  content,
  imageUrl,
  isImageLoading,
  onBrandbookOpen,
  onDownload,
  downloadStatus,
  activeFormats,
}: HeaderProps) {
  const [emailOpen, setEmailOpen] = useState(false);
  const emailRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!emailOpen) return;
    function handleClick(e: MouseEvent) {
      if (emailRef.current && !emailRef.current.contains(e.target as Node)) {
        setEmailOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [emailOpen]);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-azul-grandeza/95 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-1">
        <span className="font-poppins font-light text-white text-xl tracking-tight">
          Actinver
        </span>
        <span className="ml-2 text-white/20 font-open-sans text-legal">|</span>
        <span className="ml-2 text-white/40 font-open-sans text-legal uppercase tracking-widest">
          Creative Tool
        </span>
      </div>

      <FormatToolbar
        selected={format}
        onChange={onFormatChange}
        content={content}
        imageUrl={imageUrl}
        isLoading={isImageLoading}
        activeFormats={activeFormats}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={onBrandbookOpen}
          className="px-4 py-1.5 rounded-lg border border-white/10 text-legal font-open-sans font-bold text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="1" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M5 5h4M5 8h4M5 11h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M12 4l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Brandbook
        </button>

        {/* Enviar por email */}
        <div ref={emailRef} style={{ position: "relative" }}>
          <button
            onClick={() => setEmailOpen((prev) => !prev)}
            disabled={!content.title.trim()}
            className={`
              px-4 py-1.5 rounded-lg border text-legal font-open-sans font-bold flex items-center gap-1.5
              transition-all duration-200
              ${content.title.trim()
                ? "border-white/15 text-white/50 hover:text-white/80 hover:bg-white/5 active:scale-[0.98] cursor-pointer"
                : "border-white/8 text-white/20 cursor-not-allowed"
              }
            `}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Enviar
          </button>

          {emailOpen && <EmailPopover onClose={() => setEmailOpen(false)} />}
        </div>

        <button
          onClick={onDownload}
          disabled={downloadStatus === "loading" || !content.title.trim()}
          className={`
            px-4 py-1.5 rounded-lg border text-legal font-open-sans font-bold
            transition-all duration-200
            ${content.title.trim() && downloadStatus !== "loading"
              ? "border-sunset/60 text-sunset hover:bg-sunset/10 active:scale-[0.98] cursor-pointer"
              : "border-sunset/20 text-sunset/30 cursor-not-allowed"
            }
          `}
        >
          {downloadStatus === "loading" ? "Exportando..." : "Descargar"}
        </button>
      </div>
    </header>
  );
}
