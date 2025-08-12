import React from 'react';
import { Button } from './ui/Button';

interface HeaderBarProps {
  isVisible: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ isVisible }) => {
  return (
    <div
      className={`absolute top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm">
            📁 ファイル選択
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="表示方式切り替え">
            📖
          </Button>
          <Button variant="ghost" size="sm" title="読み方向切り替え">
            ↔️
          </Button>
          <Button variant="ghost" size="sm" title="フルスクリーン">
            ⛶
          </Button>
          <Button variant="ghost" size="sm" title="設定">
            ⚙️
          </Button>
        </div>
      </div>
    </div>
  );
};