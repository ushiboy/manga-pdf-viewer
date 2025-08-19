import React from 'react';
import { Button } from '../ui/Button';

interface ResetSectionProps {
  onResetSettings: () => void;
  onClose: () => void;
}

export const ResetSection: React.FC<ResetSectionProps> = ({
  onResetSettings,
  onClose
}) => {
  const handleResetSettings = () => {
    const confirmed = window.confirm(
      '設定を初期値に戻しますか？\n\n' +
      '• 表示方式: 単一ページ\n' +
      '• 読み方向: 右→左（日本語）\n' +
      '• 表紙モード: ON（1ページ目を表紙として単独表示）\n\n' +
      'この操作は取り消せません。'
    );
    
    if (confirmed) {
      onResetSettings();
      // リセット後にパネルを閉じる
      onClose();
    }
  };

  return (
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
  );
};