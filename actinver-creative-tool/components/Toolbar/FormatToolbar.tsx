"use client";

import { FORMATS, FORMAT_KEYS, FormatKey, NATIVE, PieceContent } from "@/lib/templates";
import { StoryCanvas, SquareCanvas, HorizontalCanvas, PosterCanvas } from "@/components/Canvas/CanvasPreview";

// Altura fija de los thumbnails en el header
const THUMB_H = 40;

interface FormatToolbarProps {
  selected: FormatKey;
  onChange: (format: FormatKey) => void;
  content: PieceContent;
  imageUrl: string | null;
  isLoading: boolean;
}

export default function FormatToolbar({ selected, onChange, content, imageUrl, isLoading }: FormatToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      {FORMAT_KEYS.map((fk) => {
        const { w, h } = NATIVE[fk];
        const scale = THUMB_H / h;
        const thumbW = Math.round(w * scale);
        const fmt = FORMATS[fk];
        const isSelected = fk === selected;

        return (
          <button
            key={fk}
            onClick={() => onChange(fk)}
            title={`${fmt.label} — ${fmt.width}×${fmt.height}px`}
            className={`
              flex flex-col items-center gap-1.5 transition-all duration-200 group cursor-pointer
              ${isSelected ? "opacity-100" : "opacity-40 hover:opacity-75"}
            `}
          >
            {/* Thumbnail con preview real */}
            <div
              style={{ width: thumbW, height: THUMB_H, flexShrink: 0, position: "relative", overflow: "hidden" }}
              className={`
                rounded-md transition-all duration-200
                ${isSelected
                  ? "ring-[1.5px] ring-sunset shadow-[0_0_8px_rgba(230,199,138,0.25)]"
                  : "ring-1 ring-white/[0.08]"
                }
              `}
            >
              <div style={{
                width: w,
                height: h,
                transformOrigin: "top left",
                transform: `scale(${scale})`,
              }}>
                {fk === "story"      && <StoryCanvas      content={content} imageUrl={imageUrl} isLoading={isLoading} />}
                {fk === "square"     && <SquareCanvas     content={content} imageUrl={imageUrl} isLoading={isLoading} />}
                {fk === "horizontal" && <HorizontalCanvas content={content} imageUrl={imageUrl} isLoading={isLoading} />}
                {fk === "poster"     && <PosterCanvas     content={content} imageUrl={imageUrl} isLoading={isLoading} />}
              </div>
              {/* Overlay oscuro para no-seleccionados */}
              {!isSelected && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,14,18,0.45)", zIndex: 1, borderRadius: "inherit" }} />
              )}
            </div>

            {/* Label */}
            <span
              className={`font-open-sans uppercase tracking-widest transition-colors ${isSelected ? "text-sunset" : "text-white/25 group-hover:text-white/50"}`}
              style={{ fontSize: 9 }}
            >
              {fmt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
