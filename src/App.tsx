import React, { useState, useCallback } from 'react';
import { PdfViewer } from './components/PdfViewer';
import { OverlayUI } from './components/OverlayUI';
import { usePdfDocument } from './hooks/usePdfDocument';
import { useKeyboard } from './hooks/useKeyboard';
import { useSettings } from './hooks/useSettings';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const { pdfDocument, loadState, loadPdf } = usePdfDocument();
  const { settings, toggleViewMode, toggleReadingDirection } = useSettings();

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
      handlePageChange(prevPage);
    }
  }, [handlePageChange, currentPage, settings.viewMode]);

  const goToNextPage = useCallback(() => {
    if (settings.viewMode === 'single') {
      handlePageChange(currentPage + 1);
    } else {
      // 見開き表示時の次ページ処理
      let nextPage;
      if (currentPage === 1) {
        // 表紙から2ページ目に移動
        nextPage = 2;
      } else {
        // 通常の見開きナビゲーション
        nextPage = currentPage + 2;
      }
      handlePageChange(nextPage);
    }
  }, [handlePageChange, currentPage, settings.viewMode]);

  // キーボードショートカット
  useKeyboard({
    onPreviousPage: goToPreviousPage,
    onNextPage: goToNextPage,
    enabled: loadState.isLoaded,
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
        onPageChange={handlePageChange}
      />
      
      <OverlayUI 
        currentPage={currentPage}
        totalPages={pdfDocument?.numPages || 0}
        onFileSelect={handleFileSelect}
        onVisibilityChange={setIsUIVisible}
        onPageChange={handlePageChange}
        viewMode={settings.viewMode}
        readingDirection={settings.readingDirection}
        onToggleViewMode={toggleViewMode}
        onToggleReadingDirection={toggleReadingDirection}
      />
      
      {!loadState.isLoaded && (
        <div 
          className="absolute inset-0 z-10"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      )}
    </div>
  );
};

export default App;