import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeaderBar } from './HeaderBar';
import { FooterBar } from './FooterBar';
import type { ViewMode, ReadingDirection } from '../types/settings';

interface OverlayUIProps {
  currentPage: number;
  totalPages: number;
  onFileSelect: (file: File) => void;
  onVisibilityChange?: (isVisible: boolean) => void;
  onPageChange: (page: number) => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  onToggleViewMode: () => void;
  onToggleReadingDirection: () => void;
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
  onFileSelect,
  onVisibilityChange,
  onPageChange,
  onPreviousPage,
  onNextPage,
  viewMode,
  readingDirection,
  onToggleViewMode,
  onToggleReadingDirection,
  onZoomIn,
  onZoomOut,
  onToggleFitMode,
  onGoToFirst,
  onGoToLast,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showUI = useCallback(() => {
    setIsVisible(true);
    onVisibilityChange?.(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // フルスクリーン時は UI の自動非表示を早くする
    const hideDelay = isFullscreen ? 2000 : 3000;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      onVisibilityChange?.(false);
    }, hideDelay);
  }, [onVisibilityChange, isFullscreen]);

  useEffect(() => {
    const handleMouseMove = () => showUI();
    const handleTouch = () => showUI();
    const handleKeyDown = (event: KeyboardEvent) => {
      // ページ移動キーとズームキーでは UI を再表示しない
      const pageNavigationKeys = ['ArrowLeft', 'ArrowRight', 'Left', 'Right', '+', '=', '-', '_'];
      if (!pageNavigationKeys.includes(event.key)) {
        showUI();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchstart', handleTouch);
    document.addEventListener('keydown', handleKeyDown);

    showUI();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showUI]);

  return (
    <>
      <HeaderBar 
        isVisible={isVisible} 
        onFileSelect={onFileSelect}
        viewMode={viewMode}
        readingDirection={readingDirection}
        onToggleViewMode={onToggleViewMode}
        onToggleReadingDirection={onToggleReadingDirection}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />
      <FooterBar 
        isVisible={isVisible} 
        currentPage={currentPage} 
        totalPages={totalPages}
        viewMode={viewMode}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onToggleFitMode={onToggleFitMode}
        onGoToFirst={onGoToFirst}
        onGoToLast={onGoToLast}
      />
    </>
  );
};