import React from 'react';
import { Button } from '../ui/Button';
import type { ViewMode, ReadingDirection } from '../../types/settings';

interface NavigationControlsProps {
  currentPage: number;
  totalPages: number;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onGoToFirst?: () => void;
  onGoToLast?: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentPage,
  totalPages,
  viewMode,
  readingDirection,
  onPreviousPage,
  onNextPage,
  onGoToFirst,
  onGoToLast,
}) => {
  // 見開き表示を考慮したボタン無効化ロジック
  const isAtLastPage = viewMode === 'single' 
    ? currentPage >= totalPages
    : (currentPage === 1 ? false : currentPage + 2 > totalPages);
  
  const isAtLastSpread = viewMode === 'spread' && totalPages > 2 
    ? currentPage >= Math.max(2, totalPages - 1)
    : currentPage >= totalPages;

  // RTL時にボタンの機能を逆転させる（アイコンは変更しない）
  const getNavigationHandlers = () => {
    if (readingDirection === 'rtl') {
      return {
        firstHandler: onGoToLast,
        prevHandler: onNextPage,
        nextHandler: onPreviousPage,
        lastHandler: onGoToFirst,
        firstTitle: "末尾ページ",
        prevTitle: "次のページ", 
        nextTitle: "前のページ",
        lastTitle: "先頭ページ"
      };
    } else {
      return {
        firstHandler: onGoToFirst,
        prevHandler: onPreviousPage,
        nextHandler: onNextPage,
        lastHandler: onGoToLast,
        firstTitle: "先頭ページ",
        prevTitle: "前のページ",
        nextTitle: "次のページ", 
        lastTitle: "末尾ページ"
      };
    }
  };

  const nav = getNavigationHandlers();

  return (
    <div className="flex items-center space-x-4">
      <Button 
        variant="ghost" 
        size="sm" 
        title={nav.firstTitle}
        onClick={nav.firstHandler}
        disabled={
          readingDirection === 'rtl' 
            ? (isAtLastSpread || !nav.firstHandler)
            : (currentPage <= 1 || !nav.firstHandler)
        }
      >
        ⏮️
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title={nav.prevTitle}
        onClick={nav.prevHandler}
        disabled={
          readingDirection === 'rtl'
            ? (isAtLastPage || !nav.prevHandler)
            : (currentPage <= 1 || !nav.prevHandler)
        }
      >
        ⬅️
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title={nav.nextTitle}
        onClick={nav.nextHandler}
        disabled={
          readingDirection === 'rtl'
            ? (currentPage <= 1 || !nav.nextHandler)
            : (isAtLastPage || !nav.nextHandler)
        }
      >
        ➡️
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title={nav.lastTitle}
        onClick={nav.lastHandler}
        disabled={
          readingDirection === 'rtl'
            ? (currentPage <= 1 || !nav.lastHandler)
            : (isAtLastSpread || !nav.lastHandler)
        }
      >
        ⏭️
      </Button>
    </div>
  );
};