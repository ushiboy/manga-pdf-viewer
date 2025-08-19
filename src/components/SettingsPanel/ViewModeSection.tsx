import React from 'react';
import type { ViewMode } from '../../types/settings';

interface ViewModeSectionProps {
  viewMode: ViewMode;
  onToggleViewMode: () => void;
}

export const ViewModeSection: React.FC<ViewModeSectionProps> = ({
  viewMode,
  onToggleViewMode
}) => {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
        📖 表示方式
      </legend>
      <div className="space-y-2" role="radiogroup">
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
    </fieldset>
  );
};