import React from "react";
import type { ReadingDirection } from "../../types/settings";

interface ReadingDirectionSectionProps {
  readingDirection: ReadingDirection;
  onToggleReadingDirection: () => void;
}

export const ReadingDirectionSection: React.FC<
  ReadingDirectionSectionProps
> = ({ readingDirection, onToggleReadingDirection }) => {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
        📚 読み方向
      </legend>
      <div className="space-y-2" role="radiogroup">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="readingDirection"
            checked={readingDirection === "rtl"}
            onChange={onToggleReadingDirection}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-300">
            右→左（日本語）
          </span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="readingDirection"
            checked={readingDirection === "ltr"}
            onChange={onToggleReadingDirection}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-300">
            左→右（英語）
          </span>
        </label>
      </div>
    </fieldset>
  );
};
