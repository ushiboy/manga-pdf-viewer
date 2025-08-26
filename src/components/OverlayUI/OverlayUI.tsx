import React, { useState } from "react";
import { HeaderBar } from "../HeaderBar";
import { FooterBar } from "../FooterBar";
import { FloatingShowButton } from "../FloatingShowButton";
import { SettingsPanel } from "../SettingsPanel";
import { useAppContext } from "../../contexts";
export const OverlayUI: React.FC = () => {
  const {
    pdfDocument,
    currentPage,
    isUIVisible,
    viewMode,
    readingDirection,
    treatFirstPageAsCover,
    handleFileSelect,
    showUI,
    hideUI,
    handlePageChange,
    goToPreviousPage,
    goToNextPage,
    toggleViewMode,
    toggleReadingDirection,
    toggleTreatFirstPageAsCover,
    resetToDefaults,
    handleZoomIn,
    handleZoomOut,
    cycleFitMode,
    goToFirstPage,
    goToLastPage,
    isFullscreen,
    toggleFullscreen,
  } = useAppContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <>
      <FloatingShowButton isVisible={isUIVisible} onShow={showUI} />
      <HeaderBar
        isVisible={isUIVisible}
        onFileSelect={handleFileSelect}
        onHide={hideUI}
        viewMode={viewMode}
        readingDirection={readingDirection}
        onToggleViewMode={toggleViewMode}
        onToggleReadingDirection={toggleReadingDirection}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenSettings={handleOpenSettings}
      />
      <FooterBar
        isVisible={isUIVisible}
        currentPage={currentPage}
        totalPages={pdfDocument?.numPages || 0}
        viewMode={viewMode}
        readingDirection={readingDirection}
        onPageChange={handlePageChange}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleFitMode={cycleFitMode}
        onGoToFirst={goToFirstPage}
        onGoToLast={goToLastPage}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        viewMode={viewMode}
        readingDirection={readingDirection}
        treatFirstPageAsCover={treatFirstPageAsCover}
        onToggleViewMode={toggleViewMode}
        onToggleReadingDirection={toggleReadingDirection}
        onToggleTreatFirstPageAsCover={toggleTreatFirstPageAsCover}
        onResetSettings={resetToDefaults}
      />
    </>
  );
};
