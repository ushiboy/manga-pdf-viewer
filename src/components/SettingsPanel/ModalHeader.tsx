import React from "react";
import { Button } from "../ui/Button";
import { SettingsIcon, CloseIcon } from "../icons";

interface ModalHeaderProps {
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h2
        id="settings-title"
        className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center"
      >
        <SettingsIcon className="w-5 h-5 mr-2" />
        設定
      </h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        aria-label="設定パネルを閉じる"
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <CloseIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};
