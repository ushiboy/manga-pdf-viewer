import React from "react";
import { ZoomControls } from "./ZoomControls";
import { PageInput } from "./PageInput";
import { NavigationControls } from "./NavigationControls";
import type { ViewMode, ReadingDirection } from "../../types/settings";

interface FooterBarProps {
  isVisible: boolean;
  currentPage: number;
  totalPages: number;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  onPageChange: (page: number) => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleFitMode?: () => void;
  onGoToFirst?: () => void;
  onGoToLast?: () => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  isVisible,
  currentPage,
  totalPages,
  viewMode,
  readingDirection,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onToggleFitMode,
  onGoToFirst,
  onGoToLast,
}) => {
  return (
    <div
      role="toolbar"
      aria-label="PDF viewer navigation and controls"
      className={`absolute bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <ZoomControls
          onZoomOut={onZoomOut}
          onZoomIn={onZoomIn}
          onToggleFitMode={onToggleFitMode}
        />

        <div className="flex items-center space-x-4">
          <NavigationControls
            currentPage={currentPage}
            totalPages={totalPages}
            viewMode={viewMode}
            readingDirection={readingDirection}
            onPreviousPage={onPreviousPage}
            onNextPage={onNextPage}
            onGoToFirst={onGoToFirst}
            onGoToLast={onGoToLast}
          />

          <PageInput
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
};
