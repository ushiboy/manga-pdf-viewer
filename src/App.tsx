import React, { useState, useCallback } from 'react';
import { PdfViewer } from './components/PdfViewer';
import { OverlayUI } from './components/OverlayUI';
import { usePdfDocument } from './hooks/usePdfDocument';

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

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden relative no-select">
      <PdfViewer 
        pdfDocument={pdfDocument}
        loadState={loadState}
        currentPage={currentPage}
        isUIVisible={isUIVisible}
      />
      
      <OverlayUI 
        currentPage={currentPage}
        totalPages={pdfDocument?.numPages || 0}
        onFileSelect={handleFileSelect}
        onVisibilityChange={setIsUIVisible}
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