import React from 'react';

interface CoverModeSectionProps {
  treatFirstPageAsCover: boolean;
  onToggleTreatFirstPageAsCover: () => void;
}

export const CoverModeSection: React.FC<CoverModeSectionProps> = ({
  treatFirstPageAsCover,
  onToggleTreatFirstPageAsCover
}) => {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
        🏷️ 見開き設定
      </legend>
      <div className="space-y-2">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={treatFirstPageAsCover}
            onChange={onToggleTreatFirstPageAsCover}
            className="text-blue-600 focus:ring-blue-500 rounded"
          />
          <span className="text-gray-700 dark:text-gray-300">1ページ目を表紙として単独表示</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
          ON: 表紙（1ページ目）は単独、2ページ目以降見開き表示<br/>
          OFF: 1ページ目から見開き表示
        </p>
      </div>
    </fieldset>
  );
};