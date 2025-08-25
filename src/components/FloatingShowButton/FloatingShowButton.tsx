import React from 'react';
import { Button } from '../ui/Button';

interface FloatingShowButtonProps {
  isVisible: boolean;
  onShow: () => void;
}

export const FloatingShowButton: React.FC<FloatingShowButtonProps> = ({
  isVisible,
  onShow
}) => {
  if (isVisible) return null;

  return (
    <div 
      className="fixed top-4 left-4 z-50"
      role="region"
      aria-label="UI controls"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onShow}
        title="UI表示"
        aria-label="Show UI controls"
        className="shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 !text-blue-600 dark:!text-blue-400 border border-blue-200 dark:border-blue-600 font-semibold text-lg"
      >
        ☰
      </Button>
    </div>
  );
};