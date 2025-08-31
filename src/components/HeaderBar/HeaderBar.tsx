import React, { useRef } from "react";
import { Button } from "../ui/Button";
import type { ViewMode, ReadingDirection } from "../../types/settings";
import {
  CloseIcon,
  FolderIcon,
  SinglePageIcon,
  SpreadPageIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  SettingsIcon,
} from "../icons";

interface HeaderBarProps {
  isVisible: boolean;
  onFileSelect: (file: File) => void;
  onHide: () => void;
  viewMode: ViewMode;
  readingDirection: ReadingDirection;
  onToggleViewMode: () => void;
  onToggleReadingDirection: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenSettings: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isVisible,
  onFileSelect,
  onHide,
  viewMode,
  readingDirection,
  onToggleViewMode,
  onToggleReadingDirection,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="PDF viewer controls"
      className={`absolute top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onHide}
            title="UI非表示"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleFileButtonClick}>
            <FolderIcon className="w-4 h-4 mr-2" />
            ファイル選択
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            aria-label="PDF file selection"
            aria-describedby="file-select-description"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            title={`表示方式: ${viewMode === "single" ? "単一ページ" : "見開きページ"}`}
            onClick={onToggleViewMode}
          >
            {viewMode === "single" ? (
              <SinglePageIcon className="w-4 h-4" />
            ) : (
              <SpreadPageIcon className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={`読み方向: ${readingDirection === "rtl" ? "右→左（日本語）" : "左→右（英語）"}`}
            onClick={onToggleReadingDirection}
          >
            {readingDirection === "rtl" ? (
              <ArrowLeftIcon className="w-4 h-4" />
            ) : (
              <ArrowRightIcon className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={
              isFullscreen ? "フルスクリーン終了 (F11)" : "フルスクリーン (F11)"
            }
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? (
              <ExitFullscreenIcon className="w-4 h-4" />
            ) : (
              <FullscreenIcon className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="設定"
            onClick={onOpenSettings}
          >
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
