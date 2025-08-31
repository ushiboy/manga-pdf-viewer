import React, { useCallback } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useTouch } from '../../hooks/useTouch';
import { useAppContext } from '../../contexts';
import { usePdfRenderer } from '../../hooks/usePdfRenderer';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import type { PdfDocument } from '../../types/pdf';
import { WarningIcon } from '../icons';

interface PdfCanvasProps {
  pdfDocument: PdfDocument;
}

export const PdfCanvas: React.FC<PdfCanvasProps> = ({ pdfDocument }) => {
  const {
    currentPage,
    isUIVisible,
    viewMode,
    readingDirection,
    treatFirstPageAsCover,
    zoomState,
    calculateFitScale,
    handlePageChange,
    goToPreviousPage,
    goToNextPage,
    handleZoomIn,
    handleZoomOut,
    handlePan
  } = useAppContext();

  // PDF描画専用フック
  const { leftCanvasRef, rightCanvasRef, renderError, isRendering } = usePdfRenderer({
    pdfDocument,
    currentPage,
    viewMode,
    readingDirection,
    treatFirstPageAsCover,
    zoomState,
    calculateFitScale,
    isUIVisible,
  });

  // タッチ操作用のコールバック
  const handleTouchPreviousPage = useCallback(() => {
    goToPreviousPage();
  }, [goToPreviousPage]);

  const handleTouchNextPage = useCallback(() => {
    goToNextPage();
  }, [goToNextPage]);

  // タッチ操作フック
  const { handleTouchStart, handleTouchMove, handleTouchEnd, updatePanPosition } = useTouch({
    enabled: true,
    viewMode,
    readingDirection,
    isZoomed: zoomState?.fitMode === 'custom',
    onPreviousPage: handleTouchPreviousPage,
    onNextPage: handleTouchNextPage,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onPan: (deltaX, deltaY) => {
      handlePan(deltaX, deltaY);
    },
  });

  // マウス・インタラクション専用フック
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleClick } = useCanvasInteraction({
    pdfDocument,
    currentPage,
    viewMode,
    readingDirection,
    treatFirstPageAsCover,
    zoomState,
    handlePageChange,
    handleZoomIn,
    handleZoomOut,
    handlePan,
    updatePanPosition,
    leftCanvasRef,
  });

  return (
    <div 
      id="pdf-viewer-container"
      className={`flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 relative overflow-hidden ${
        zoomState && zoomState.fitMode === 'custom' ? 'cursor-grab' : 'cursor-pointer'
      }`}
      role="main"
      aria-label={`PDFビューワー ページ ${currentPage} / ${pdfDocument.numPages} ${viewMode === 'spread' ? '見開き表示' : '単ページ表示'}`}
      tabIndex={0}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderError ? (
        <div 
          className="text-center"
          role="alert"
          aria-live="assertive"
        >
          <div 
            className="mb-2 text-red-500"
            aria-hidden="true"
          >
            <WarningIcon className="w-12 h-12" />
          </div>
          <p className="text-red-600 dark:text-red-400">{renderError}</p>
        </div>
      ) : (
        <div 
          className={`relative ${viewMode === 'spread' ? 'flex' : ''}`}
          role="region"
          aria-label="PDF表示領域"
        >
          {isRendering && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10"
              role="status"
              aria-live="polite"
              aria-label="ページレンダリング中"
            >
              <LoadingSpinner size="md" />
            </div>
          )}
          <canvas
            ref={leftCanvasRef}
            className={`shadow-lg border border-gray-200 dark:border-gray-600 bg-white pointer-events-none ${
              viewMode === 'spread' ? 'max-w-none' : 'max-w-full max-h-full'
            }`}
            role="img"
            aria-label={viewMode === 'spread' ? `左ページ ${readingDirection === 'rtl' ? currentPage + 1 : currentPage}` : `ページ ${currentPage}`}
          />
          <canvas
            ref={rightCanvasRef}
            className="shadow-lg border border-gray-200 dark:border-gray-600 bg-white pointer-events-none max-w-none"
            style={{ display: viewMode === 'spread' ? 'block' : 'none' }}
            role="img"
            aria-label={`右ページ ${readingDirection === 'rtl' ? currentPage : currentPage + 1}`}
          />
        </div>
      )}
    </div>
  );
};