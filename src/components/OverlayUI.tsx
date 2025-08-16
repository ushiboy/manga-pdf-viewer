import React, { useState } from 'react';
import { HeaderBar } from './HeaderBar';
import { FooterBar } from './FooterBar';
import { FloatingShowButton } from './FloatingShowButton';
import { SettingsPanel } from './SettingsPanel';
import type { ViewMode, ReadingDirection } from '../types/settings';

interface OverlayUIProps {
  currentPage: number;
  totalPages: number;
  isVisible: boolean;
  onFileSelect: (file: File) => void;
  onShow: () => void;
  onHide: () => void;
  onPageChange: (page: number) => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  treatFirstPageAsCover: boolean;
  onToggleViewMode: () => void;
  onToggleReadingDirection: () => void;
  onToggleTreatFirstPageAsCover: () => void;
  onResetSettings: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleFitMode?: () => void;
  onGoToFirst?: () => void;
  onGoToLast?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const OverlayUI: React.FC<OverlayUIProps> = ({ 
  currentPage, 
  totalPages,
  isVisible,
  onFileSelect,
  onShow,
  onHide,
  onPageChange,
  onPreviousPage,
  onNextPage,
  viewMode,
  readingDirection,
  treatFirstPageAsCover,
  onToggleViewMode,
  onToggleReadingDirection,
  onToggleTreatFirstPageAsCover,
  onResetSettings,
  onZoomIn,
  onZoomOut,
  onToggleFitMode,
  onGoToFirst,
  onGoToLast,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <>
      <FloatingShowButton 
        isVisible={isVisible}
        onShow={onShow}
      />
      <HeaderBar 
        isVisible={isVisible} 
        onFileSelect={onFileSelect}
        onHide={onHide}
        viewMode={viewMode}
        readingDirection={readingDirection}
        onToggleViewMode={onToggleViewMode}
        onToggleReadingDirection={onToggleReadingDirection}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onOpenSettings={handleOpenSettings}
      />
      <FooterBar 
        isVisible={isVisible} 
        currentPage={currentPage} 
        totalPages={totalPages}
        viewMode={viewMode}
        readingDirection={readingDirection}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onToggleFitMode={onToggleFitMode}
        onGoToFirst={onGoToFirst}
        onGoToLast={onGoToLast}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        viewMode={viewMode}
        readingDirection={readingDirection}
        treatFirstPageAsCover={treatFirstPageAsCover}
        onToggleViewMode={onToggleViewMode}
        onToggleReadingDirection={onToggleReadingDirection}
        onToggleTreatFirstPageAsCover={onToggleTreatFirstPageAsCover}
        onResetSettings={onResetSettings}
      />
    </>
  );
};