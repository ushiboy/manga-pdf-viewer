import React from 'react';
import { AppProvider, useAppContext } from './contexts';
import { PdfViewer } from './components/PdfViewer';
import { OverlayUI } from './components/OverlayUI';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';

const AppContent: React.FC = () => {
  const { loadState, handleDragOver, handleDrop } = useAppContext();

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden relative no-select">
      <PdfViewer />
      
      <OverlayUI />
      
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

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;