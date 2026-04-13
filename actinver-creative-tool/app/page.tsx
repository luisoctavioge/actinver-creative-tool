"use client";

import { useCreativeState } from "@/hooks/useCreativeState";
import Header from "@/components/Layout/Header";
import StatusBar from "@/components/Layout/StatusBar";
import BrandbookOverlay from "@/components/Layout/BrandbookOverlay";
import PanelStrip from "@/components/Layout/PanelStrip";
import { BriefSection, PieceSection } from "@/components/Editor/EditorPanel";
import CanvasPreview, { FormatCanvas } from "@/components/Canvas/CanvasPreview";
import CaptionPanel from "@/components/CaptionPanel/CaptionPanel";
import WelcomeScreen from "@/components/WelcomeScreen";
import BriefConfirm from "@/components/Brief/BriefConfirm";

// Re-export for backward compat (EditorPanel/CaptionPanel import this)
export type { GenerationStatus } from "@/hooks/useCreativeState";

export default function Home() {
  const s = useCreativeState();

  return (
    <>
      {!s.splashDone && <WelcomeScreen onDone={() => s.setSplashDone(true)} />}

      <div className="flex flex-col h-screen bg-azul-grandeza overflow-hidden">
        <Header
          format={s.format}
          onFormatChange={s.handleFormatChange}
          content={s.content}
          imageUrl={s.generatedImageUrl}
          isImageLoading={s.imageStatus === "loading"}
          onBrandbookOpen={() => s.setBrandbookOpen(true)}
          onDownload={s.handleDownload}
          downloadStatus={s.downloadStatus}
          activeFormats={s.activeFormats}
        />

        <main className="flex flex-1 overflow-hidden min-h-0">
          <PanelStrip label="Brief" side="left" open={s.openPanel === "brief"} onToggle={() => s.togglePanel("brief")} />

          <div style={{ width: s.openPanel === "brief" ? 360 : 0, transition: "width 260ms ease-in-out", flexShrink: 0, overflow: "hidden" }}>
            <div style={{ width: 360 }} className="h-full flex flex-col border-r border-white/10">
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-6">
                <BriefSection
                  creatorInput={s.creatorInput}
                  onChange={s.setCreatorInput}
                  onCreateFull={s.handleRequestCreate}
                  status={s.contentStatus}
                  error={s.contentError}
                />
              </div>
            </div>
          </div>

          <section className="flex-1 flex flex-col overflow-hidden bg-azul-acompanamiento/20 p-6 min-w-0">
            <CanvasPreview
              format={s.format}
              content={s.content}
              imageUrl={s.generatedImageUrl}
              isLoading={s.imageStatus === "loading"}
              imageHistory={s.imageHistory}
              showBadge={s.creatorInput.conBadge}
              logoAlign={s.creatorInput.logoAlign}
              layoutId={s.creatorInput.layoutId}
              categoryLabel={s.creatorInput.categoryLabel}
              onSelectHistoryImage={s.handleSelectHistoryImage}
              eventDate={s.creatorInput.eventDate}
              eventLocation={s.creatorInput.eventLocation}
              eventTime={s.creatorInput.eventTime}
            />
          </section>

          <div style={{ width: s.openPanel === "content" ? 340 : 0, transition: "width 260ms ease-in-out", flexShrink: 0, overflow: "hidden" }}>
            <div style={{ width: 340 }} className="h-full flex flex-col border-l border-white/10">
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-6">
                <PieceSection
                  content={s.content}
                  onChange={s.handleContentChange}
                  onGenerateImage={(provider) => s.handleGenerateImage(provider)}
                  onRegenerateField={s.handleRegenerateField}
                  regeneratingField={s.regeneratingField}
                  imageStatus={s.imageStatus}
                  imageError={s.imageError}
                  contentReady={s.contentStatus === "success"}
                  onSaveReference={s.handleSaveReference}
                  variants={s.variants}
                  variantsStatus={s.variantsStatus}
                  onSelectVariant={s.handleSelectVariant}
                />
              </div>
            </div>
          </div>

          <PanelStrip label="Contenido" side="right" open={s.openPanel === "content"} onToggle={() => s.togglePanel("content")} />
        </main>

        <CaptionPanel
          open={s.bottomPanelOpen}
          onToggle={() => s.setBottomPanelOpen((prev) => !prev)}
          captions={s.captions}
          captionsStatus={s.captionsStatus}
          selectedChannels={s.creatorInput.channels}
        />

        {/* Export layer — renders only active format canvases */}
        <div aria-hidden style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none", zIndex: -1 }}>
          {s.activeFormats.map((fmt) => (
            <div key={fmt} ref={s.exportRefs[fmt]} style={{ display: "inline-block" }}>
              <FormatCanvas
                format={fmt}
                content={s.content}
                imageUrl={s.generatedImageUrl}
                isLoading={false}
                showBadge={s.creatorInput.conBadge}
                logoAlign={s.creatorInput.logoAlign}
                layoutId={s.creatorInput.layoutId}
                categoryLabel={s.creatorInput.categoryLabel}
                eventDate={s.creatorInput.eventDate}
                eventLocation={s.creatorInput.eventLocation}
                eventTime={s.creatorInput.eventTime}
                forExport
              />
            </div>
          ))}
        </div>

        {s.brandbookOpen && <BrandbookOverlay onClose={() => s.setBrandbookOpen(false)} />}

        {s.showBriefConfirm && (
          <BriefConfirm
            creatorInput={s.creatorInput}
            onConfirm={s.handleConfirmCreate}
            onCancel={s.handleCancelCreate}
          />
        )}

        <StatusBar
          globalStatus={s.globalStatus}
          contentStatus={s.contentStatus}
          imageStatus={s.imageStatus}
        />
      </div>
    </>
  );
}
