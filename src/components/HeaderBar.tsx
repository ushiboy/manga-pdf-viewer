import React, { useRef } from 'react';
import { Button } from './ui/Button';
import type { ViewMode, ReadingDirection } from '../types/settings';

interface HeaderBarProps {
  isVisible: boolean;
  onFileSelect: (file: File) => void;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  onToggleViewMode: () => void;
  onToggleReadingDirection: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ 
  isVisible, 
  onFileSelect,
  viewMode,
  readingDirection,
  onToggleViewMode,
  onToggleReadingDirection,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={handleFileButtonClick}>
            📁 ファイル選択
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            title={`表示方式: ${viewMode === 'single' ? '単一ページ' : '見開きページ'}`}
            onClick={onToggleViewMode}
          >
            {viewMode === 'single' ? '📄' : '📖'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            title={`読み方向: ${readingDirection === 'rtl' ? '右→左（日本語）' : '左→右（英語）'}`}
            onClick={onToggleReadingDirection}
          >
            {readingDirection === 'rtl' ? '⬅️' : '➡️'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            title={isFullscreen ? "フルスクリーン終了 (F11)" : "フルスクリーン (F11)"}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? '🗗' : '⛶'}
          </Button>
          <Button variant="ghost" size="sm" title="設定">
            ⚙️
          </Button>
        </div>
      </div>
    </div>
  );
};