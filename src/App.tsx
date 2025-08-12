import React, { useState, useCallback } from 'react';
import { PdfViewer } from './components/PdfViewer';
import { OverlayUI } from './components/OverlayUI';
import { usePdfDocument } from './hooks/usePdfDocument';
import { useKeyboard } from './hooks/useKeyboard';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const { pdfDocument, loadState, loadPdf } = usePdfDocument();

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
    handlePageChange(currentPage - 1);
  }, [handlePageChange, currentPage]);

  const goToNextPage = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [handlePageChange, currentPage]);

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
        onPageChange={handlePageChange}
      />
      
      <OverlayUI 
        currentPage={currentPage}
        totalPages={pdfDocument?.numPages || 0}
        onFileSelect={handleFileSelect}
        onVisibilityChange={setIsUIVisible}
        onPageChange={handlePageChange}
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