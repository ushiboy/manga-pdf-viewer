import React from 'react';
import { Button } from './ui/Button';
import type { ViewMode, ReadingDirection } from '../types/settings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  onToggleViewMode: () => void;
  onToggleReadingDirection: () => void;
  onResetSettings: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  viewMode,
  readingDirection,
  onToggleViewMode,
  onToggleReadingDirection,
  onResetSettings
}) => {
  const handleResetSettings = () => {
    const confirmed = window.confirm(
      '設定を初期値に戻しますか？\n\n' +
      '• 表示方式: 単一ページ\n' +
      '• 読み方向: 右→左（日本語）\n\n' +
      'この操作は取り消せません。'
    );
    
    if (confirmed) {
      onResetSettings();
      // リセット後にパネルを閉じる
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダル本体 */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ⚙️ 設定
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </Button>
        </div>

        {/* 設定項目 */}
        <div className="p-4 space-y-6">
          {/* 表示方式 */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              📖 表示方式
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="viewMode"
                  checked={viewMode === 'single'}
                  onChange={onToggleViewMode}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">単一ページ</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="viewMode"
                  checked={viewMode === 'spread'}
                  onChange={onToggleViewMode}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">見開きページ</span>
              </label>
            </div>
          </div>

          {/* 読み方向 */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              📚 読み方向
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="readingDirection"
                  checked={readingDirection === 'rtl'}
                  onChange={onToggleReadingDirection}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">右→左（日本語）</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="readingDirection"
                  checked={readingDirection === 'ltr'}
                  onChange={onToggleReadingDirection}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">左→右（英語）</span>
              </label>
            </div>
          </div>

          {/* テーマ（将来実装） */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              🌙 テーマ
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={true}
                  disabled
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-400 dark:text-gray-500">ライト（システム設定に従う）</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={false}
                  disabled
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-400 dark:text-gray-500">ダーク（システム設定に従う）</span>
              </label>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            size="md"
            onClick={handleResetSettings}
            className="w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
          >
            🔄 設定を初期値に戻す
          </Button>
        </div>
      </div>
    </div>
  );
};