import React, { useState } from 'react';
import { PdfViewer } from './components/PdfViewer';
import { OverlayUI } from './components/OverlayUI';

const App: React.FC = () => {
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden relative no-select">
      <PdfViewer isFileLoaded={isFileLoaded} />
      
      <OverlayUI 
        currentPage={currentPage}
        totalPages={totalPages}
      />
      
      {!isFileLoaded && (
        <div 
          className="absolute inset-0 z-10"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}
    </div>
  );
};

export default App;