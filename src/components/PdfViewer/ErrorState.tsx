import React from 'react';
import { WarningIcon } from '../icons';

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div 
      className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
      role="alert"
      aria-label="PDF読み込みエラー"
    >
      <div className="text-center">
        <div 
          className="w-32 h-32 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center"
          aria-hidden="true"
        >
          <WarningIcon className="w-16 h-16 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          エラー
        </h2>
        <p className="text-red-500 dark:text-red-400 mb-4">
          {error}
        </p>
      </div>
    </div>
  );
};