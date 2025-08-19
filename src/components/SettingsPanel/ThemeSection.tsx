import React from 'react';

export const ThemeSection: React.FC = () => {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
        🌙 テーマ
      </legend>
      <div className="space-y-2" role="radiogroup">
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
    </fieldset>
  );
};