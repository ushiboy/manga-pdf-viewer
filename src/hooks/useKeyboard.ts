import { useEffect } from "react";
import type { ReadingDirection } from "../types/settings";

interface UseKeyboardProps {
  onPreviousPage: () => void;
  onNextPage: () => void;
  onFullscreen?: () => void;
  enabled?: boolean;
  readingDirection: ReadingDirection;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export const useKeyboard = ({
  onPreviousPage,
  onNextPage,
  onFullscreen,
  enabled = true,
  readingDirection,
  onZoomIn,
  onZoomOut,
}: UseKeyboardProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合はキーボードショートカットを無効化
      const target = event.target as Element;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
        case "Left":
          event.preventDefault();
          // RTL（右→左読み）の場合は左キーで次のページ、LTR（左→右読み）の場合は前のページ
          if (readingDirection === "rtl") {
            onNextPage();
          } else {
            onPreviousPage();
          }
          break;
        case "ArrowRight":
        case "Right":
          event.preventDefault();
          // RTL（右→左読み）の場合は右キーで前のページ、LTR（左→右読み）の場合は次のページ
          if (readingDirection === "rtl") {
            onPreviousPage();
          } else {
            onNextPage();
          }
          break;
        case "F11":
          if (onFullscreen) {
            event.preventDefault();
            onFullscreen();
          }
          break;
        case "+":
        case "=":
          if (onZoomIn) {
            event.preventDefault();
            onZoomIn();
          }
          break;
        case "-":
        case "_":
          if (onZoomOut) {
            event.preventDefault();
            onZoomOut();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    onPreviousPage,
    onNextPage,
    onFullscreen,
    enabled,
    readingDirection,
    onZoomIn,
    onZoomOut,
  ]);
};
