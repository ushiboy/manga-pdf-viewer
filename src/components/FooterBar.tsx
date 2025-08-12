import React from 'react';
import { Button } from './ui/Button';

interface FooterBarProps {
  isVisible: boolean;
  currentPage: number;
  totalPages: number;
}

export const FooterBar: React.FC<FooterBarProps> = ({ 
  isVisible, 
  currentPage, 
  totalPages 
}) => {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="ズームアウト">
            ➖
          </Button>
          <Button variant="ghost" size="sm" title="ズームイン">
            ➕
          </Button>
          <Button variant="ghost" size="sm" title="フィット表示">
            🔍
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" title="前のページ">
            ⬅️
          </Button>
          
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              / {totalPages}
            </span>
          </div>
          
          <Button variant="ghost" size="sm" title="次のページ">
            ➡️
          </Button>
        </div>
      </div>
    </div>
  );
};