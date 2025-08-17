import React, { useState, useCallback } from 'react';
import { PdfViewer } from './components/PdfViewer';
import { OverlayUI } from './components/OverlayUI';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';
import { usePdfDocument } from './hooks/usePdfDocument';
import { useKeyboard } from './hooks/useKeyboard';
import { useSettings } from './hooks/useSettings';
import { useZoom } from './hooks/useZoom';
import { useFullscreen } from './hooks/useFullscreen';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const { pdfDocument, loadState, loadPdf } = usePdfDocument();
  const { settings, toggleViewMode, toggleReadingDirection, toggleTreatFirstPageAsCover, resetToDefaults } = useSettings();
  const { zoomState, zoomIn, zoomOut, cycleFitMode, calculateFitScale, setOffset } = useZoom();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
  // ズーム関数をラップして現在の表示スケールを渡す
  const handleZoomIn = useCallback(() => zoomIn(), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut(), [zoomOut]);

  const handleFileSelect = useCallback((file: File) => {
    loadPdf(file);
    setCurrentPage(1);
  }, [loadPdf]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    const file = files[0];
    
    if (file && file.type === 'application/pdf') {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handlePageChange = useCallback((page: number) => {
    if (!pdfDocument) return;
    
    const clampedPage = Math.max(1, Math.min(page, pdfDocument.numPages));
    setCurrentPage(clampedPage);
  }, [pdfDocument]);

  const goToPreviousPage = useCallback(() => {
    if (settings.viewMode === 'single') {
      handlePageChange(currentPage - 1);
    } else {
      // 見開き表示時の前ページ処理
      let prevPage;
      if (settings.treatFirstPageAsCover) {
        // 表紙モードON
        if (currentPage === 1) {
          // 表紙は動かない
          prevPage = 1;
        } else if (currentPage === 2) {
          // 2ページ目から表紙（1ページ目）に戻る
          prevPage = 1;
        } else {
          // 通常の見開きナビゲーション
          prevPage = Math.max(2, currentPage - 2);
        }
      } else {
        // 表紙モードOFF：1ページ目から見開き
        prevPage = Math.max(1, currentPage - 2);
      }
      handlePageChange(prevPage);
    }
  }, [handlePageChange, currentPage, settings.viewMode, settings.treatFirstPageAsCover]);

  const goToNextPage = useCallback(() => {
    if (!pdfDocument) return;
    
    if (settings.viewMode === 'single') {
      handlePageChange(currentPage + 1);
    } else {
      // 見開き表示時の次ページ処理
      let nextPage;
      if (settings.treatFirstPageAsCover) {
        // 表紙モードON
        if (currentPage === 1) {
          // 表紙から2ページ目に移動
          nextPage = 2;
        } else {
          // 通常の見開きナビゲーション
          const potentialNextPage = currentPage + 2;
          // 見開きで次のページが存在するかチェック
          if (potentialNextPage <= pdfDocument.numPages) {
            nextPage = potentialNextPage;
          } else {
            // 次のページが存在しない場合は移動しない
            return;
          }
        }
      } else {
        // 表紙モードOFF：1ページ目から見開き
        const potentialNextPage = currentPage + 2;
        if (potentialNextPage <= pdfDocument.numPages) {
          nextPage = potentialNextPage;
        } else {
          // 次のページが存在しない場合は移動しない
          return;
        }
      }
      handlePageChange(nextPage);
    }
  }, [handlePageChange, currentPage, settings.viewMode, settings.treatFirstPageAsCover, pdfDocument]);

  const goToFirstPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  const goToLastPage = useCallback(() => {
    if (!pdfDocument) return;
    
    if (settings.viewMode === 'single') {
      handlePageChange(pdfDocument.numPages);
    } else {
      // 見開き表示時の最終ページ処理
      const totalPages = pdfDocument.numPages;
      let lastSpreadPage;
      
      if (settings.treatFirstPageAsCover) {
        // 表紙モードON：1ページ目は単独、2ページ目以降見開き
        if (totalPages <= 2) {
          // ページ数が少ない場合は最終ページ
          lastSpreadPage = totalPages;
        } else {
          // 見開きで最終ページを表示するための開始ページを計算
          lastSpreadPage = Math.max(2, totalPages - 1);
        }
      } else {
        // 表紙モードOFF：1ページ目から見開き
        if (totalPages <= 1) {
          lastSpreadPage = 1;
        } else {
          // 最終見開きの開始ページを計算（奇数ページからスタート）
          lastSpreadPage = totalPages % 2 === 1 ? totalPages : totalPages - 1;
        }
      }
      
      handlePageChange(lastSpreadPage);
    }
  }, [handlePageChange, pdfDocument, settings.viewMode, settings.treatFirstPageAsCover]);

  const handlePan = useCallback((offsetX: number, offsetY: number, containerWidth?: number, containerHeight?: number, pageWidth?: number, pageHeight?: number) => {
    setOffset(offsetX, offsetY, containerWidth, containerHeight, pageWidth, pageHeight);
  }, [setOffset]);

  const showUI = useCallback(() => {
    setIsUIVisible(true);
  }, []);

  const hideUI = useCallback(() => {
    setIsUIVisible(false);
  }, []);

  // キーボードショートカット
  useKeyboard({
    onPreviousPage: goToPreviousPage,
    onNextPage: goToNextPage,
    enabled: loadState.isLoaded,
    readingDirection: settings.readingDirection,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onFullscreen: toggleFullscreen,
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden relative no-select">
      <PdfViewer 
        pdfDocument={pdfDocument}
        loadState={loadState}
        currentPage={currentPage}
        isUIVisible={isUIVisible}
        viewMode={settings.viewMode}
        readingDirection={settings.readingDirection}
        treatFirstPageAsCover={settings.treatFirstPageAsCover}
        zoomState={zoomState}
        calculateFitScale={calculateFitScale}
        onPageChange={handlePageChange}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onPan={handlePan}
      />
      
      <OverlayUI 
        currentPage={currentPage}
        totalPages={pdfDocument?.numPages || 0}
        isVisible={isUIVisible}
        onFileSelect={handleFileSelect}
        onShow={showUI}
        onHide={hideUI}
        onPageChange={handlePageChange}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        viewMode={settings.viewMode}
        readingDirection={settings.readingDirection}
        treatFirstPageAsCover={settings.treatFirstPageAsCover}
        onToggleViewMode={toggleViewMode}
        onToggleReadingDirection={toggleReadingDirection}
        onToggleTreatFirstPageAsCover={toggleTreatFirstPageAsCover}
        onResetSettings={resetToDefaults}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleFitMode={cycleFitMode}
        onGoToFirst={goToFirstPage}
        onGoToLast={goToLastPage}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      
      {!loadState.isLoaded && (
        <div 
          className="absolute inset-0 z-10"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      )}
      
      {/* PWA更新通知 */}
      <PWAUpdateNotification />
    </div>
  );
};

export default App;