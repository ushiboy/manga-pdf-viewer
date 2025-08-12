import { useEffect } from 'react';

interface UseKeyboardProps {
  onPreviousPage: () => void;
  onNextPage: () => void;
  onFullscreen?: () => void;
  enabled?: boolean;
}

export const useKeyboard = ({
  onPreviousPage,
  onNextPage,
  onFullscreen,
  enabled = true,
}: UseKeyboardProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合はキーボードショートカットを無効化
      const target = event.target as Element;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
        case 'Left':
          event.preventDefault();
          onPreviousPage();
          break;
        case 'ArrowRight':
        case 'Right':
          event.preventDefault();
          onNextPage();
          break;
        case 'F11':
          if (onFullscreen) {
            event.preventDefault();
            onFullscreen();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPreviousPage, onNextPage, onFullscreen, enabled]);
};