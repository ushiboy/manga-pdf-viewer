import React from "react";
import { ModalHeader } from "./ModalHeader";
import { ViewModeSection } from "./ViewModeSection";
import { ReadingDirectionSection } from "./ReadingDirectionSection";
import { ThemeSection } from "./ThemeSection";
import { CoverModeSection } from "./CoverModeSection";
import { ResetSection } from "./ResetSection";
import type { ViewMode, ReadingDirection } from "../../types/settings";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  treatFirstPageAsCover: boolean;
  onToggleViewMode: () => void;
  onToggleReadingDirection: () => void;
  onToggleTreatFirstPageAsCover: () => void;
  onResetSettings: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  viewMode,
  readingDirection,
  treatFirstPageAsCover,
  onToggleViewMode,
  onToggleReadingDirection,
  onToggleTreatFirstPageAsCover,
  onResetSettings,
}) => {
  // キーボードイベントハンドラ
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  // オーバーレイクリックハンドラ
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onKeyDown={handleKeyDown}
    >
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleOverlayClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="設定パネルを閉じる"
      />

      {/* モーダル本体 */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="document"
      >
        <ModalHeader onClose={onClose} />

        {/* 設定項目 */}
        <div className="p-4 space-y-6">
          <ViewModeSection
            viewMode={viewMode}
            onToggleViewMode={onToggleViewMode}
          />

          <ReadingDirectionSection
            readingDirection={readingDirection}
            onToggleReadingDirection={onToggleReadingDirection}
          />

          <ThemeSection />

          <CoverModeSection
            treatFirstPageAsCover={treatFirstPageAsCover}
            onToggleTreatFirstPageAsCover={onToggleTreatFirstPageAsCover}
          />
        </div>

        <ResetSection onResetSettings={onResetSettings} onClose={onClose} />
      </div>
    </div>
  );
};
