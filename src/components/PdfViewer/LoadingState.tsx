import React from "react";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface LoadingStateProps {
  progress: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ progress }) => {
  return (
    <div
      className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
      role="status"
      aria-live="polite"
      aria-label="PDF読み込み中"
    >
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          PDFを読み込んでいます...
        </p>
        {progress > 0 && (
          <div
            className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`読み込み進行状況 ${progress}%`}
          >
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
