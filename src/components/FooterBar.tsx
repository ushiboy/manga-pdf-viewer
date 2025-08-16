import React, { useState } from 'react';
import { Button } from './ui/Button';
import type { ViewMode } from '../types/settings';

interface FooterBarProps {
  isVisible: boolean;
  currentPage: number;
  totalPages: number;
  viewMode: ViewMode;
  onPageChange: (page: number) => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleFitMode?: () => void;
  onGoToFirst?: () => void;
  onGoToLast?: () => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({ 
  isVisible, 
  currentPage, 
  totalPages,
  viewMode,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onToggleFitMode,
  onGoToFirst,
  onGoToLast
}) => {
  const [inputValue, setInputValue] = useState(currentPage.toString());


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    }
  };

  const handleInputBlur = () => {
    handleInputSubmit();
  };

  const handleInputSubmit = () => {
    const pageNum = parseInt(inputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      // 無効な値の場合は現在のページに戻す
      setInputValue(currentPage.toString());
    }
  };

  // currentPageが変更されたときにinputValueも更新
  React.useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  // 見開き表示を考慮したボタン無効化ロジック
  const isAtLastPage = viewMode === 'single' 
    ? currentPage >= totalPages
    : (currentPage === 1 ? false : currentPage + 2 > totalPages);
  
  const isAtLastSpread = viewMode === 'spread' && totalPages > 2 
    ? currentPage >= Math.max(2, totalPages - 1)
    : currentPage >= totalPages;
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            title="ズームアウト"
            onClick={onZoomOut}
            disabled={!onZoomOut}
          >
            ➖
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            title="ズームイン"
            onClick={onZoomIn}
            disabled={!onZoomIn}
          >
            ➕
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            title="フィット表示"
            onClick={onToggleFitMode}
            disabled={!onToggleFitMode}
          >
            🔍
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            title="先頭ページ"
            onClick={onGoToFirst}
            disabled={currentPage <= 1 || !onGoToFirst}
          >
            ⏮️
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            title="前のページ"
            onClick={onPreviousPage}
            disabled={currentPage <= 1 || !onPreviousPage}
          >
            ⬅️
          </Button>
          
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              / {totalPages}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            title="次のページ"
            onClick={onNextPage}
            disabled={isAtLastPage || !onNextPage}
          >
            ➡️
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            title="末尾ページ"
            onClick={onGoToLast}
            disabled={isAtLastSpread || !onGoToLast}
          >
            ⏭️
          </Button>
        </div>
      </div>
    </div>
  );
};